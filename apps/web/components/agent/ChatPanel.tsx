"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Flame } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className = "" }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = { role: "user", content: text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Build API messages from conversation history
      const apiMessages = newMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`Chat failed: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let assistantText = "";

      // Add placeholder for assistant response
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "text") {
            assistantText += data.text;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
          } else if (data.type === "error") {
            assistantText += `\n\n_Error: ${data.error}_`;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantText,
              };
              return updated;
            });
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setMessages((prev) => [
        ...prev.slice(0, -1).length === prev.length ? prev : prev.slice(0, -1),
        { role: "assistant", content: `_Error: ${message}_` },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400">
            <Flame className="h-8 w-8 mb-3" />
            <p className="text-sm font-medium">Fire-safe landscaping advisor</p>
            <p className="text-xs mt-1 max-w-xs">
              Ask about plants for your fire zones, deer-resistant options,
              native plants, or anything about fire-reluctant landscaping.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-900"
              }`}
            >
              {msg.content || (isLoading && i === messages.length - 1 && (
                <Loader2 className="h-4 w-4 animate-spin" />
              ))}
            </div>
          </div>
        ))}
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
            className="flex-1 resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-neutral-900 p-2 text-white hover:bg-neutral-800 disabled:opacity-50"
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
