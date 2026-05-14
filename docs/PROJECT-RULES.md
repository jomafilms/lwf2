# [Project Name] — Project Rules

**Last Updated:** YYYY-MM-DD
**Owner:** [Name]

<!-- This is the authoritative source for business rules and constraints. -->
<!-- Agents check code against this doc. If code conflicts, they stop and ask. -->

---

## Business Rules

<!-- Document your project's key business rules here. -->
<!-- Example format: -->

### Rule 1: [Name]
- **Rule:** [What the system must do]
- **Why:** [Business reason]
- **Edge cases:** [What to watch for]

### Rule 2: [Name]
- ...

---

## Technical Constraints

<!-- Non-negotiable technical decisions -->

- **Framework:** [e.g., Next.js 15, React 19]
- **Database:** [e.g., PostgreSQL with Drizzle ORM]
- **Auth:** [e.g., BetterAuth]
- **Payments:** [e.g., Stripe]
- **File size max:** 250-300 lines per file
- **No hardcoded values:** Everything in config files

---

## What Agents Should NOT Do

<!-- Guardrails -->

- Do not change business rules without asking [Owner]
- Do not add dependencies without justification
- Do not skip tests on critical paths
- Do not commit code without updating CURRENT-STATUS.md
