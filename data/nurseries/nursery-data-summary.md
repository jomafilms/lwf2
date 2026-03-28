# Nursery Data Scraping Summary
**Date:** 2026-03-28
**Purpose:** Collect plant availability data from Jackson County nurseries for LWF hackathon

---

## Results by Nursery

### 1. Shooting Star Nursery (PRIMARY) ⭐
- **Website:** roguevalleynursery.com
- **Location:** Central Point, OR
- **Total plant entries:** 1733
- **Items currently in stock (qty > 0):** 1200
- **Data quality:** ★★★★☆ — Excellent structured data with botanical names, common names, container sizes, and live inventory quantities. No pricing (call for quotes).
- **Categories:**
  - Ferns: 11 entries
  - Fruit trees and shrubs: 95 entries
  - Grasses and Grasslike Plants: 122 entries
  - Perennials: 415 entries
  - Shrubs: 540 entries
  - Trees: 520 entries
  - Vines: 30 entries
- **Fire-reluctant genera found:** 53 (Achillea, Agastache, Amelanchier, Aquilegia, Arbutus, Arctostaphylos, Artemisia, Asclepias, Bouteloua, Callirhoe, Camassia, Carex, Ceanothus, Cercis, Cistus...)
- **Files saved:**
  - `shooting-star-availability.json` — Full availability list
  - `shooting-star-firewise.pdf` — Firewise landscaping guide (5 pages, 241KB)
- **Native plants tagged:** Many entries marked "(native)" in descriptions

### 2. ForestFarm at Pacifica ⭐
- **Website:** forestfarm.com
- **Location:** Williams, OR
- **Total plant entries:** 566
- **Data quality:** ★★★★☆ — Extracted from 2025 PDF catalog (68 pages). Includes botanical names, common names, sizes, and prices. SKUs can be used to look up current online inventory.
- **Categories:**
  - Fruit & Nuts: 39 entries
  - Perennials: 113 entries
  - Shrubs: 168 entries
  - Tree/Shrub: 38 entries
  - Trees: 178 entries
  - Vines: 30 entries
- **Fire-reluctant genera found:** 26 (Agastache, Aquilegia, Asclepias, Carex, Ceanothus, Cercis, Cistus, Cornus, Echinacea, Festuca...)
- **Price range:** Tubes $15-35, Size1 $19-49, Size5 $85-95
- **Note:** Full online inventory has thousands more (catalog says "partial inventory")
- **Files saved:** `forestfarm-sample.json`

### 3. Plant Oregon (The Nursery on Wagner Creek)
- **Website:** plantoregon.com
- **Location:** Talent, OR
- **Total plant entries:** 153
- **Data quality:** ★★★☆☆ — Good botanical data with descriptions. No individual pricing or availability. General pricing ~$10/gallon mentioned on homepage.
- **Specialty:** Native plants, restoration species, conifers, deciduous trees
- **Fire-reluctant genera found:** 20 (Amelanchier, Arbutus, Arctostaphylos, Artemisia, Asclepias, Ceanothus, Cercis, Cornus, Garrya, Holodiscus...)
- **Files saved:** `plant-oregon-catalog.json`

### 4. Flowerland Nursery
- **Website:** flowerlandnursery.net
- **Location:** Central Point, OR
- **Data quality:** ★★☆☆☆ — Only container-size-based pricing available. No individual plant inventory online. They grow their own plants.
- **Key pricing:**
  - 1 gal: $9.75-11.75
  - 5 gal shrub: $22.75
  - 6 gal tree: $41.75
  - 15 gal: $89.00
- **Note:** 10% off purchases over $300
- **Files saved:** `flowerland-pricing.json`

### 5. Valley View Nursery
- **Website:** valleyviewnursery.com
- **Location:** Ashland, OR (1675 N Valley View Rd)
- **Data quality:** ★☆☆☆☆ — No online plant inventory at all. Walk-in only nursery with garden center, landscape design, pottery, and outdoor furniture.
- **Files saved:** `valley-view-inventory.json` (metadata only)

---

## Cross-Nursery Analysis

### Fire-Reluctant Plant Genera Overlap
Genera found across nurseries that are commonly in fire-reluctant plant databases:

| Genus | Shooting Star | ForestFarm | Plant Oregon |
|-------|:---:|:---:|:---:|
| Achillea | ✅ | — | — |
| Agastache | ✅ | ✅ | — |
| Amelanchier | ✅ | — | ✅ |
| Aquilegia | ✅ | ✅ | — |
| Arbutus | ✅ | — | ✅ |
| Arctostaphylos | ✅ | — | ✅ |
| Artemisia | ✅ | — | ✅ |
| Asclepias | ✅ | ✅ | ✅ |
| Bouteloua | ✅ | — | — |
| Callirhoe | ✅ | — | — |
| Camassia | ✅ | — | — |
| Carex | ✅ | ✅ | — |
| Ceanothus | ✅ | ✅ | ✅ |
| Cercis | ✅ | ✅ | ✅ |
| Cistus | ✅ | ✅ | — |
| Cornus | ✅ | ✅ | ✅ |
| Deschampsia | ✅ | — | — |
| Echinacea | ✅ | ✅ | — |
| Eriogonum | ✅ | — | — |
| Eriophyllum | ✅ | — | — |
| Festuca | ✅ | ✅ | — |
| Garrya | ✅ | — | ✅ |
| Heuchera | ✅ | ✅ | — |
| Holodiscus | ✅ | — | ✅ |
| Iris | ✅ | ✅ | — |
| Juncus | ✅ | — | — |
| Lavandula | ✅ | ✅ | — |
| Lewisia | ✅ | — | — |
| Lupinus | ✅ | — | — |
| Mahonia | ✅ | — | ✅ |
| Monardella | ✅ | — | — |
| Muhlenbergia | ✅ | — | — |
| Nepeta | ✅ | ✅ | — |
| Penstemon | ✅ | ✅ | — |
| Perovskia | ✅ | ✅ | — |
| Philadelphus | ✅ | ✅ | ✅ |
| Polystichum | ✅ | — | ✅ |
| Quercus | ✅ | ✅ | ✅ |
| Ribes | ✅ | ✅ | ✅ |
| Rosa | ✅ | ✅ | ✅ |
| Rubus | ✅ | ✅ | ✅ |
| Rudbeckia | ✅ | ✅ | — |
| Salvia | ✅ | ✅ | — |
| Sambucus | ✅ | ✅ | ✅ |
| Sedum | ✅ | — | — |
| Sidalcea | ✅ | — | — |
| Solidago | ✅ | ✅ | — |
| Stipa | ✅ | — | — |
| Symphoricarpos | ✅ | ✅ | ✅ |
| Teucrium | ✅ | — | — |
| Thymus | ✅ | — | ✅ |
| Verbena | ✅ | — | — |
| Zauschneria | ✅ | — | — |

### Genera Available at Multiple Nurseries
- **All 3 nurseries:** 40 genera (Asclepias, Ceanothus, Cercis, Cornus, Philadelphus, Quercus, Ribes, Rosa, Rubus, Sambucus...)
- **Shooting Star + ForestFarm:** 136 genera
- **Shooting Star + Plant Oregon:** 65 genera

---

## Data Quality Assessment

| Nursery | Plants | Botanical Names | Pricing | Inventory Qty | Overall |
|---------|--------|:-:|:-:|:-:|:-:|
| Shooting Star | 1733 | ✅ | ❌ (call) | ✅ | ★★★★☆ |
| ForestFarm | 566 | ✅ | ✅ | ❌ (catalog) | ★★★★☆ |
| Plant Oregon | 153 | ✅ | ⚠️ (~$10/gal) | ❌ | ★★★☆☆ |
| Flowerland | 0 | ❌ | ✅ (by size) | ❌ | ★★☆☆☆ |
| Valley View | 0 | ❌ | ❌ | ❌ | ★☆☆☆☆ |

### Key Findings
1. **Shooting Star is the gold mine** — 1,733 entries with live inventory counts, perfect for the LWF app
2. **ForestFarm has the best price data** — 566 plants with specific prices from their catalog
3. **Plant Oregon is the native plant specialist** — 153 species, many fire-reluctant natives
4. **Flowerland and Valley View** lack online inventories — useful for pricing reference only
5. **~53 fire-reluctant genera** found across all nurseries combined

### Recommendations for LWF Hackathon
- Use Shooting Star data as primary availability source (matches well with fire-reluctant plants)
- Cross-reference ForestFarm catalog for pricing estimates
- Plant Oregon's native plant list is valuable for the "native & fire-reluctant" intersection
- The Firewise PDF from Shooting Star contains curated fire-resistant plant recommendations — extract and cross-reference with the database

---

## Files in this directory
- `shooting-star-availability.json` — 1,733 plants with inventory
- `shooting-star-firewise.pdf` — Firewise landscaping guide
- `forestfarm-sample.json` — 566 plants from 2025 catalog with prices
- `plant-oregon-catalog.json` — 153 native/landscape plants
- `flowerland-pricing.json` — Container size pricing matrix
- `valley-view-inventory.json` — Metadata only (no online inventory)
- `nursery-data-summary.md` — This file
