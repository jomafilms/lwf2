Spin up an independent agent to review the current changes. Use this after step 4 (VERIFY) and before step 6 (UPDATE) in the workflow cycle.

## When to use this (triggers)
- Code touches **money** (pricing, payments, distributions, payouts)
- Code touches **security** (auth, access control, cookies, sessions)
- Code touches **business rules** (anything in docs/PROJECT-RULES.md)
- A **new file** was created (not just editing existing)
- Change is **large** (>100 lines or >3 files)

If none of these triggers apply, skip the review — the building agent's own checklist is sufficient.

## What the review agent checks

Launch a background Agent with this prompt:

"You are an independent reviewer. Read these files:
1. The git diff of staged/unstaged changes: `git diff` and `git diff --cached`
2. `docs/PROJECT-RULES.md` — project business rules and constraints
3. Any security/hardening docs referenced in CURRENT-STATUS.md

Check the changes against:
- **Business rules:** Does the code match the project rules? Flag any conflicts.
- **DRY:** Is logic duplicated? Should anything be a shared helper?
- **Hardcoded values:** Any magic numbers that should be in config?
- **File size:** Any file over 300 lines?
- **Security:** XSS, injection, auth bypass, IDOR, race conditions?
- **Testability:** Can new functions be tested independently?
- **Edge cases:** Null checks, empty arrays, boundary conditions?

Output: PASS (with any minor notes) or FAIL (with specific issues to fix before committing).

If FAIL: fix the issues. If a business rule conflict is found, flag it for the project owner — do NOT assume either the code or the rule is correct."

## After the review
- If PASS: proceed to step 6 (UPDATE)
- If FAIL: fix issues, re-verify (step 4), then re-review
- If business rule conflict: ask the project owner before proceeding
