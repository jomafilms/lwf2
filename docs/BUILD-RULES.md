# Build Rules — Common Errors to Avoid

## Next.js 15 Gotchas

### 1. Async Params (BREAKING)
All page and API route params must be `Promise<{}>` and awaited:

```typescript
// ❌ WRONG (Next.js 14 style)
export default function Page({ params }: { params: { id: string } }) {

// ✅ CORRECT (Next.js 15)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

Same for API routes:
```typescript
// ❌ WRONG
export async function GET(req: Request, { params }: { params: { id: string } }) {

// ✅ CORRECT
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
```

### 2. Nullable Drizzle Columns
`timestamp().defaultNow()` without `.notNull()` makes the column `Date | null`.

```typescript
// ❌ WRONG — will crash on null
createdAt.toLocaleDateString()

// ✅ CORRECT — guard nulls
createdAt?.toLocaleDateString() ?? 'N/A'
```

### 3. Drizzle Operators
Use `ne()`, `gt()`, `lt()` from `drizzle-orm`, NOT method chaining:

```typescript
// ❌ WRONG
.where(column.notEqualTo(value))

// ✅ CORRECT
import { ne, gt, lt } from 'drizzle-orm';
.where(ne(column, value))
```

### 4. Type Casting
Typed interfaces need double cast to `Record<string, unknown>`:

```typescript
// ❌ WRONG
const data = myTypedObject as Record<string, unknown>;

// ✅ CORRECT
const data = myTypedObject as unknown as Record<string, unknown>;
```

### 5. ALWAYS Build Before Push
`npm run dev` does NOT catch type errors. Always run:

```bash
cd apps/web && npx next build
# or from root:
npm run build
```

Fix all errors before pushing.
