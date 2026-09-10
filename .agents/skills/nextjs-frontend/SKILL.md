---
name: nextjs-frontend
description: >-
  Expert workflows, architectural patterns, and coding standards for modern Next.js (App Router) frontend applications.
  Use this skill whenever building, refactoring, or reviewing Next.js components, pages, layouts, Server Actions,
  client/server boundaries, state management, and performance optimizations.
---

# Next.js Frontend Engineering Skill (App Router)

This skill equips the AI agent with modern Next.js (App Router) architectural standards, preventing spaghetti code and enforcing high-performance React patterns.

---

## 1. Architectural Blueprint & Directory Layout

Organize Next.js projects with clean separation between routing, domain logic, and presentation:

```text
src/ (or root)
├── app/                  # App Router: Routing, layouts, page shells only
│   ├── (auth)/           # Route groups (clean URLs)
│   ├── (shop)/
│   ├── layout.tsx        # Root layout (fonts, providers, global HTML)
│   ├── page.tsx          # Home page
│   ├── error.tsx         # Boundary for segment errors
│   ├── loading.tsx       # Suspense fallback skeleton
│   └── not-found.tsx     # 404 UI
├── components/
│   ├── ui/               # Reusable primitive UI components (Button, Modal, Input)
│   └── features/         # Feature-specific composite components (CartDrawer, ProductGrid)
├── hooks/                # Custom React hooks (UI & client-side state)
├── services/             # API client methods, DTO mappers, external service callers
├── lib/                  # Utilities, DB clients, constants, helper functions
└── types/                # TypeScript interfaces, types, and Zod schemas
```

---

## 2. Server Components vs Client Components Discipline

The #1 cause of performance degradation and bloated bundles in Next.js is overusing `'use client'`.

### The "RSC-First" Rule:
1. **Default to React Server Components (RSC)**: Every component is a Server Component unless it uses browser APIs (`window`, `localStorage`), React event handlers (`onClick`, `onChange`), or hooks (`useState`, `useEffect`).
2. **Push `'use client'` to the Leaves**:
   - ❌ **BAD**: Putting `'use client'` at the top of a large `page.tsx`.
   - ✅ **GOOD**: Keep `page.tsx` as a Server Component that fetches data, and pass data as props to small, focused Client Components (e.g. `<AddToCartButton />`).
3. **Never pass server-only secrets to Client Components**.

---

## 3. Data Fetching & Mutations

### Data Fetching:
- Fetch directly in Server Components using native `fetch` with appropriate revalidation (`next: { revalidate: 3600 }` or `next: { tags: ['products'] }`).
- For client-side dynamic polling or cached queries, use SWR or TanStack Query.
- Never write raw SQL or secret credentials inside client-side components.

### Mutations (Server Actions):
- Put Server Actions in dedicated files (e.g., `actions/products.ts`) marked with `'use server'`.
- Validate all incoming arguments using **Zod** schemas before executing business logic.
- Return structured result objects `{ success: boolean, data?: T, error?: string }` instead of throwing unhandled exceptions to the client.
- Call `revalidatePath()` or `revalidateTag()` to purge stale cache after mutations.

---

## 4. Performance & Media Standards

1. **Images (`next/image`)**:
   - Always use `next/image` with explicit `width` and `height`, or `fill` with a parent `relative` container.
   - Use `priority` only on the above-the-fold hero image (LCP element).
2. **Fonts (`next/font`)**:
   - Load Google or Local fonts via `next/font` in `layout.tsx` with `display: 'swap'` and `subsets: ['latin', 'vietnamese']`.
3. **Dynamic Imports**:
   - Lazy-load heavy client libraries (modals, rich text editors, charts) using `next/dynamic({ ssr: false })`.

---

## 5. Anti-Spaghetti & Code Quality Checklist

- [ ] **Strict File Size Ceiling (< 150 lines)**: Never allow any file to grow towards 500–1000 lines. Split large components into sub-components in a dedicated `components/features/<name>/` folder.
- [ ] **Search & Reuse First (DRY)**: Check `components/ui/`, `hooks/`, and `lib/` before writing new components or helpers. Reuse existing primitives (Button, Modal, Input, formatting utilities).
- [ ] **No Business Logic in UI**: Move business rules, validation, and calculations to custom hooks or services.
- [ ] **Early Returns**: Flatten nested conditional JSX (guard against empty/loading/error states early).
- [ ] **Type Safety**: Strictly type all props, Server Action parameters, and API responses. Avoid `any`.
- [ ] **Verification**: Run `npm run lint` and `npm run build` (or `tsc --noEmit`) to verify zero build or type errors.
