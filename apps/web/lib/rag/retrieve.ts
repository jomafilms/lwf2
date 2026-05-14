/**
 * Hybrid retrieval: vector similarity + full-text search,
 * reranked with Cohere (when available), then trust tier boosted.
 */

import { db } from "@lwf/database";
import { sql } from "drizzle-orm";
import { embedOne } from "./embeddings";
import { rerank } from "./rerank";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  docType: string;
  trustTier: number;
  content: string;
  sectionTitle: string | null;
  pageNumber: number | null;
  score: number; // combined relevance score
}

interface RetrieveOptions {
  query: string;
  limit?: number;
  docType?: string;
  trustTier?: number;
  minScore?: number;
}

// Trust tier boost multipliers (inspired by fire_shield)
const TIER_BOOST: Record<number, number> = {
  1: 1.2, // Local code
  2: 1.1, // Agency guidance
  3: 1.05, // Fire science
  4: 1.0, // General
};

/**
 * Search the knowledge base using hybrid retrieval with parent-child chunking.
 *
 * Strategy: search against small child chunks (precise matching), then
 * return the larger parent chunk (full context). Deduplicates by parent ID
 * so multiple child hits from the same parent don't produce duplicates.
 */
export async function retrieve(options: RetrieveOptions): Promise<RetrievedChunk[]> {
  const { query, limit = 10, docType, trustTier, minScore = 0.3 } = options;

  // Get query embedding
  const queryEmbedding = await embedOne(query);
  const vecStr = `[${queryEmbedding.join(",")}]`;

  // Vector similarity search — only child chunks have embeddings.
  // JOIN to parent to return the larger context chunk.
  const vectorResults = await db.execute(sql`
    SELECT
      child.id as chunk_id,
      child.parent_id,
      COALESCE(parent.content, child.content) as content,
      COALESCE(parent.section_title, child.section_title) as section_title,
      COALESCE(parent.page_number, child.page_number) as page_number,
      child.document_id,
      d.title as document_title,
      d.doc_type,
      d.trust_tier,
      1 - (child.embedding <=> ${vecStr}::vector) as vector_score
    FROM knowledge_chunks child
    LEFT JOIN knowledge_chunks parent ON child.parent_id = parent.id
    JOIN knowledge_documents d ON child.document_id = d.id
    WHERE d.status = 'ready'
      ${docType ? sql`AND d.doc_type = ${docType}` : sql``}
      ${trustTier ? sql`AND d.trust_tier = ${trustTier}` : sql``}
      AND child.embedding IS NOT NULL
    ORDER BY child.embedding <=> ${vecStr}::vector
    LIMIT 30
  `);

  // Full-text search on child chunks, return parent content
  const ftsResults = await db.execute(sql`
    SELECT
      child.id as chunk_id,
      child.parent_id,
      COALESCE(parent.content, child.content) as content,
      COALESCE(parent.section_title, child.section_title) as section_title,
      COALESCE(parent.page_number, child.page_number) as page_number,
      child.document_id,
      d.title as document_title,
      d.doc_type,
      d.trust_tier,
      ts_rank(
        to_tsvector('english', child.content),
        plainto_tsquery('english', ${query})
      ) as fts_score
    FROM knowledge_chunks child
    LEFT JOIN knowledge_chunks parent ON child.parent_id = parent.id
    JOIN knowledge_documents d ON child.document_id = d.id
    WHERE d.status = 'ready'
      ${docType ? sql`AND d.doc_type = ${docType}` : sql``}
      ${trustTier ? sql`AND d.trust_tier = ${trustTier}` : sql``}
      AND child.embedding IS NOT NULL
      AND to_tsvector('english', child.content) @@ plainto_tsquery('english', ${query})
    ORDER BY fts_score DESC
    LIMIT 30
  `);

  // ── Merge results, deduplicate by parent_id ──
  // Multiple child matches from the same parent collapse into one result
  const merged = new Map<string, RetrievedChunk>();

  for (const row of vectorResults.rows as Record<string, unknown>[]) {
    const dedupeKey = (row.parent_id as string) || (row.chunk_id as string);
    const vectorScore = row.vector_score as number;

    // Keep the highest-scoring child match per parent
    if (merged.has(dedupeKey) && merged.get(dedupeKey)!.score >= vectorScore) continue;

    merged.set(dedupeKey, {
      chunkId: dedupeKey,
      documentId: row.document_id as string,
      documentTitle: row.document_title as string,
      docType: row.doc_type as string,
      trustTier: row.trust_tier as number,
      content: row.content as string,
      sectionTitle: (row.section_title as string) || null,
      pageNumber: (row.page_number as number) || null,
      score: vectorScore,
    });
  }

  for (const row of ftsResults.rows as Record<string, unknown>[]) {
    const dedupeKey = (row.parent_id as string) || (row.chunk_id as string);
    const ftsScore = row.fts_score as number;
    // Normalize FTS score to 0-1 range (rough)
    const normalizedFts = Math.min(ftsScore / 0.5, 1.0);

    if (merged.has(dedupeKey)) {
      // Boost chunks that appear in both searches
      const existing = merged.get(dedupeKey)!;
      existing.score = existing.score * 0.7 + normalizedFts * 0.3 + 0.1; // blend + bonus
    } else {
      merged.set(dedupeKey, {
        chunkId: dedupeKey,
        documentId: row.document_id as string,
        documentTitle: row.document_title as string,
        docType: row.doc_type as string,
        trustTier: row.trust_tier as number,
        content: row.content as string,
        sectionTitle: (row.section_title as string) || null,
        pageNumber: (row.page_number as number) || null,
        score: normalizedFts * 0.5, // FTS-only results get lower weight
      });
    }
  }

  // Sort by hybrid score and take top candidates for reranking
  const RERANK_POOL = 30;
  const candidates = Array.from(merged.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, RERANK_POOL);

  // ── Rerank with Cohere (graceful fallback to passthrough) ──
  const rerankResults = await rerank(
    query,
    candidates.map((c) => c.content),
    limit,
  );

  // Build final results: blend rerank score with original hybrid score
  const reranked: RetrievedChunk[] = rerankResults.map((r) => {
    const chunk = candidates[r.index];
    // If reranker returned a real score, blend it with the original;
    // passthrough returns 0, so we just keep the original score.
    const hasRerankScore = r.relevanceScore > 0;
    const blendedScore = hasRerankScore
      ? r.relevanceScore * 0.7 + chunk.score * 0.3
      : chunk.score;

    return { ...chunk, score: blendedScore };
  });

  // ── Apply trust tier boost on the final scores ──
  for (const chunk of reranked) {
    chunk.score *= TIER_BOOST[chunk.trustTier] ?? 1.0;
  }

  // Sort by final score, filter by minimum, take top N
  return reranked
    .filter((c) => c.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Format retrieved chunks for injection into Claude's context.
 * Produces numbered citations like fire_shield: [1] [TIER-1-LOCAL-CODE] ...
 */
export function formatChunksForContext(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "";

  const tierLabels: Record<number, string> = {
    1: "LOCAL-CODE",
    2: "AGENCY",
    3: "SCIENCE",
    4: "GENERAL",
  };

  const lines = chunks.map((chunk, i) => {
    const tier = tierLabels[chunk.trustTier] || "GENERAL";
    const page = chunk.pageNumber ? `, p.${chunk.pageNumber}` : "";
    const section = chunk.sectionTitle ? ` — ${chunk.sectionTitle}` : "";
    return `[${i + 1}] [TIER-${chunk.trustTier}-${tier}] ${chunk.documentTitle}${section}${page}\n${chunk.content}`;
  });

  return lines.join("\n\n---\n\n");
}
