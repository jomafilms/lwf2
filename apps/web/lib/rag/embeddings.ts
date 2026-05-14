/**
 * Embedding abstraction — swap providers by changing EMBEDDING_PROVIDER env var.
 *
 * Supported providers:
 *   - "openai"  → OpenAI text-embedding-3-small (1536 dims, needs OPENAI_API_KEY)
 *   - "ollama"  → Local Ollama nomic-embed-text (1536 dims padded, needs Ollama running)
 */

export const EMBEDDING_DIM = 1536;

type EmbedFn = (texts: string[]) => Promise<number[][]>;

// ── OpenAI ──────────────────────────────────────────────────────────

async function embedOpenAI(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not set");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: texts,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI embeddings failed: ${res.status} ${err}`);
  }

  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
  };

  // Sort by index to match input order
  return json.data
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

// ── Ollama ──────────────────────────────────────────────────────────

async function embedOllama(texts: string[]): Promise<number[][]> {
  const host = process.env.OLLAMA_HOST || "http://localhost:11434";
  const model = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

  const results: number[][] = [];

  for (const text of texts) {
    const res = await fetch(`${host}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input: text }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Ollama embed failed: ${res.status} ${err}`);
    }

    const json = (await res.json()) as { embeddings: number[][] };
    let vec = json.embeddings[0];

    // Pad or truncate to EMBEDDING_DIM for pgvector compatibility
    if (vec.length < EMBEDDING_DIM) {
      vec = [...vec, ...new Array(EMBEDDING_DIM - vec.length).fill(0)];
    } else if (vec.length > EMBEDDING_DIM) {
      vec = vec.slice(0, EMBEDDING_DIM);
    }

    results.push(vec);
  }

  return results;
}

// ── Provider selection ──────────────────────────────────────────────

function getProvider(): EmbedFn {
  const provider = process.env.EMBEDDING_PROVIDER || "openai";
  switch (provider) {
    case "openai":
      return embedOpenAI;
    case "ollama":
      return embedOllama;
    default:
      throw new Error(`Unknown EMBEDDING_PROVIDER: ${provider}`);
  }
}

/**
 * Embed one or more texts. Returns one vector per input text.
 */
export async function embed(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const fn = getProvider();
  return fn(texts);
}

/**
 * Embed a single text. Convenience wrapper.
 */
export async function embedOne(text: string): Promise<number[]> {
  const [vec] = await embed([text]);
  return vec;
}
