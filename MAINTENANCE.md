# B8 — Maintenance Calendar & Reminders

## What Was Built

A maintenance schedule system that generates fire-safe landscape maintenance tasks based on plants in user plans.

### Core Components

1. **Maintenance Schedule Generator** (`apps/web/lib/maintenance.ts`)
   - Generates seasonal tasks: spring prep, fall pruning, winter prep
   - Plant-specific tasks based on growth rate, debris production, zone placement
   - Growth projections at 3, 5, 10 years (like Oregon HOA reserve plans)
   - Spacing checks to prevent fire ladder formation

2. **Maintenance API** (`apps/web/app/api/maintenance/[propertyId]/route.ts`)
   - GET endpoint to generate schedule for a property's plan
   - Converts plant placements to maintenance tasks
   - Returns structured schedule data

3. **Maintenance Dashboard Page** (`apps/web/app/(auth)/dashboard/maintenance/page.tsx`)
   - Visual interface showing upcoming tasks
   - Seasonal task organization 
   - Next maintenance window highlight
   - Print-friendly maintenance guide
   - Zone-specific guidelines

### Key Principles Implemented

**"Maintenance is #3 in fire safety priority — before plant selection!"**
- Zone 0 (defensible space) gets most frequent maintenance (1.5x multiplier)
- High-priority tasks for close-to-structure plants
- Debris removal for high-debris plants

**"Juniper isn't dangerous because it's juniper; it's dangerous when it's not maintained"**
- Task generation based on plant attributes (growth rate, debris production)
- Regular pruning and debris removal schedules
- Growth monitoring to prevent overgrowth

**Mark Morrison's concept: maintenance calendar with text reminders, yearly check-ins**
- Multi-year growth projections (3, 5, 10 years)
- Seasonal task organization
- Estimated time requirements for planning

### Task Types Generated

1. **Seasonal Tasks**
   - Spring preparation (April): Remove winter debris, check for dead branches
   - Fall pruning (October): Main pruning season, reduce fuel load
   - Winter preparation (December): Secure branches before storms

2. **Growth Projections**
   - 3, 5, 10 year height projections
   - Flags when plants may exceed zone height recommendations
   - Helps with long-term planning

3. **Spacing Checks**
   - Verify 10+ foot spacing between plants
   - Zone-level analysis to prevent fire ladder formation
   - Spring timing for planning new growth

### Zone-Based Frequency

- **Zone 0 (Defensible Space)**: 1.5x more frequent maintenance
- **Zone 1 (Transition)**: Baseline frequency
- **Zone 2 (Outer)**: 0.75x less frequent maintenance

### Example Generated Tasks

```typescript
{
  title: "Fall pruning for Coast Live Oak",
  description: "Remove dead, diseased, and overcrowded branches. Thin for air circulation",
  fireSafetyReason: "Annual pruning reduces fuel load and maintains defensible space",
  zone: "zone0",
  priority: "high",
  season: "fall",
  estimatedHours: 3
}
```

## Implementation Notes

- Uses existing scoring system types (`PlanPlant`, `Zone`)
- Integrates with database schema for plant placements
- Generates realistic time estimates based on zone and plant characteristics
- Extensible for additional task types and plant attributes

## Future Enhancements

1. **Real Plant Data Integration**: Connect with LWF API plant attributes
2. **User Task Management**: Mark complete, reschedule, add custom tasks
3. **Notification System**: Email/SMS reminders for upcoming tasks
4. **Historical Tracking**: Record completed maintenance, track effectiveness
5. **Professional Integration**: Share schedules with landscapers, export to calendar apps

This establishes the foundation for fire-safe landscape maintenance planning, prioritizing the critical insight that proper maintenance is more important than plant selection alone.