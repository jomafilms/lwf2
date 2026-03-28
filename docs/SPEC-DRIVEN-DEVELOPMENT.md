# AI Collaboration Process — Spec-Driven Development

> How LWF2 uses structured task documents to drive reliable AI-assisted implementation.
> 
> Source: Shared by a friend during the Rogue Raise codeathon, March 2026.
> Adapted for our multi-agent workflow (Buggy as chief of staff + VPS agents + local coding agent).

## The Process

Development follows a two-phase workflow where **design and implementation are separated into distinct sessions**, connected by a task document (MD file) that serves as the handoff artifact.

### Phase 1: Design (Annie + Buggy)

1. **Discuss** the feature — goals, constraints, tradeoffs
2. **Research** the existing codebase — read current implementations, identify patterns
3. **Iterate** on the approach — debate alternatives, resolve edge cases
4. **Write the task doc** — capture the agreed-upon design as a structured MD file in `docs/tasks/todo/`
5. **Review and refine** — read the doc together, fix inconsistencies
6. **Commit** — the task doc enters version control as a first-class artifact

### Phase 2: Implementation (Local Agent or VPS Agents)

1. **Read the task doc** — the agent ingests the full spec as its primary instruction
2. **Plan** — review codebase against spec, produce implementation plan
3. **Implement** — write code following the spec
4. **Verify** — check work against verification criteria
5. **Review and update** — reconcile doc against what was built, add commit references
6. **Move to completed** — `docs/tasks/todo/` → `docs/tasks/completed/`

### Phase 3: Accumulation

Completed task docs remain as permanent records forming decision history, pattern precedent, and project-specific design language.

## Document Lifecycle

```
docs/tasks/todo/       ← Active specs, ready for implementation
docs/tasks/future/     ← Acknowledged but deferred
docs/tasks/completed/  ← Implemented, reviewed, with commit references
docs/legacy/           ← Deprecated approaches, failures, abandoned ideas
                         (excluded from AI context to prevent poisoning)
```

## Task Doc Template

Copy into `docs/tasks/todo/YOUR_TASK_NAME.md`:

```markdown
# Title — Brief Descriptive Subtitle

> **Status:** TODO | PLANNING | IN PROGRESS
> **Priority:** P0 (critical) | P1 (important) | P2 (normal) | P3 (polish)
> **Depends on:** What must be done first (or "None")
> **Blocks:** What can't start until this is done (or "None")

## Problem

Why this work exists. Include specific symptoms — file paths, line numbers, error messages.

## Current Implementation

What exists today, anchored to real code. Reference specific files, line counts, function names.

## Proposed Changes

What to build. Be specific: file names, prop interfaces, state ownership, data flow.

### What Does NOT Change

Explicit scope boundary.

## Migration Strategy

Ordered steps from current → proposed. Number them.

## Files Modified

### New Files
- `path/to/new/File.tsx` — purpose (~estimated lines)

### Modified Files
- `path/to/existing/File.tsx` — what changes

### Unchanged
- `path/to/adjacent/File.tsx` — explicitly note files NOT to touch

## Verification

Concrete steps to confirm it works.
```

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|--------------|
| Implementing from conversation alone | Ambiguity, scope drift, context loss |
| Writing the spec but not reviewing it | Inconsistencies propagate |
| Skipping post-implementation review | Spec-reality divergence undetected |
| Storing failure context alongside active specs | Context poisoning |
| Over-engineering the process | Ceremony kills adoption |

## How This Maps to Our Workflow

| Spec-Driven Phase | Our Workflow |
|-------------------|-------------|
| Design session | Annie + Buggy conversation → PRD/task doc |
| Task doc handoff | Buggy writes spec, commits to `docs/tasks/todo/` |
| Implementation | VPS agent or local agent picks up spec, creates branch |
| Review | Buggy reviews PR, runs tests |
| Completion | Buggy merges, moves doc to `completed/`, updates BACKLOG.md |
