"use client";

import { useState } from "react";
import { MessageCircle, X, Minimize2 } from "lucide-react";
import { ChatPanelWithHistory } from "./ChatPanelWithHistory";

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed inset-0 z-50 md:inset-auto md:bottom-4 md:right-4 md:w-96 md:h-[32rem]">
        {/* Mobile overlay */}
        <div className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm" />
        
        {/* Chat panel */}
        <div className="relative bg-white h-full md:rounded-xl md:shadow-2xl md:border border-neutral-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white md:rounded-t-xl">
            <h3 className="font-medium text-neutral-900">Plant Assistant</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hidden md:flex p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Minimize2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Chat content */}
          {!isMinimized && (
            <div className="flex-1 min-h-0">
              <ChatPanelWithHistory 
                className="h-full"
                showHistory={true}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-neutral-900 hover:bg-neutral-800 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">Open chat assistant</span>
    </button>
  );
}