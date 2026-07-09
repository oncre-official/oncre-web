# Oncre Web

The Oncre web platform — a Next.js implementation of `Oncre_PRD_v1.0.docx.pdf`:
Module 1 (public landing page + Enterprise/FI lead capture) and Module 2 (the
self-serve Merchant Portal: registration, ₦5,000 activation paywall, CSV/manual
debtor ingestion, and the 21-day recovery Kanban board).

This frontend is paired with `oncre-backend` (NestJS + MongoDB). **Read
[`docs/BACKEND_INTEGRATION.md`](docs/BACKEND_INTEGRATION.md) first** — the
PRD's self-serve product and the backend's current internal-ops data model
don't fully overlap yet, and that document explains exactly what's wired to
the real API versus served by a local mock, and why.

## Stack

- Next.js 16 (App Router) + TypeScript, Tailwind CSS v4
- React Hook Form + Zod for validation
- Zustand for client state (session, onboarding wizard progress)
- PapaParse for CSV parsing

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — see below
npm run dev
```

Open http://localhost:3000. No database or backend is required to exercise
every PRD flow — by default everything runs against an in-memory mock store
(`src/lib/server/portal-store.ts`).

To additionally persist real cases into a running `oncre-backend` + MongoDB
instance, set `ONCRE_BACKEND_URL` and a seeded staff account's
`ONCRE_SERVICE_ACCOUNT_EMAIL` / `ONCRE_SERVICE_ACCOUNT_PASSWORD` in
`.env.local` — see `.env.example` and `docs/BACKEND_INTEGRATION.md`.

## Scripts

```bash
npm run dev      # start the dev server
npm run build    # production build
npm run start    # run the production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

## Project structure

```
src/
  app/                    Routes (App Router)
    (auth)/               /login, /signup, /signup/verify
    (portal)/             /onboarding/activate, /onboarding/upload, /dashboard
    api/                  Route handlers — the BFF layer (see below)
    page.tsx              Public landing page (Module 1)

  features/               UI grouped by product area, not by component type
    landing/               Hero, FI lead modal/form, UTM capture
    auth/                  Register/OTP/login forms, step indicator
    onboarding/            Activation paywall, CSV upload, manual entry
    dashboard/             KPI row, Kanban board/columns, case-detail drawer
    portal/                Shared portal chrome (topbar)

  components/ui/          Framework-agnostic primitives (Button, Input,
                           Modal, Drawer, Tabs, Badge, Card, Toaster, ...)

  lib/
    api/                   Browser-side clients — call our own /api/* routes
    server/                Server-only: in-memory portal store, the real
                           backend proxy client, session cookie handling,
                           case-ingestion (real-then-fallback logic)
    stores/                Zustand stores (session, onboarding wizard, toasts)
    utils/                 cn, currency, phone, CSV, case-phase mapping, KPIs
    validation/             Zod schemas shared by client forms and server
                           route handlers (single source of truth per form)

  types/                   Types mirroring oncre-backend models exactly
                           (case.ts, merchant.ts, payment.ts, ...) plus the
                           PRD-only mock domain (portal.ts, fi-lead.ts)

  config/                  env.ts, site.ts (nav copy, Kanban phase config)
  proxy.ts                 Route guard (Next 16's middleware convention) —
                           enforces the paywall/auth gates (AC-KAN-002/003)

docs/
  BACKEND_INTEGRATION.md  Real vs. mocked endpoint mapping and migration notes
```

## Design notes

- **Validation lives once, in `lib/validation/*.schema.ts`.** Forms use it
  via `zodResolver`; the matching API route re-validates the same schema
  server-side, so client and server can never drift.
- **API routes never touch the database/store directly from components.**
  Route handlers call into `lib/server/*`; browser code calls into
  `lib/api/*`, which only ever talks to our own `/api/*` routes.
- **Every Kanban case carries a `source: "backend" | "mock"` tag** so the
  hybrid real/local integration is visible in the UI, not hidden behind an
  abstraction that pretends it's all one thing.
