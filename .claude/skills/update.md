Complete steps 6-8 of the agent workflow cycle. This is the "finish line" for any task.

## Step 6: Update docs

Read `docs/CURRENT-STATUS.md`. Then update it:

1. Move completed work from "What's In Progress" to "What Was Last Done"
2. Update "What's Next" if priorities changed
3. Update "Known Issues / Blockers" if anything new
4. Update "Open Decisions" if code diverged from project rules
5. Update the "Last Updated" date and "Last Commit" hash

## Step 7: Commit together

Stage BOTH code files AND the updated CURRENT-STATUS.md in the same commit.
Never commit code without updating the status doc.

## Step 8: Handoff

Confirm to the user:
- What was completed (1-2 sentences)
- What's ready for the next task
- Any issues or decisions flagged

## If this is a significant phase completion:

Copy the current CURRENT-STATUS.md to `docs/status/YYYY-MM-DD-description.md` as an archived snapshot before updating it for the next phase.
