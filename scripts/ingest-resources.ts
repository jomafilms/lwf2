#!/usr/bin/env npx tsx
/**
 * CLI script to ingest documents into the knowledge base.
 *
 * Usage:
 *   npx tsx scripts/ingest-resources.ts --lwf-resources    # Ingest all LWF /resources links
 *   npx tsx scripts/ingest-resources.ts --url <url> --title "Doc Title" --type cwpp --tier 2
 *   npx tsx scripts/ingest-resources.ts --pdf <path> --title "Doc Title" --type ccr --tier 1
 *   npx tsx scripts/ingest-resources.ts --list              # List all ingested documents
 */

import { ingestUrl, ingestPdfBuffer, listDocuments } from "../apps/web/lib/rag/ingest";
import { readFileSync } from "fs";

const LWF_API_BASE =
  process.env.NEXT_PUBLIC_LWF_API_BASE || "https://lwf-api.vercel.app/api/v1";

interface ResourceSection {
  id: string;
  title: string;
  description?: string;
  subsections?: {
    title: string;
    links: { title: string; url: string; description?: string }[];
  }[];
  links?: { title: string; url: string; description?: string }[];
}

async function fetchLwfResources(): Promise<ResourceSection[]> {
  const res = await fetch(`${LWF_API_BASE}/resources?limit=100`);
  if (!res.ok) throw new Error(`Failed to fetch resources: ${res.status}`);
  const json = (await res.json()) as { data: ResourceSection[] };
  return json.data;
}

async function ingestLwfResources() {
  console.log("Fetching LWF resources...");
  const sections = await fetchLwfResources();

  let total = 0;
  let success = 0;
  let skipped = 0;

  for (const section of sections) {
    const allLinks = [
      ...(section.links || []),
      ...(section.subsections?.flatMap((s) => s.links) || []),
    ];

    for (const link of allLinks) {
      total++;
      const url = link.url;

      // Skip non-document links (YouTube, etc.)
      if (
        url.includes("youtube.com") ||
        url.includes("youtu.be") ||
        url.includes("vimeo.com")
      ) {
        console.log(`  SKIP (video): ${link.title}`);
        skipped++;
        continue;
      }

      console.log(`  Ingesting: ${link.title} (${url})`);
      try {
        const isPdf = url.toLowerCase().endsWith(".pdf");
        const result = await ingestUrl(url, {
          title: link.title,
          docType: isPdf ? "pdf" : "web",
          trustTier: guessTrustTier(link.title, section.title),
          metadata: {
            section: section.title,
            description: link.description,
          },
        });

        if (result.status === "ready") {
          console.log(`    ✓ ${result.chunksCreated} chunks`);
          success++;
        } else {
          console.log(`    ✗ Error: ${result.error}`);
        }
      } catch (err) {
        console.log(`    ✗ ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }

  console.log(`\nDone: ${success}/${total} ingested, ${skipped} skipped`);
}

function guessTrustTier(title: string, sectionTitle: string): number {
  const text = `${title} ${sectionTitle}`.toLowerCase();

  // Tier 1: Local codes and ordinances
  if (text.match(/ordinance|code|regulation|requirement|standard|ccr|cc&r|hoa/)) {
    return 1;
  }
  // Tier 2: Agency guidance (CWPP, FEMA, ODF, county plans)
  if (text.match(/cwpp|community wildfire|fema|odf|county|state|agency|department|plan/)) {
    return 2;
  }
  // Tier 3: Fire science and research
  if (text.match(/research|science|study|journal|university|nfpa|ibhs/)) {
    return 3;
  }
  // Tier 4: General / educational
  return 4;
}

async function ingestSingleUrl(url: string, title: string, docType: string, tier: number) {
  console.log(`Ingesting: ${title} (${url})`);
  const result = await ingestUrl(url, {
    title,
    docType: docType as "pdf" | "web" | "text" | "cwpp" | "ccr" | "guide",
    trustTier: tier,
  });

  if (result.status === "ready") {
    console.log(`✓ ${result.chunksCreated} chunks created`);
  } else {
    console.log(`✗ Error: ${result.error}`);
  }
}

async function ingestPdfFile(path: string, title: string, docType: string, tier: number) {
  console.log(`Ingesting PDF: ${title} (${path})`);
  const buffer = readFileSync(path);
  const result = await ingestPdfBuffer(buffer, {
    title,
    docType: docType as "pdf" | "web" | "text" | "cwpp" | "ccr" | "guide",
    trustTier: tier,
  });

  if (result.status === "ready") {
    console.log(`✓ ${result.chunksCreated} chunks created`);
  } else {
    console.log(`✗ Error: ${result.error}`);
  }
}

async function list() {
  const docs = await listDocuments();
  if (docs.length === 0) {
    console.log("No documents ingested yet.");
    return;
  }

  console.log(`\n${docs.length} documents:\n`);
  for (const doc of docs) {
    const tier = ["", "LOCAL-CODE", "AGENCY", "SCIENCE", "GENERAL"][doc.trustTier];
    console.log(
      `  [${doc.status}] [TIER-${doc.trustTier}-${tier}] ${doc.title} (${doc.chunkCount} chunks)`
    );
  }
}

// ── CLI ─────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--list")) {
    await list();
  } else if (args.includes("--lwf-resources")) {
    await ingestLwfResources();
  } else if (args.includes("--url")) {
    const url = args[args.indexOf("--url") + 1];
    const title = args[args.indexOf("--title") + 1] || url;
    const docType = args.includes("--type") ? args[args.indexOf("--type") + 1] : "web";
    const tier = args.includes("--tier") ? parseInt(args[args.indexOf("--tier") + 1]) : 4;
    await ingestSingleUrl(url, title, docType, tier);
  } else if (args.includes("--pdf")) {
    const path = args[args.indexOf("--pdf") + 1];
    const title = args[args.indexOf("--title") + 1] || path;
    const docType = args.includes("--type") ? args[args.indexOf("--type") + 1] : "pdf";
    const tier = args.includes("--tier") ? parseInt(args[args.indexOf("--tier") + 1]) : 4;
    await ingestPdfFile(path, title, docType, tier);
  } else {
    console.log(`Usage:
  npx tsx scripts/ingest-resources.ts --lwf-resources
  npx tsx scripts/ingest-resources.ts --url <url> --title "Title" --type cwpp --tier 2
  npx tsx scripts/ingest-resources.ts --pdf <path> --title "Title" --type pdf --tier 1
  npx tsx scripts/ingest-resources.ts --list`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
