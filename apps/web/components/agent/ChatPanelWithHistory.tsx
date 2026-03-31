"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Flame, Plus, History, Trash2, ChevronLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  PlantCardRow,
  type CompactPlant,
} from "@/components/plants/PlantCardCompact";
import {
  ChatPlantCardRow,
  type ChatPlantData,
} from "@/components/agent/ChatPlantCard";

interface ChatItem {
  type: "message" | "plants" | "rich_plants";
  role?: "user" | "assistant";
  content?: string;
  plants?: CompactPlant[];
  richPlants?: ChatPlantData[];
}

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  propertyId: string | null;
}

interface ChatPanelWithHistoryProps {
  className?: string;
  conversationId?: string; // Load specific conversation
  propertyId?: string; // Link new conversations to property
  showHistory?: boolean; // Show conversation list sidebar
  onPlantClick?: (plantId: string) => void;
}

const SUGGESTIONS = [
  "What should I plant in Zone 0?",
  "Low-water native plants for Rogue Valley",
  "Deer-resistant shrubs for Zone 1",
  "Best ground covers near a house",
];

export function ChatPanelWithHistory({
  className = "",
  conversationId,
  propertyId,
  showHistory = true,
  onPlantClick,
}: ChatPanelWithHistoryProps) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when items change
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [items]);

  // Load conversations list
  const loadConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  }, []);

  // Load specific conversation
  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItems((data.conversation?.messages as ChatItem[]) || []);
        setCurrentConversationId(id);
        setShowHistoryPanel(false);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  }, []);

  // Auto-save conversation after assistant responses
  const saveConversation = useCallback(async (messages: ChatItem[], convId?: string | null) => {
    if (!convId || messages.length === 0) return;
    
    try {
      await fetch(`/api/conversations/${convId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  }, []);

  // Create new conversation
  const createNewConversation = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentConversationId(data.conversation.id);
        setItems([]);
        setShowHistoryPanel(false);
        return data.conversation.id;
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
    return null;
  }, [propertyId]);

  // Delete conversation
  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (id === currentConversationId) {
          setCurrentConversationId(null);
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }, [currentConversationId]);

  // Load conversations on mount if showing history
  useEffect(() => {
    if (showHistory) {
      loadConversations();
    }
  }, [showHistory, loadConversations]);

  // Load specific conversation on mount
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId, loadConversation]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isLoading) return;

      // Create conversation if needed
      let convId = currentConversationId;
      if (!convId) {
        convId = await createNewConversation();
        if (!convId) return;
      }

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
                  { type: "rich_plants", richPlants: data.plants },
                ]);
              } else if (data.type === "plant_cards_compact" && data.plants?.length) {
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

        // Auto-save after completion
        const finalItems = [...newItems, 
          { type: "message", role: "assistant", content: assistantText } as ChatItem
        ];
        await saveConversation(finalItems, convId);
        
        // Refresh conversation list
        loadConversations();
        
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
    [input, isLoading, items, currentConversationId, createNewConversation, saveConversation, loadConversations]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasMessages = items.length > 0;

  return (
    <div className={`flex h-full ${className}`}>
      {/* History Panel */}
      {showHistory && showHistoryPanel && (
        <div className="w-80 border-r border-neutral-200 flex flex-col bg-white">
          <div className="p-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Chat History</h3>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="p-1 hover:bg-neutral-100 rounded"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={createNewConversation}
              className="w-full mt-3 flex items-center gap-2 px-3 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {isLoadingConversations ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg hover:bg-neutral-50 cursor-pointer group ${
                      conversation.id === currentConversationId ? "bg-neutral-100" : ""
                    }`}
                    onClick={() => loadConversation(conversation.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {conversation.title || "New conversation"}
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {conversation.updatedAt 
                            ? new Date(conversation.updatedAt).toLocaleDateString()
                            : "No date"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-neutral-200 rounded"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Panel */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {showHistory && (
          <div className="p-3 border-b border-neutral-200 flex items-center justify-between bg-white">
            <button
              onClick={() => setShowHistoryPanel(!showHistoryPanel)}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-100 rounded-lg"
            >
              <History className="h-4 w-4" />
              Chat History
            </button>
            
            <button
              onClick={createNewConversation}
              className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              New
            </button>
          </div>
        )}

        {/* Messages */}
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
                    className="min-h-[44px] rounded-lg border border-neutral-200 px-4 py-3 text-left text-sm text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 active:bg-neutral-100 sm:min-h-0 sm:px-3 sm:py-2 sm:text-xs"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {items.map((item, i) => {
            if (item.type === "rich_plants" && item.richPlants) {
              return <ChatPlantCardRow key={i} plants={item.richPlants} onPlantClick={onPlantClick} />;
            }

            if (item.type === "plants" && item.plants) {
              return <PlantCardRow key={i} plants={item.plants} onPlantClick={onPlantClick} />;
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
                >
                  {item.content ? (
                    item.role === "assistant" ? (
                      <div className="prose prose-sm prose-neutral max-w-none [&>p]:my-1 [&>ul]:my-1 [&>ol]:my-1 [&>h2]:text-sm [&>h2]:font-bold [&>h2]:mt-3 [&>h2]:mb-1 [&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1 [&>blockquote]:border-l-2 [&>blockquote]:border-neutral-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>blockquote]:text-neutral-600">
                        <ReactMarkdown>{item.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span style={{ whiteSpace: "pre-wrap" }}>{item.content}</span>
                    )
                  ) : (
                    isLoading && i === items.length - 1 && (
                      <span className="flex items-center gap-2 text-neutral-400">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Searching plants...
                      </span>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="border-t p-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about fire-safe plants..."
              rows={1}
              className="flex-1 resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-base leading-normal focus:border-neutral-400 focus:outline-none sm:py-2 sm:text-sm"
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="min-h-[44px] min-w-[44px] rounded-lg bg-neutral-900 p-2.5 text-white hover:bg-neutral-800 active:bg-neutral-700 disabled:opacity-30 flex items-center justify-center sm:p-2 sm:min-h-0 sm:min-w-0"
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
    </div>
  );
}

function findLastMessageIndex(items: ChatItem[]): number {
  for (let i = items.length - 1; i >= 0; i--) {
    if (items[i].type === "message" && items[i].role === "assistant") return i;
  }
  return -1;
}