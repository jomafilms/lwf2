Initialize the agent workflow system in the current project.

Only run this if the project does NOT already have `docs/CURRENT-STATUS.md` and `.claude/skills/update.md`.

## Steps

1. Create `.claude/skills/` directory if it doesn't exist
2. Copy these skill files from `~/Projects/claude-skills/.claude/skills/` to the project:
   - `update.md`
   - `review.md`
   - `project-status.md`
3. Create `docs/` directory if it doesn't exist
4. Copy `~/Projects/claude-skills/templates/CURRENT-STATUS.md` to `docs/CURRENT-STATUS.md`
5. Copy `~/Projects/claude-skills/templates/PROJECT-RULES.md` to `docs/PROJECT-RULES.md`
6. If `.claude/CLAUDE.md` exists, prepend the workflow section from `~/Projects/claude-skills/templates/CLAUDE-WORKFLOW.md` to the top
7. If `.claude/CLAUDE.md` does NOT exist, copy the full `CLAUDE-WORKFLOW.md` as `.claude/CLAUDE.md`

## Interview for project rules (do NOT skip)

Instead of asking Annie to fill in PROJECT-RULES.md herself, conduct a short interview:

1. "What does this project do?" → Write a 1-2 sentence summary
2. "What are the 3-5 most important business rules?" → Write each as a rule with "why" and "edge cases"
3. "What tech stack and key libraries?" → Fill in technical constraints
4. "What should agents never do in this project?" → Fill in guardrails
5. "Are there any reference docs I should always read?" → Add to Tier 1 references

Write the answers directly into `docs/PROJECT-RULES.md` and `docs/CURRENT-STATUS.md`.

## Finalize

9. Fill in the project name in CURRENT-STATUS.md
10. Commit all new files: "Initialize agent workflow system"
