# Flywheel Gaps — What's Built vs What's Needed

## Step 1: Discovery ("I want plants")

| Need | Status | Gap |
|------|--------|-----|
| Browse plants with images | ✅ Built | — |
| Fire data on every card (zones, score) | ✅ Built | Zone badges may not show due to bulk API parsing |
| Save to list from card | ✅ Built | — |
| Nursery availability on cards | ✅ Built | — |
| Add to list button works | ✅ Built | Needs live testing |
| Landing page leads with plants | ❌ Gap | Currently leads with address. Need "Browse Plants" as primary CTA |

**Implementation:** Update home page — hero CTA is "Browse Plants", secondary is "Map My Property"

## Step 2: Context ("What works for MY yard")

| Need | Status | Gap |
|------|--------|-----|
| Chat advisor asks smart questions | ✅ Built | — |
| Saves preferences from conversation | ✅ Built | — |
| Connect address / see property | ✅ Built | — |
| Parcel auto-detect | ✅ Built | — |
| Fire zones on map | ✅ Built (fixed) | — |
| Chat available on all pages | ✅ Built | Nav icon links to /dashboard/chat |

**No major gaps here.**

## Step 3: Planning ("Here's my plan")

| Need | Status | Gap |
|------|--------|-----|
| Saved list becomes a plan | ⚠️ Partial | Lists exist but aren't explicitly "plans" tied to properties |
| Cost estimate from nursery data | ✅ Built | Cost estimator exists |
| Plants in stock at nurseries | ✅ Built | NurseryAvailability component |
| Maintenance calendar | ✅ Built | — |
| Share plan with HOA/landscaper | ❌ Gap | No share-with-specific-org flow |
| "This plan improves your fire readiness by X%" | ❌ Gap | Scoring exists but not framed as improvement |

**Implementation:**
1. Add "Share with HOA" button on list detail (sends to org's inbox)
2. Add "Fire readiness impact" summary on list detail (uses scoring system)

## Step 4: Community ("My neighborhood is doing this")

| Need | Status | Gap |
|------|--------|-----|
| Neighborhood progress (anonymized) | ⚠️ Partial | Community page exists but needs real aggregate data |
| HOA preferred plant lists (public) | ✅ Built | Org lists with public visibility |
| City zone guidelines as lists | ✅ Built | Demo seed lists |
| Star/follow an org's list | ❌ Gap | Fork copies it but no "follow" (stay updated) |
| "Your neighborhood: X plans created" | ❌ Gap | No link between user address and neighborhood groups |
| Celebration milestones | ❌ Gap | No milestone triggers/notifications |

**Implementation:**
1. Add "Star" button on public lists (lightweight follow — shows in your library without copying)
2. Auto-link users to neighborhood by zip/address when they add a property
3. Community stats on homepage: "X plans created in Ashland"

## Step 5: Commerce ("I'm ready to buy")

| Need | Status | Gap |
|------|--------|-----|
| See which nurseries stock your list | ⚠️ Partial | Per-plant availability exists, not per-list summary |
| "80% of your plants available at Shooting Star" | ❌ Gap | No list-level nursery matching |
| One-click to nursery for purchase | ✅ Built | External links on plant cards |
| Shooting Star white-label page | ⚠️ Partial | Marketplace page exists but not white-label ready |
| Nursery sees demand signals | ❌ Gap | No demand dashboard for nurseries |

**Implementation:**
1. Add "Nursery Match" section on list detail: "Shooting Star has X of Y plants (80%)"
2. Add demand visibility to nursery dashboard: "47 users saved Oregon Grape"
3. Clean up Shooting Star page as white-label example

## Step 6: Progress ("We're getting there")

| Need | Status | Gap |
|------|--------|-----|
| Community readiness page (public) | ✅ Built | /community |
| City analytics dashboard | ✅ Built | /dashboard/city |
| Grant-ready data export | ✅ Built | CSV export |
| "Ashland: X% fire-ready" counter | ❌ Gap | Needs prominent placement on homepage |
| Progress framed as "readiness" not "compliance" | ❌ Gap | Language needs audit across dashboards |

**Implementation:**
1. Add community progress counter to homepage
2. Language pass: "compliance" → "readiness" across all UI

---

## Priority Implementation Plan (for token window)

### P0 — Demo Critical (do first)
1. **Homepage: plants-first CTA** — "Browse Plants" primary, "Map My Property" secondary, community progress counter
2. **List detail: nursery match summary** — "X% of your plants available at [nursery]"  
3. **List detail: fire readiness impact** — "This plan covers X plants across Y zones"
4. **Star/follow public lists** — lightweight, don't copy, just bookmark
5. **Plant card slide-out** — Annie wants this for demo

### P1 — Flywheel Connectors
6. **Nursery demand signals** — "47 users saved this plant" on nursery dashboard
7. **Community progress on homepage** — "340 plans created in Ashland"
8. **Auto-link user to neighborhood** — by address/zip when property added
9. **Language pass** — "compliance" → "readiness" everywhere

### P2 — Future (post-demo)
10. Share list with specific org (HOA inbox)
11. Milestone celebrations ("Your neighborhood hit 50%!")
12. White-label nursery pages
13. Delivery component
14. List follow (stay updated vs one-time copy)
