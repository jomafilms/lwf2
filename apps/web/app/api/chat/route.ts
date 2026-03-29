import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { toolDefinitions, executeTool } from "@/lib/agent/tools";
import type { ToolContext } from "@/lib/agent/tools";
import { getCurrentUser } from "@/lib/auth";

const client = new Anthropic();

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
  };

  // Get current user for preference tools
  const user = await getCurrentUser();
  const toolContext: ToolContext = {
    userId: user?.id,
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      try {
        await runAgentLoop(messages, send, toolContext);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        send({ type: "error", error: message });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

async function runAgentLoop(
  messages: Anthropic.MessageParam[],
  send: (data: Record<string, unknown>) => void,
  toolContext: ToolContext
) {
  let currentMessages = [...messages];
  let iterations = 0;
  const maxIterations = 10;

  while (iterations < maxIterations) {
    iterations++;

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: toolDefinitions,
      messages: currentMessages,
    });

    // Process content blocks
    let hasToolUse = false;
    const toolResults: Anthropic.ToolResultBlockParam[] = [];

    for (const block of response.content) {
      if (block.type === "text") {
        send({ type: "text", text: block.text });
      } else if (block.type === "tool_use") {
        hasToolUse = true;
        send({
          type: "tool_use",
          name: block.name,
          input: block.input,
        });

        const result = await executeTool(
          block.name,
          block.input as Record<string, unknown>,
          toolContext
        );

        // Emit plant cards for tools that return plant data
        if (block.name === "search_plants" || block.name === "get_zone_recommendations") {
          try {
            const parsed = JSON.parse(result);
            if (parsed.plants?.length > 0) {
              send({ type: "plant_cards", plants: parsed.plants });
            }
          } catch {
            // skip if result isn't parseable
          }
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    // If no tool use, we're done
    if (!hasToolUse || response.stop_reason === "end_turn") {
      break;
    }

    // Add assistant response and tool results, then continue loop
    currentMessages = [
      ...currentMessages,
      { role: "assistant", content: response.content },
      { role: "user", content: toolResults },
    ];
  }
}
