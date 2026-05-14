Check open visual-feedback tickets from the browser-comments / dev-tix system.

The user files visual bug reports via a widget on their deployed site. Each ticket has a display number, page URL, annotated screenshot, status (open / resolved), and free-text description. When the user says "check tix", "any new tickets?", or "/tix", fetch open tickets and summarize.

## Setup (auto-detected per project)

Two env vars required, expected in the project's `.env.local`:
- `BROWSER_COMMENTS_TOKEN` — project-scoped 32-char token. Often quoted in the file (`BROWSER_COMMENTS_TOKEN="..."`); strip quotes when reading.
- `BROWSER_COMMENTS_API` — API base, almost always `https://dev-tix.vercel.app`.

Look for `.env.local` at the **repo root first**, then fall back to common subpaths (`apps/web/.env.local`, `web/.env.local`, etc.). If neither is found, ask the user for the token.

```bash
TOKEN=$(grep '^BROWSER_COMMENTS_TOKEN=' .env.local 2>/dev/null | cut -d= -f2- | tr -d '"')
[ -z "$TOKEN" ] && TOKEN=$(grep '^BROWSER_COMMENTS_TOKEN=' apps/web/.env.local 2>/dev/null | cut -d= -f2- | tr -d '"')
API="${BROWSER_COMMENTS_API:-https://dev-tix.vercel.app}"
```

The token is passed as a **query parameter** (`?token=$TOKEN`), not an Authorization header. The server rejects Bearer auth.

## Steps

1. **Fetch open tickets.** Exclude images so the response stays small.
   ```bash
   curl -s "$API/api/comments?token=$TOKEN&excludeImages=true&status=open"
   ```
   Returns a JSON array of `{ id, display_number, page_section, url, status, priority, text_annotations, created_at, ... }`.

2. **Summarize to the user.** One line per ticket:
   - `#<display_number> [<priority>] <page_section> — <first ~200 chars of text_annotations[0].text>`
   - Use `display_number` (what the user sees in the widget), not the internal `id`. Keep `id` handy for PATCH calls.
   - If zero open tickets: say so and stop.

3. **Offer to act on them.** Ask the user which to tackle, or whether they want triage / details / a specific ticket. Don't unilaterally start fixing.

4. **For details on one ticket** (the user asks "show me #N"):
   ```bash
   curl -s "$API/api/comments/<internal-id>?token=$TOKEN"
   ```
   The `image_data` field is a base64-encoded annotated screenshot. Don't print it — describe its presence (`screenshot attached`) and let the user look in their browser if needed.

## After fixing a ticket

When code is committed for a ticket, decide with the user before changing status. Two patterns:

- **Resolve immediately** (when the user wants the ticket auto-closed and a record left):
  ```bash
  curl -s -X PATCH "$API/api/comments/<id>?token=$TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"resolved","note":"<short note describing the fix + commit hash>"}'
  ```
- **Leave open with a note** (when the user wants to verify in live before closing):
  ```bash
  curl -s -X PATCH "$API/api/comments/<id>?token=$TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"note":"<context — does not change status>"}'
  ```

Default to leaving open with a note unless the user has said "close it after". Confirm with them on first ticket of a session, then follow that pattern.

## Reopening a ticket

If the user wants a previously-resolved ticket reopened (e.g. fix didn't land in live yet):
```bash
curl -s -X PATCH "$API/api/comments/<id>?token=$TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"open","note":"Reopening — to verify in live."}'
```

## Other ticket operations

The HTTP shape for all PATCH operations is the same — only the body changes:
- `{"status":"resolved"}` / `{"status":"open"}`
- `{"priority":"high"}` (or `med` / `low`)
- `{"assignee":"<name>"}`
- `{"note":"..."}` (free-text comment, doesn't change status)

## Watch-outs

- **Token quoting.** Some projects wrap the value in double quotes in `.env.local`. Always `tr -d '"'` after extraction.
- **`status=open` filter on list.** Without it the response includes resolved tickets too. Default to open-only when the user says "check tix"; offer "all tickets" only if they ask.
- **Display vs internal ID.** Users speak in `#display_number` ("ticket 87"), but PATCH/GET on a single ticket needs the internal `id`. Map display → id when the user references one ticket; the listing already returns both.
- **`image_data` is large.** Always pass `excludeImages=true` for listing; it's optional but worth dozens of KB per response.
- **404 on PATCH.** Means wrong `id` or token mismatch. Don't retry blindly — re-fetch the listing to confirm the id.
- **CLI fallback.** `npx -y @jomafilms/browser-comments-cli list --status open` works too. Use only if the curl path fails for some reason.

## When to use this skill

- User says: "check tix", "/tix", "any new tickets?", "open tickets", "what's in dev-tix", "browser comments".
- Start of a session, if the user mentioned UI feedback was filed.
- After committing a code change that targeted a specific ticket — to leave a note or resolve.
