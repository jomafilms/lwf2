# P1-3: Agent Preference Learning

> **Status:** TODO
> **Priority:** P1
> **Depends on:** P0-5 (AI agent), P0-6 (auth)
> **Blocks:** None

## Problem

The AI agent starts fresh every conversation. It should remember user preferences: "I don't like high-water plants", "I have deer", "Only Oregon natives", "No plants taller than 6 feet". These should persist and be applied to future recommendations.

## Proposed Changes

### 1. Preference storage
- `preferences` JSONB field already exists on `user_profiles` table
- Structure: `{ waterNeeds: "low", deerResistant: true, nativeOnly: true, maxHeight: 6, aestheticPrefs: ["no pink flowers"], notes: "north side is very shady" }`

### 2. New agent tools
- `save_user_preference` — agent calls this when user mentions a preference
- `get_user_preferences` — agent calls this at start of conversation to load context
- Tools already defined in IMPLEMENTATION.md, need actual implementation

### 3. System prompt update
- Add instruction: "At the start of each conversation, check user preferences. Reference them when making recommendations. When the user mentions a preference, save it."
- Example: User says "I hate plants that drop lots of debris" → agent saves `{ maintenance: "low debris" }` and says "Noted — I'll filter for low-maintenance plants going forward."

### 4. Preference management UI
- `/dashboard/preferences` page
- Shows all learned preferences
- User can edit/delete individual preferences
- Reset all button

## Files

### New
- `apps/web/app/api/preferences/route.ts` — GET/PUT user preferences
- `apps/web/app/(auth)/dashboard/preferences/page.tsx`

### Modified
- `apps/web/lib/agent/tools.ts` — add save_user_preference, get_user_preferences implementations
- `apps/web/lib/agent/system-prompt.ts` — add preference instructions
- `apps/web/app/api/chat/route.ts` — pass user ID to tools for preference storage

## Verification
1. Tell chat "I have deer problems and want low-water plants"
2. Agent acknowledges and saves preferences
3. Ask "What should I plant in Zone 1?" — recommendations filtered for deer-resistant + low-water
4. Start new conversation — agent references saved preferences
5. Go to /dashboard/preferences — see saved prefs, edit one, verify next chat uses updated prefs
