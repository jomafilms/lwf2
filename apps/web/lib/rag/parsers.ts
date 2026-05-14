/**
 * Document parsers — extract text from PDFs, web pages, and plain text.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buffer: Buffer) => Promise<{
  text: string;
  numpages: number;
  info: Record<string, string>;
}>;
import * as cheerio from "cheerio";

export interface ParsedDocument {
  text: string;
  title?: string;
  pages?: { pageNumber: number; text: string }[];
  metadata?: Record<string, unknown>;
}

// ── PDF Parser ──────────────────────────────────────────────────────

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  const result = await pdfParse(buffer);

  // pdf-parse doesn't split by page natively, but we can approximate
  // by splitting on form-feed characters that many PDFs include
  const rawPages = result.text.split("\f").filter((p: string) => p.trim());
  const pages = rawPages.map((pageText: string, i: number) => ({
    pageNumber: i + 1,
    text: pageText.trim(),
  }));

  return {
    text: result.text,
    title: result.info?.Title || undefined,
    pages: pages.length > 1 ? pages : undefined,
    metadata: {
      pageCount: result.numpages,
      author: result.info?.Author,
      creator: result.info?.Creator,
    },
  };
}

// ── Web/HTML Parser ─────────────────────────────────────────────────

export async function parseWeb(url: string): Promise<ParsedDocument> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "LWF-Bot/1.0 (fire-safe landscaping knowledge base)",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }

  const html = await res.text();
  return parseHtml(html, url);
}

export function parseHtml(html: string, sourceUrl?: string): ParsedDocument {
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, footer, header, aside, iframe, noscript").remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  // Extract title
  const title =
    $("h1").first().text().trim() ||
    $("title").text().trim() ||
    undefined;

  // Extract main content, falling back to body
  const main = $("main, article, [role='main'], .content, #content");
  const contentEl = main.length > 0 ? main.first() : $("body");

  // Get text with some structure preserved
  const text = contentEl
    .find("p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, pre")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 0)
    .join("\n\n");

  return {
    text: text || contentEl.text().trim(),
    title,
    metadata: { sourceUrl },
  };
}

// ── DOCX Parser ─────────────────────────────────────────────────────

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const mammoth = await import("mammoth");
  const result = await mammoth.convertToHtml({ buffer });
  const $ = cheerio.load(result.value);
  const text = $("body").text().trim();
  return { text, metadata: { format: "docx" } };
}

// ── RTF Parser ──────────────────────────────────────────────────────

export function parseRtf(buffer: Buffer): ParsedDocument {
  const raw = buffer.toString("utf-8");
  // Strip RTF control words and groups, keep text content
  const text = raw
    .replace(/\{\\[^{}]*\}/g, "") // remove nested groups like {\fonttbl ...}
    .replace(/\\[a-z]+\d*\s?/gi, "") // remove control words like \par \b1
    .replace(/[{}]/g, "") // remove remaining braces
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n") // collapse excessive newlines
    .trim();
  return { text, metadata: { format: "rtf" } };
}

// ── Plain Text Parser ───────────────────────────────────────────────

export function parseText(content: string, title?: string): ParsedDocument {
  return {
    text: content,
    title,
  };
}

// ── Fetch + detect format ───────────────────────────────────────────

export async function parseUrl(url: string): Promise<ParsedDocument> {
  // If it looks like a PDF link, fetch as buffer
  if (url.toLowerCase().endsWith(".pdf")) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const doc = await parsePdf(buffer);
    doc.metadata = { ...doc.metadata, sourceUrl: url };
    return doc;
  }

  // Otherwise treat as web page
  return parseWeb(url);
}
