/**
 * Conversation summary generation and retrieval.
 * Gives the chat agent memory across sessions by summarizing past conversations
 * and retrieving relevant ones via vector similarity.
 */

import Anthropic from "@anthropic-ai/sdk";
import { db, conversationSummaries } from "@lwf/database";
import { eq, sql } from "drizzle-orm";
import { embedOne } from "./embeddings";

const anthropic = new Anthropic();

/**
 * Generate a summary and topic tags from conversation messages using Haiku (cheap + fast).
 */
export async function generateConversationSummary(
  messages: Array<{ role: string; content: string }>,
): Promise<{ summary: string; topics: string[] }> {
  // Filter to actual text messages and cap length to avoid huge payloads
  const textMessages = messages
    .filter((m) => m.role && m.content)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n\n");

  const truncated = textMessages.slice(0, 12000);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `Summarize this landscaping/fire-safety conversation in 3-5 sentences. Focus on: what the user asked about, what was recommended, any specific plants/zones/properties discussed, and any unresolved questions.

Also extract 3-5 short topic tags as a JSON array (e.g. ["juniper removal", "zone 0", "deer resistance"]).

Respond in this exact JSON format:
{"summary": "...", "topics": ["...", "..."]}

Conversation:
${truncated}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      summary: parsed.summary || "",
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
    };
  } catch {
    // Fallback: treat entire response as summary, no topics
    return { summary: text.slice(0, 1000), topics: [] };
  }
}

/**
 * Generate a summary for a conversation and save it with an embedding.
 */
export async function saveConversationSummary(
  conversationId: string,
  userId: string,
  messages: Array<{ role: string; content: string }>,
): Promise<void> {
  if (messages.length < 2) return; // skip trivially short conversations

  const { summary, topics } = await generateConversationSummary(messages);
  if (!summary) return;

  const embedding = await embedOne(summary);

  await db.insert(conversationSummaries).values({
    conversationId,
    userId,
    summary,
    topics,
    embedding,
  });
}

/**
 * Retrieve relevant past conversation summaries for a user via vector similarity.
 */
export async function getRelevantSummaries(
  userId: string,
  currentQuery: string,
  limit = 3,
): Promise<Array<{ summary: string; topics: string[]; createdAt: Date }>> {
  const queryEmbedding = await embedOne(currentQuery);
  const vecStr = `[${queryEmbedding.join(",")}]`;

  const results = await db.execute(sql`
    SELECT
      summary,
      topics,
      created_at
    FROM conversation_summaries
    WHERE user_id = ${userId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${vecStr}::vector
    LIMIT ${limit}
  `);

  return (results.rows as Record<string, unknown>[]).map((row) => ({
    summary: row.summary as string,
    topics: (row.topics as string[]) || [],
    createdAt: new Date(row.created_at as string),
  }));
}
