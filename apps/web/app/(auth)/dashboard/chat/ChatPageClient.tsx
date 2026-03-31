"use client";

import { useState, useCallback } from "react";
import { ChatPanelWithHistory } from "@/components/agent/ChatPanelWithHistory";
import { PlantSlideOut } from "@/components/plants/PlantSlideOut";

interface ChatPageClientProps {
  conversationId?: string;
}

export function ChatPageClient({ conversationId }: ChatPageClientProps) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const handlePlantClick = useCallback((plantId: string) => {
    setSelectedPlantId((prev) => (prev === plantId ? null : plantId));
  }, []);

  const handleClose = useCallback(() => {
    setSelectedPlantId(null);
  }, []);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-neutral-900">Plant Assistant</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Get personalized fire-safe plant recommendations
          </p>
        </div>
      </div>

      {/* Chat Panel */}
      <div className="flex-1 min-h-0">
        <ChatPanelWithHistory
          className="h-full"
          conversationId={conversationId}
          showHistory={true}
          onPlantClick={handlePlantClick}
        />
      </div>

      <PlantSlideOut plantId={selectedPlantId} onClose={handleClose} />
    </div>
  );
}
