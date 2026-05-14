/**
 * Document ingestion pipeline.
 *
 * Flow: parse → chunk → embed → store in pgvector
 */

import { db, knowledgeDocuments, knowledgeChunks } from "@lwf/database";
import { eq, sql } from "drizzle-orm";
import { parsePdf, parseUrl, parseText, parseDocx, parseRtf } from "./parsers";
import { chunkText } from "./chunker";
import { embed } from "./embeddings";

export interface IngestOptions {
  title: string;
  docType: "pdf" | "web" | "text" | "cwpp" | "ccr" | "guide";
  trustTier?: number; // 1-4, default 4
  metadata?: Record<string, unknown>;
}

interface IngestResult {
  documentId: string;
  chunksCreated: number;
  status: "ready" | "error";
  error?: string;
}

const EMBED_BATCH_SIZE = 20;

/**
 * Ingest a document from a URL (PDF or web page).
 */
export async function ingestUrl(
  url: string,
  options: IngestOptions
): Promise<IngestResult> {
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      title: options.title,
      sourceUrl: url,
      docType: options.docType,
      trustTier: options.trustTier ?? 4,
      status: "processing",
      metadata: options.metadata ?? {},
    })
    .returning();

  try {
    const parsed = await parseUrl(url);
    return await processDocument(doc.id, parsed.text, parsed.pages, {
      ...options,
      metadata: { ...options.metadata, ...parsed.metadata, parsedTitle: parsed.title },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(knowledgeDocuments)
      .set({ status: "error", errorMessage: message })
      .where(eq(knowledgeDocuments.id, doc.id));
    return { documentId: doc.id, chunksCreated: 0, status: "error", error: message };
  }
}

/**
 * Ingest a PDF from a buffer (for file uploads).
 */
export async function ingestPdfBuffer(
  buffer: Buffer,
  options: IngestOptions
): Promise<IngestResult> {
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      title: options.title,
      docType: options.docType,
      trustTier: options.trustTier ?? 4,
      status: "processing",
      metadata: options.metadata ?? {},
    })
    .returning();

  try {
    const parsed = await parsePdf(buffer);
    return await processDocument(doc.id, parsed.text, parsed.pages, {
      ...options,
      metadata: { ...options.metadata, ...parsed.metadata },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(knowledgeDocuments)
      .set({ status: "error", errorMessage: message })
      .where(eq(knowledgeDocuments.id, doc.id));
    return { documentId: doc.id, chunksCreated: 0, status: "error", error: message };
  }
}

/**
 * Ingest plain text content.
 */
export async function ingestText(
  content: string,
  options: IngestOptions
): Promise<IngestResult> {
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      title: options.title,
      docType: options.docType,
      trustTier: options.trustTier ?? 4,
      status: "processing",
      metadata: options.metadata ?? {},
    })
    .returning();

  try {
    const parsed = parseText(content, options.title);
    return await processDocument(doc.id, parsed.text, parsed.pages, options);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(knowledgeDocuments)
      .set({ status: "error", errorMessage: message })
      .where(eq(knowledgeDocuments.id, doc.id));
    return { documentId: doc.id, chunksCreated: 0, status: "error", error: message };
  }
}

// ── Internal ────────────────────────────────────────────────────────

async function processDocument(
  documentId: string,
  text: string,
  pages: { pageNumber: number; text: string }[] | undefined,
  options: IngestOptions
): Promise<IngestResult> {
  // Chunk into parent + child hierarchy
  const allChunks = chunkText(text, pages);
  const parents = allChunks.filter((c) => !c.isChild);
  const children = allChunks.filter((c) => c.isChild);

  if (parents.length === 0) {
    await db
      .update(knowledgeDocuments)
      .set({ status: "error", errorMessage: "No content extracted" })
      .where(eq(knowledgeDocuments.id, documentId));
    return { documentId, chunksCreated: 0, status: "error", error: "No content extracted" };
  }

  // 1. Store parent chunks (no embeddings — retrieved by ID after child matches)
  const parentValues = parents.map((chunk) => ({
    documentId,
    content: chunk.content,
    sectionTitle: chunk.sectionTitle,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    parentId: null as string | null,
    embedding: null as number[] | null,
    metadata: options.metadata ?? {},
  }));

  const insertedParents = await db
    .insert(knowledgeChunks)
    .values(parentValues)
    .returning({ id: knowledgeChunks.id, chunkIndex: knowledgeChunks.chunkIndex });

  // Map parent chunkIndex -> DB id
  const parentIndexToId = new Map<number, string>();
  for (const p of insertedParents) {
    parentIndexToId.set(p.chunkIndex, p.id);
  }

  // 2. Embed only child chunks (these are what vector search matches against)
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < children.length; i += EMBED_BATCH_SIZE) {
    const batch = children.slice(i, i + EMBED_BATCH_SIZE);
    const texts = batch.map((c) => {
      const prefix = c.sectionTitle ? `${c.sectionTitle}: ` : "";
      return prefix + c.content;
    });
    const embeddings = await embed(texts);
    allEmbeddings.push(...embeddings);
  }

  // 3. Store child chunks with parentId and embeddings
  const childValues = children.map((chunk, i) => ({
    documentId,
    content: chunk.content,
    sectionTitle: chunk.sectionTitle,
    pageNumber: chunk.pageNumber,
    chunkIndex: chunk.chunkIndex,
    parentId: chunk.parentIndex !== null ? (parentIndexToId.get(chunk.parentIndex) ?? null) : null,
    embedding: allEmbeddings[i],
    metadata: options.metadata ?? {},
  }));

  if (childValues.length > 0) {
    await db.insert(knowledgeChunks).values(childValues);
  }

  const totalChunks = parents.length + children.length;

  // Update document status
  await db
    .update(knowledgeDocuments)
    .set({
      status: "ready",
      chunkCount: totalChunks,
      metadata: options.metadata,
    })
    .where(eq(knowledgeDocuments.id, documentId));

  return { documentId, chunksCreated: totalChunks, status: "ready" };
}

/**
 * Ingest a local file (PDF, DOCX, RTF, or plain text).
 */
export async function ingestFile(
  buffer: Buffer,
  filename: string,
  options: IngestOptions
): Promise<IngestResult> {
  const [doc] = await db
    .insert(knowledgeDocuments)
    .values({
      title: options.title,
      docType: options.docType,
      trustTier: options.trustTier ?? 4,
      status: "processing",
      metadata: { ...options.metadata, sourceFile: filename },
    })
    .returning();

  try {
    const ext = filename.toLowerCase().split(".").pop();
    let parsed;

    switch (ext) {
      case "pdf":
        parsed = await parsePdf(buffer);
        break;
      case "docx":
        parsed = await parseDocx(buffer);
        break;
      case "rtf":
        parsed = parseRtf(buffer);
        break;
      case "txt":
      case "md":
        parsed = parseText(buffer.toString("utf-8"), options.title);
        break;
      default:
        throw new Error(`Unsupported file format: .${ext}`);
    }

    return await processDocument(doc.id, parsed.text, parsed.pages, {
      ...options,
      metadata: { ...options.metadata, sourceFile: filename, ...parsed.metadata },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db
      .update(knowledgeDocuments)
      .set({ status: "error", errorMessage: message })
      .where(eq(knowledgeDocuments.id, doc.id));
    return { documentId: doc.id, chunksCreated: 0, status: "error", error: message };
  }
}

/**
 * Delete a document and all its chunks.
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await db
    .delete(knowledgeDocuments)
    .where(eq(knowledgeDocuments.id, documentId));
}

/**
 * List all ingested documents.
 */
export async function listDocuments() {
  return db
    .select({
      id: knowledgeDocuments.id,
      title: knowledgeDocuments.title,
      sourceUrl: knowledgeDocuments.sourceUrl,
      docType: knowledgeDocuments.docType,
      trustTier: knowledgeDocuments.trustTier,
      status: knowledgeDocuments.status,
      chunkCount: knowledgeDocuments.chunkCount,
      createdAt: knowledgeDocuments.createdAt,
    })
    .from(knowledgeDocuments)
    .orderBy(knowledgeDocuments.createdAt);
}
