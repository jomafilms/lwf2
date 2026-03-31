---
name: DRY plant cards and list cards
description: All plant grids must use PlantGridWithSlideOut. List cards need inline expand too. No duplicate card rendering.
type: feedback
---

**Every page with plant cards MUST use `PlantGridWithSlideOut`** — no custom card rendering.

Files using it correctly: /plants, /lists/featured/[index], /lists/[id]

**Next task: List cards need inline expand too.** When clicking a collection card on /plants or /lists, it should expand inline (like joma-v2 curator lists) and show the plants inside. Need a `ListDetailInlineExpand` component.

**Key patterns:**
- `PlantGridWithSlideOut` = shared grid with inline expand (desktop) + slide-out (mobile)
- `PlantDetailInlineExpand` = the inline panel that appears beside clicked card
- Plant data passed from grid to avoid re-fetch (instant open)
- `PlantCard compact` = smaller square cards for grids
- All cards use `primaryImage?.url` or `images[0]?.url` for first available image

**API notes (v2):**
- LWF API switched to v2: `https://lwf-api.vercel.app/api/v2`
- v2 plant detail returns values + images inline (no separate /values or /images endpoints)
- Client components use `getPlantClient()` which goes through `/api/plants/[id]` proxy (CORS)
- Server components use `getPlant()` directly
- Bulk values: `getValuesBulk()` returns `{ data: { values: { plantId: { attrId: [...] } } } }`
- System lists backed by API use `apiAttributeId` field in demo-lists.json

**Why:** Annie wants the joma-v2 card interaction pattern everywhere — inline expand beside the card, other cards fade, grid stays in place. Not a full-page overlay.
