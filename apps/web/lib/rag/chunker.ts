/**
 * Section-aware text chunker with parent-child hierarchy.
 *
 * Strategy:
 * - Parent chunks: ~1200 chars for full context retrieval
 * - Child chunks: ~300 chars for precise semantic matching
 * - Children reference their parent by index
 * - Never split mid-sentence
 * - Track section titles and page numbers through chunks
 */

export interface Chunk {
  content: string;
  sectionTitle: string | null;
  pageNumber: number | null;
  chunkIndex: number;
  isChild: boolean;
  parentIndex: number | null; // which parent chunk this belongs to
}

interface ChunkOptions {
  maxChars?: number;
  overlapChars?: number;
  minChars?: number;
}

const SECTION_PATTERN = /^(?:#{1,4}\s+.+|(?:\d+\.)+\s+.+|[A-Z][A-Z\s]{3,}$)/m;

const PARENT_DEFAULTS: ChunkOptions = {
  maxChars: 1200,
  overlapChars: 150,
  minChars: 50,
};

const CHILD_DEFAULTS: ChunkOptions = {
  maxChars: 300,
  overlapChars: 50,
  minChars: 30,
};

/**
 * Split text into parent and child chunks.
 * Parents provide context; children provide precise matching.
 */
export function chunkText(
  text: string,
  pages?: { pageNumber: number; text: string }[],
  options?: ChunkOptions
): Chunk[] {
  // Generate parent chunks (~1200 chars)
  const parentOpts = {
    maxChars: options?.maxChars ?? PARENT_DEFAULTS.maxChars,
    overlapChars: options?.overlapChars ?? PARENT_DEFAULTS.overlapChars,
    minChars: options?.minChars ?? PARENT_DEFAULTS.minChars,
  };

  let rawParents: Chunk[];
  if (pages && pages.length > 1) {
    rawParents = chunkPages(pages, parentOpts.maxChars!, parentOpts.overlapChars!, parentOpts.minChars!);
  } else {
    rawParents = chunkSingleText(text, null, parentOpts.maxChars!, parentOpts.overlapChars!, parentOpts.minChars!);
  }

  // Mark parents
  const parents: Chunk[] = rawParents.map((c, i) => ({
    ...c,
    chunkIndex: i,
    isChild: false,
    parentIndex: null,
  }));

  // Generate child chunks (~300 chars) from each parent
  const children: Chunk[] = [];
  let childIndex = parents.length; // children are indexed after parents

  for (const parent of parents) {
    const rawChildren = chunkSingleText(
      parent.content,
      parent.pageNumber,
      CHILD_DEFAULTS.maxChars!,
      CHILD_DEFAULTS.overlapChars!,
      CHILD_DEFAULTS.minChars!,
    );

    for (const child of rawChildren) {
      children.push({
        ...child,
        sectionTitle: child.sectionTitle ?? parent.sectionTitle,
        chunkIndex: childIndex++,
        isChild: true,
        parentIndex: parent.chunkIndex,
      });
    }
  }

  return [...parents, ...children];
}

function chunkPages(
  pages: { pageNumber: number; text: string }[],
  maxChars: number,
  overlapChars: number,
  minChars: number
): Chunk[] {
  const allChunks: Chunk[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    const pageChunks = chunkSingleText(
      page.text,
      page.pageNumber,
      maxChars,
      overlapChars,
      minChars
    );

    for (const chunk of pageChunks) {
      allChunks.push({ ...chunk, chunkIndex: globalIndex++ });
    }
  }

  return allChunks;
}

function chunkSingleText(
  text: string,
  pageNumber: number | null,
  maxChars: number,
  overlapChars: number,
  minChars: number
): Chunk[] {
  const chunks: Chunk[] = [];
  let currentSection: string | null = null;

  // Split into paragraphs (double newline or section breaks)
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());

  let buffer = "";
  let chunkIndex = 0;

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    // Detect section headers
    const sectionMatch = trimmed.match(SECTION_PATTERN);
    if (sectionMatch) {
      // Flush buffer before new section
      if (buffer.trim().length >= minChars) {
        chunks.push({
          content: buffer.trim(),
          sectionTitle: currentSection,
          pageNumber,
          chunkIndex: chunkIndex++,
          isChild: false,
          parentIndex: null,
        });
        // Keep overlap from end of buffer
        buffer = getOverlap(buffer, overlapChars);
      }
      currentSection = trimmed.replace(/^#+\s*/, "").trim();
    }

    // Would adding this paragraph exceed max?
    if (buffer.length + trimmed.length + 2 > maxChars && buffer.trim().length >= minChars) {
      chunks.push({
        content: buffer.trim(),
        sectionTitle: currentSection,
        pageNumber,
        chunkIndex: chunkIndex++,
        isChild: false,
        parentIndex: null,
      });
      buffer = getOverlap(buffer, overlapChars);
    }

    buffer += (buffer ? "\n\n" : "") + trimmed;
  }

  // Flush remaining
  if (buffer.trim().length >= minChars) {
    chunks.push({
      content: buffer.trim(),
      sectionTitle: currentSection,
      pageNumber,
      chunkIndex: chunkIndex++,
      isChild: false,
      parentIndex: null,
    });
  } else if (buffer.trim() && chunks.length > 0) {
    // Merge tiny remainder into last chunk
    chunks[chunks.length - 1].content += "\n\n" + buffer.trim();
  } else if (buffer.trim()) {
    // Only chunk and it's small — keep it anyway
    chunks.push({
      content: buffer.trim(),
      sectionTitle: currentSection,
      pageNumber,
      chunkIndex: chunkIndex++,
      isChild: false,
      parentIndex: null,
    });
  }

  return chunks;
}

function getOverlap(text: string, chars: number): string {
  if (text.length <= chars) return text;

  // Take last N chars, but start at a sentence boundary if possible
  const tail = text.slice(-chars);
  const sentenceStart = tail.search(/[.!?]\s+[A-Z]/);
  if (sentenceStart >= 0) {
    return tail.slice(sentenceStart + 2);
  }
  return tail;
}
