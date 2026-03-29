# P2-1: Landscaper Dashboard

> **Status:** TODO
> **Priority:** P2
> **Depends on:** P1-1, P1-2, P0-6
> **Blocks:** P2-3

## Problem

Landscapers need professional tools: client management, plan design, materials lists, compliance documentation. Currently only homeowner perspective exists.

## Proposed Changes

### 1. Landscaper role + org
- User registers as landscaper (role in user_profiles)
- Creates a landscaping company org
- Can manage multiple client properties

### 2. Client management
- `/dashboard/clients` — list clients (homeowners who shared access)
- Add client by email
- View client's properties and plans

### 3. Plan design tool
- Same map + zones, but with professional features:
  - Precise plant placement (drag/drop on map)
  - Materials list auto-generated
  - Cost estimation with nursery pricing
  - Spacing validation (Charisse's rules)

### 4. Compliance package
- Generate submittal package for city/HOA
- Includes: zone map, plant list, spacing diagram, cost estimate
- Formatted for official submission

### 5. Portfolio
- `/landscapers/[slug]` — public profile
- Completed projects with before/after
- Specialties, service area, contact

## Files — TBD during detailed design phase
