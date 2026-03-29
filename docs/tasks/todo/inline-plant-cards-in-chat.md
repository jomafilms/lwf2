# Inline Plant Cards in Chat — Show plants visually when agent recommends them

> **Status:** TODO
> **Priority:** P1 (important for demo)
> **Depends on:** P0-4 (plant cards), P0-5 (AI agent)
> **Blocks:** None

## Problem

When the AI agent recommends plants, it returns text only. The user sees plant names but no images, no fire scores, no nursery pricing. The chat should render rich plant cards inline when the agent mentions specific plants.

## Current Implementation

- `ChatPanel.tsx` renders messages as plain text
- `/api/chat` streams SSE events with `type: "text"` and `type: "tool_use"`
- Tool results include plant data (IDs, names, attributes) but aren't rendered visually

## Proposed Changes

### 1. New SSE event type: `plant_cards`
When the agent's tool returns plant data, the chat route should emit a `plant_cards` event alongside the text:

```typescript
// In /api/chat/route.ts, after executeTool for search_plants or get_zone_recommendations:
send({ type: "plant_cards", plants: parsedResult.plants });
```

### 2. ChatPanel renders PlantCard components inline
When ChatPanel receives a `plant_cards` event, render a horizontal scrollable row of compact PlantCards within the chat message flow.

### 3. Compact PlantCard variant
Create a `PlantCardCompact` or add a `variant="compact"` prop to PlantCard:
- Smaller: ~160px wide
- Image, name, fire zone badge, price
- Click → navigates to /plants/[id] detail page
- No full attribute list — just the essentials

### What Does NOT Change
- Full PlantCard on browse/detail pages stays as-is
- Agent tool logic stays the same
- Chat streaming architecture stays the same

## Files Modified

### New Files
- `apps/web/components/plants/PlantCardCompact.tsx` (~80 lines)

### Modified Files  
- `apps/web/components/agent/ChatPanel.tsx` — handle `plant_cards` event, render compact cards
- `apps/web/app/api/chat/route.ts` — emit `plant_cards` event after tool results

## Verification

1. Ask the chat "What should I plant in Zone 0?"
2. Agent searches plants → text response appears
3. Below the text, a horizontal row of compact plant cards renders
4. Each card shows image, name, zone badge, price
5. Clicking a card goes to plant detail page
