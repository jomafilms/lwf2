"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Flame } from "lucide-react";
import {
  PlantCardRow,
  type CompactPlant,
} from "@/components/plants/PlantCardCompact";

interface ChatItem {
  type: "message" | "plants";
  role?: "user" | "assistant";
  content?: string;
  plants?: CompactPlant[];
}

interface ChatPanelProps {
  className?: string;
}

const SUGGESTIONS = [
  "What should I plant in Zone 0?",
  "Low-water native plants for Ashland",
  "Deer-resistant shrubs for Zone 1",
  "Best ground covers near a house",
];

export function ChatPanel({ className = "" }: ChatPanelProps) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [items]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isLoading) return;

      const userItem: ChatItem = { type: "message", role: "user", content: msg };
      const newItems = [...items, userItem];
      setItems(newItems);
      setInput("");
      setIsLoading(true);

      // Build API messages from message items only (not plant cards)
      const apiMessages = newItems
        .filter((item) => item.type === "message" && item.content)
        .map((item) => ({
          role: item.role as "user" | "assistant",
          content: item.content!,
        }));

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: apiMessages }),
        });

        if (!res.ok) throw new Error(`Chat failed: ${res.status}`);

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let assistantText = "";

        // Add placeholder assistant message
        setItems((prev) => [
          ...prev,
          { type: "message", role: "assistant", content: "" },
        ]);

        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "text") {
                assistantText += data.text;
                setItems((prev) => {
                  const updated = [...prev];
                  const lastMsgIdx = findLastMessageIndex(updated);
                  if (lastMsgIdx >= 0) {
                    updated[lastMsgIdx] = {
                      ...updated[lastMsgIdx],
                      content: assistantText,
                    };
                  }
                  return updated;
                });
              } else if (data.type === "plant_cards" && data.plants?.length) {
                setItems((prev) => [
                  ...prev,
                  { type: "plants", plants: data.plants },
                ]);
              } else if (data.type === "error") {
                assistantText += `\n\nSorry, something went wrong: ${data.error}`;
                setItems((prev) => {
                  const updated = [...prev];
                  const lastMsgIdx = findLastMessageIndex(updated);
                  if (lastMsgIdx >= 0) {
                    updated[lastMsgIdx] = {
                      ...updated[lastMsgIdx],
                      content: assistantText,
                    };
                  }
                  return updated;
                });
              }
            } catch {
              // skip malformed SSE
            }
          }
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Something went wrong";
        setItems((prev) => [
          ...prev,
          {
            type: "message",
            role: "assistant",
            content: `Sorry, I couldn't respond: ${errorMsg}`,
          },
        ]);
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, isLoading, items]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessages = items.length > 0;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Items */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {!hasMessages && (
          <div className="flex flex-col items-center pt-8 text-center">
            <Flame className="h-6 w-6 text-neutral-300" />
            <p className="mt-2 text-sm font-medium text-neutral-500">
              Fire-safe landscaping advisor
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Powered by 1,300+ plants from the LWF database
            </p>
            <div className="mt-6 flex w-full flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-lg border border-neutral-200 px-3 py-2 text-left text-xs text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {items.map((item, i) => {
          if (item.type === "plants" && item.plants) {
            return <PlantCardRow key={i} plants={item.plants} />;
          }

          return (
            <div
              key={i}
              className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                  item.role === "user"
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-800"
                }`}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {item.content ||
                  (isLoading && i === items.length - 1 && (
                    <span className="flex items-center gap-2 text-neutral-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Searching plants...
                    </span>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="border-t p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about fire-safe plants..."
            rows={1}
            className="flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:border-neutral-400 focus:outline-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-neutral-900 p-2 text-white hover:bg-neutral-800 disabled:opacity-30"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function findLastMessageIndex(items: ChatItem[]): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].type === "message" && items[i].role === "assistant") return i;
  }
  return -1;
}
