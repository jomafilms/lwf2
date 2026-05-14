/**
 * Reranker abstraction — improves retrieval precision by rescoring chunks
 * against the original query using a cross-encoder model.
 *
 * Providers:
 *   - "cohere" → Cohere Rerank v3.5 (needs COHERE_API_KEY)
 *   - "none"   → Passthrough fallback (no reranking, keeps original scores)
 */

export interface RerankResult {
  index: number;
  relevanceScore: number;
}

// ── Cohere ─────────────────────────────────────────────────────────

async function rerankCohere(
  query: string,
  documents: string[],
  topN: number,
): Promise<RerankResult[]> {
  const apiKey = process.env.COHERE_API_KEY;
  if (!apiKey) throw new Error("COHERE_API_KEY not set");

  const res = await fetch("https://api.cohere.com/v2/rerank", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "rerank-v3.5",
      query,
      documents,
      top_n: topN,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cohere rerank failed: ${res.status} ${err}`);
  }

  const json = (await res.json()) as {
    results: { index: number; relevance_score: number }[];
  };

  return json.results.map((r) => ({
    index: r.index,
    relevanceScore: r.relevance_score,
  }));
}

// ── Passthrough (no reranking) ─────────────────────────────────────

function rerankNone(documents: string[]): RerankResult[] {
  return documents.map((_, i) => ({
    index: i,
    relevanceScore: 0,
  }));
}

// ── Public API ─────────────────────────────────────────────────────

/**
 * Rerank documents against a query.
 *
 * If COHERE_API_KEY is set, uses Cohere Rerank v3.5.
 * Otherwise falls back to passthrough (no reranking).
 *
 * Returns results sorted by relevance score descending.
 */
export async function rerank(
  query: string,
  documents: string[],
  topN?: number,
): Promise<RerankResult[]> {
  if (documents.length === 0) return [];

  const n = topN ?? documents.length;
  const hasCohere = !!process.env.COHERE_API_KEY;

  if (hasCohere) {
    try {
      return await rerankCohere(query, documents, n);
    } catch (err) {
      console.warn("[rerank] Cohere rerank failed, falling back to passthrough:", err);
      return rerankNone(documents).slice(0, n);
    }
  }

  return rerankNone(documents).slice(0, n);
}
