# My Shop Admin

A multi-shop e-commerce admin panel for managing shops, products, and inventory - built as a frontend developer assessment. Authorized users can create and manage shops and their products, monitor stock levels, adjust inventory with a full audit trail, and view dashboard insights, all gated by role (Administrator / Viewer).

**Live demo:** https://my-shop-admin-six.vercel.app
**Repo:** https://github.com/Munene-Kariuki/my-shop-admin

## Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Administrator (full access) | `admin@myshop.test` | `password123` |
| Viewer (read-only) | `viewer@myshop.test` | `password123` |

## Technologies Used

- **React 19 + TypeScript + Vite** — app shell and build tooling
- **React Router 7** — client-side routing, nested layouts, route guards
- **Tailwind CSS v4 + shadcn/ui (Radix primitives)** — accessible, unstyled-by-default UI components
- **TanStack Query** — server-state cache, invalidation, optimistic updates, retry policy
- **TanStack Table** (pinned to the stable **v8** line — see [Key Decisions](#key-technical-decisions--trade-offs)) — table headers/sorting, paired with server-side pagination
- **React Hook Form + Zod** — form state and validation, schemas shared between create/edit forms
- **Zustand** (with `persist`) — authenticated session state
- **Recharts** — dashboard charts
- **Mock Service Worker (MSW)** — the mock REST API (see [Mock API](#how-to-run-the-mock-api))
- **sonner** — toast notifications for mutation success/failure
- **Vitest + React Testing Library** — unit/integration tests

## Architecture and Folder Structure

```
src/
  app/                 # router, layout shell (sidebar/topbar/breadcrumbs), providers, error boundary
  components/
    ui/                # shadcn/ui generated primitives (button, dialog, table, select, ...)
    common/            # app-wide reusable pieces: DataTable, EmptyState, ErrorState,
                        # StatCard, ImageWithFallback, RoleGate, StockStatusBadge, ...
  features/
    auth/               # login, session store, route guards (ProtectedRoute/PublicOnlyRoute/RequireRole)
    dashboard/          # dashboard page, charts, derived-summary hook
    shops/              # shop list/details/create-edit pages, api.ts, hooks.ts, schema.ts, components/
    products/           # product list/details/create-edit pages, inventory adjustment, same pattern
    NotFoundPage.tsx
  hooks/                # generic reusable hooks (useDebounce, useUrlState)
  lib/                  # api client, query client/keys, formatting, zod helpers, status colors
  mocks/                # the mock API: in-memory db, seed data, MSW request handlers
  test/                 # test setup, shared render/query-client helpers, auth test helpers
  types/                # domain types (Shop, Product, User, ...) and API request/response contracts
```

Each feature folder follows the same layering, so any feature is a template for the next:

- `api.ts` — the only place that calls `apiClient` for that feature (never called directly from components)
- `hooks.ts` — TanStack Query hooks wrapping `api.ts` (queries + mutations, cache invalidation, toasts)
- `schema.ts` — Zod schema + inferred form types, shared by create and edit
- `<Feature>ListPage.tsx` / `<Feature>DetailsPage.tsx` / `<Feature>FormPage.tsx` — route-level pages
- `components/` — pieces used only within that feature (e.g. `DeleteShopDialog`, `InventoryAdjustmentDialog`)

## Setup Instructions

**Requirements:** Node.js 20+ and npm.

```bash
git clone git@github.com:Munene-Kariuki/my-shop-admin.git
cd my-shop-admin
npm install
```

## Environment Variable Requirements

**None.** There is no real backend — the "API" is Mock Service Worker running entirely in the browser (see below) — so there's no `.env` file, API URL, or secret to configure.

## How to Run the Mock API

There's nothing to start separately. MSW registers a service worker (`public/mockServiceWorker.js`) that intercepts `fetch` calls to `/api/*` and serves them from an in-memory database, seeded on first load and persisted to `localStorage` afterwards (so your data survives a refresh). This happens automatically in **every** environment — `npm run dev`, `npm run build && npm run preview`, and the deployed site — which is exactly why the deployed app keeps working with no separate server to host or keep alive.

To reseed from scratch, clear the `my-shop-admin:db:v1` key from your browser's local storage (DevTools → Application → Local Storage) and reload.

## How to Run the Application

```bash
npm run dev       # start the dev server (http://localhost:5173)
npm run build      # type-check (tsc -b) and produce a production build in dist/
npm run preview    # serve the production build locally
```

## How to Run the Tests

```bash
npm run test        # run the full suite once (Vitest)
npm run test:watch  # watch mode
npm run test:ui     # Vitest's browser UI
npm run lint        # ESLint
```

The suite has **170+ tests** across the mock API handlers, hooks, and every page/dialog — including the specifically-required cases: login validation, protected-route redirects, product form validation, a shop and a product mutation, the shop delete-blocked-by-products rule, and filter/sort/pagination interactions.

## Key Technical Decisions & Trade-offs

- **MSW over JSON Server.** MSW runs in the browser via a service worker, so there's no second process/host to deploy or keep alive — the mock API deploys along with the static site itself, directly satisfying the requirement that the deployed app keep working without a locally-run API. The trade-off is writing request handlers by hand instead of getting them for free, which also meant hand-rolling query-param based filtering/sorting/pagination (in `src/mocks/utils.ts` and each handler) — but that mirrors what a real Express/Nest endpoint would do anyway.
- **TanStack Table pinned to v8, not v9.** `@tanstack/react-table@9` (the version that resolves from `^9` today) ships a very different, sparsely-documented hook-factory API. The project pins the stable, extensively-documented v8 line instead, used only for header rendering/sorting (`manualSorting: true`) since pagination and filtering are server-driven.
- **One optimistic update, not everywhere.** The stock-adjustment mutation optimistically patches the cached product's stock in `onMutate`, rolls back the exact snapshot in `onError`, and invalidates the broader lists/dashboard/history in `onSettled` (`src/features/products/hooks.ts`, `useAdjustInventory`). Other mutations (shop/product create-edit-delete) invalidate-and-refetch instead: they navigate away or show a full-page loading state on success anyway, so there's no perceptible win from patching the cache by hand, and it would mean keeping several list/detail caches in sync in more places than is worth the risk of getting one out of sync.
- **Client-side RBAC, doubled up.** `RoleGate` hides/disables the triggering UI (buttons, links) and `RequireRole` additionally blocks direct navigation to admin-only routes by URL. Both are enforced entirely in the browser, which is acceptable for this assessment per its own instructions, but is not how this should work in production — see [Production Auth](#how-authentication-and-authorization-would-differ-in-production).
- **Fixed product category list.** The mock API has no list categories endpoint, so the category filter/select uses a fixed constant (`src/features/products/constants.ts`) mirroring the categories the seed data was generated with, rather than deriving it from a paginated products response.
- **A generated data-viz palette, not eyeballed colors.** The two dashboard charts use a fixed status palette (in-stock/low-stock/out-of-stock → good/warning/critical) and a single sequential hue for the magnitude comparison (top-5-shops), chosen for contrast and colorblind-safety rather than picked by eye — identity is also carried by icon/sign and axis labels, not color alone.

## Assumptions Made

- Only **Shop Name** is a required field on the shop form; Description, Logo URL, Contact Email, and Status are optional but validated (URL/email format) when a value is provided — matching the assessment's field list, which marks only the name as required.
- SKU uniqueness is checked case-insensitively.
- "Last Updated" on a product changes on any field edit **and** on a stock adjustment (both are meaningful updates to the record).
- The stock-status thresholds (out-of-stock = 0, low-stock = 1–5, in-stock = 6+) are exactly as specified and centralized in one place (`getStockStatus` in `src/types/domain.ts`) rather than re-implemented per screen.

## Known Limitations / Incomplete Requirements

- **No production backend.** By design (see decisions above) — this needs a real API, real auth, and a real database before it could run as anything but a demo.
- **Bundle size.** The production bundle is a single ~1MB (min) / ~300KB (gzip) chunk; a route-based code-splitting pass (lazy-loaded route elements per feature) would bring this down but wasn't done here to keep the router simple.
- **Table density/page-size aren't user-configurable or persisted** (the Persisted table preferences bonus item) — page size is fixed at 10 everywhere.
- **No Storybook, Docker setup, or CI workflow** — all listed as optional/bonus in the brief; skipped in favor of finishing the core requirements and this documentation properly.
- **No E2E tests** (Playwright/Cypress) — the Vitest + React Testing Library suite covers the required scenarios at the unit/integration level instead.
- **No dark mode toggle** — `next-themes` is present only because shadcn's `<Toaster>` component depends on it; there's no theme switcher UI.

## Future Improvements

- Route-based code splitting to shrink the initial bundle.
- Bulk product actions and CSV export (both bonus items) on the product list.
- Persist table page-size/density preferences (e.g. to `localStorage`) per view.
- Skeleton loading states on the list pages' first paint (currently a loading spinner state in the table body; the dashboard and detail pages already use skeletons).
- Optimistic updates for the shop/product delete actions (remove the row immediately, roll back on failure) now that the inventory-adjustment mutation has proven the pattern in this codebase.

## How Authentication and Authorization Would Differ in Production

This assessment's client-side-only auth is explicitly acceptable per the brief, but it is not secure and shouldn't be mistaken for a real auth system. In production:

- **Sessions would be server-issued and verified server-side**, not a client-constructed, unsigned base64 payload (`src/mocks/auth.ts` — `issueToken`/`requireAuth` are mock-only stand-ins for this). A real backend would issue a signed JWT (or, better for a web admin panel, an **httpOnly, `Secure`, `SameSite` cookie** holding an opaque or signed session id) so the token is never readable/stealable via JavaScript (mitigating XSS token theft, which the current `localStorage`-persisted Zustand store is vulnerable to).
- **Authorization would be re-checked on every request, server-side.** The mock API's `requireRole` checks are the right idea but currently trust a client-decoded payload; a real API must independently verify the caller's role from its own session/user store on every mutating endpoint — the frontend's `RoleGate`/`RequireRole` are a UX nicety, never the actual security boundary.
- **Passwords would never be compared in plaintext or stored in a seed file.** A real system hashes passwords (bcrypt/argon2) server-side and never round-trips them to the client.
- **Token refresh and expiry** would be handled with a short-lived access token plus a refresh flow, rather than a single 12-hour token with no renewal.
- **CSRF protection** would be needed once sessions move to cookies (a double-submit token or `SameSite=Strict`/`Lax` cookies plus origin checks).
- **Rate limiting and audit logging** on auth endpoints (login attempts, role changes) would sit on the server, not the client.
