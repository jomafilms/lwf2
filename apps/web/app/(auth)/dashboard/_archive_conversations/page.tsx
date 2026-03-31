"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Trash2, Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Conversation {
  id: string;
  title: string | null;
  updatedAt: string | null;
  createdAt: string | null;
  propertyId: string | null;
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations(prev => prev.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const filteredConversations = conversations.filter(conversation =>
    conversation.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? true
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-neutral-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Chat History</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Your conversations with the plant assistant
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/chat")}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:border-neutral-400 focus:outline-none"
        />
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-600 mb-2">
            {searchQuery ? "No matching conversations" : "No conversations yet"}
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchQuery 
              ? "Try a different search term"
              : "Start your first conversation with the plant assistant"
            }
          </p>
          <button
            onClick={() => router.push("/dashboard/chat")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Start Chatting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer group"
              onClick={() => router.push(`/dashboard/chat?conversation=${conversation.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neutral-900 truncate">
                    {conversation.title || "New conversation"}
                  </h3>
                  <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500">
                    <span>
                      Updated {conversation.updatedAt 
                        ? new Date(conversation.updatedAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                    <span>
                      Created {conversation.createdAt 
                        ? new Date(conversation.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-neutral-200 rounded-lg transition-all"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4 text-neutral-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}