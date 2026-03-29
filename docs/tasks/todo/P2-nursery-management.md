# P2-2: Nursery Org Management + Inventory Upload

> **Status:** TODO
> **Priority:** P2
> **Depends on:** P0-7, P0-6
> **Blocks:** P4-1 (marketplace)

## Problem

Nursery data is currently seeded from scrapes. Nurseries need self-serve tools to manage their profile, upload inventory, set pricing, and see what homeowners/landscapers are planning in their area.

## Proposed Changes

### 1. Nursery org signup
- Register as nursery → create org with type "nursery"
- Profile: name, address, phone, website, description, logo
- Public nursery page: `/nurseries/[slug]`

### 2. Inventory management
- `/dashboard/inventory` — manage plant inventory
- CSV upload: botanical name, common name, container size, price, availability
- Manual add/edit individual items
- Match inventory items to LWF plant IDs (fuzzy matching + manual override)
- Bulk update availability (in stock / limited / out of stock / seasonal)

### 3. Demand insights
- "Plants in demand" — what homeowners/landscapers are adding to plans in your area
- "You don't carry these" — popular fire-safe plants missing from your inventory
- Basic analytics: views, clicks to your website

### 4. Connection framework
- `connectionType` field on nursery record
- Phase 1: manual + CSV upload
- Future: API connection, POS integration
- Schema for `NurseryConnection` (api_endpoint, api_key, sync_frequency) already in IMPLEMENTATION.md

## Files — TBD during detailed design phase
