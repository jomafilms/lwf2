---
name: Plant cards need joma-v2 inline expand pattern
description: The /plants grid needs the same inline detail expand as joma-v2 film cards — not a full-page slide-out overlay
type: feedback
---

The plant card grid on /plants must use the joma-v2 inline expand pattern, NOT a full-page slide-out overlay.

**joma-v2 pattern (FilmDetailInlineExpand):**
- Click card → detail panel appears BESIDE the card in the grid
- Uses getBoundingClientRect() to position relative to grid container
- Auto-flips left/right based on available space
- Panel width = 2 card widths + 1 gap
- Other cards fade to 40% opacity
- Unified ring border wraps card + panel
- Escape/click-outside/click-different-card to close
- Mobile: bottom sheet (FilmDetailSlideOver) instead

**Key files to study:**
- `/Users/annelundgren/Projects/joma-projects/joma-v2/apps/web/components/film-detail-inline-expand.tsx`
- `/Users/annelundgren/Projects/joma-projects/joma-v2/apps/web/components/films-browser.tsx`
- `/Users/annelundgren/Projects/joma-projects/joma-v2/apps/web/components/film-detail-slide-over.tsx`

**Why:** Annie specifically wants this. The current SlideOutPanel overlay breaks the grid context and feels disconnected. The inline expand lets users browse the grid while peeking at details.

**How to apply:** Port the pattern from joma-v2, adapt for plant data. Apply to both /plants browse page and /lists collection pages.
