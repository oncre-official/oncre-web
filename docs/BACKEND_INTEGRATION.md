# Backend integration: what's real, what's mocked, and why

This frontend implements every flow in `Oncre_PRD_v1.0.docx.pdf`. The real
`oncre-backend` (NestJS + MongoDB) does not yet model several of those flows,
so this document is the source of truth for what talks to the real API
today, what's served by a local mock, and exactly what would need to change
on either side to close the gap.

## The core mismatch

The PRD describes a **self-serve SME product**: a merchant registers online,
verifies an OTP, pays a ₦5,000 activation fee, and manages *their own* cases.

The real backend today is an **internal ops console**: staff users
(`admin` / `super-admin` / `sales` / `recovery` / `field-agent`) log in and
create Merchants, Customers and Cases *on behalf of* debtors, gated by
`RoleGuard`. There is no:

- Self-registration endpoint (only `POST /api/v1/auth/login` exists)
- OTP issuance/verification for merchants
- `fi_leads` table/module for the landing page's Enterprise lead form
- Bulk CSV case-import endpoint
- Merchant-activation payment flow (`Payment.type` already has an
  `ACTIVATION` enum value reserved for this — see
  `src/app/payment/types/payment.interface.ts` in oncre-backend — but no
  route creates or confirms one)
- Any endpoint scoped to "cases belonging to the merchant who is logged in"

Because of this, the self-serve merchant **identity** (register → OTP →
login → activation) cannot be backed by the real backend at all yet. It's
served entirely by an in-memory store (`src/lib/server/portal-store.ts`,
cached on `globalThis` so it survives Next.js Fast Refresh in dev).

## What is genuinely wired to the real backend

Once a portal account is activated, the **case data itself** overlaps
naturally with the backend's real domain model. `src/lib/server/backend-client.ts`
is a server-only client, authenticated with a privileged service account,
that calls the real endpoints:

| Action | Real endpoint used |
|---|---|
| Persist a case from CSV/manual entry | `POST /api/v1/merchants` (find-or-create), then `POST /api/v1/cases` |
| List a merchant's cases for the Kanban | `GET /api/v1/cases?merchant_id=...` |
| Case-detail timeline (calls) | `GET /api/v1/calls?case_id=...` |
| Case-detail timeline (SMS) | `GET /api/v1/messages?case_id=...` |
| Case-detail payment history | `GET /api/v1/payments?case_id=...` |

This only activates if `ONCRE_SERVICE_ACCOUNT_EMAIL` / `ONCRE_SERVICE_ACCOUNT_PASSWORD`
are set (see `.env.example`) and point at a real, running backend with a
seeded staff user. **If unset, or the backend is unreachable, every call
falls back transparently to the local store** — `getBackendClient()` returns
`null` up front when unconfigured, and `case-ingestion.ts` catches
`BackendUnavailableError` around each call it does make.

Each `Case` returned to the frontend carries a `source: "backend" | "mock"`
field (see `SourcedCase` in `src/types/portal.ts`) so the Kanban board can be
honest about where a given record actually lives — shown as a small
"Synced"/"Local" badge on each card. A backend-persisted case keeps the
backend's own `CA-00001`-style id; a locally-stored fallback gets the PRD's
`ONC-XXXXXX` format (`src/lib/server/id.ts`).

The first time a portal account's case is persisted to the real backend, the
backend's own generated `merchant_id` (e.g. `MER-00007`) is cached against
the portal account (`recordBackendMerchantId`) so subsequent list/detail
calls can filter correctly — the portal's own `merchant_id` (`PMER-xxxxxxxx`)
and the backend's are different identifier spaces and are never conflated.

## What is fully mocked, with no real endpoint to call

| PRD feature | Route(s) | Why |
|---|---|---|
| FI lead capture (Module 1) | `POST /api/leads/fi` | No `fi_leads` table/module exists in oncre-backend |
| Merchant registration | `POST /api/auth/register` | No self-registration endpoint |
| OTP verification/resend | `POST /api/auth/verify-otp`, `POST /api/auth/resend-otp` | No OTP flow for merchants |
| Portal login | `POST /api/auth/login` | Portal accounts don't exist as real backend `User` documents |
| ₦5,000 activation paywall | `POST /api/payments/initiate`, `POST /api/webhooks/payment` | No activation-payment route exists (only case repayment plans) |

Third-party dispatch described in the PRD (SendGrid confirmation emails,
Termii/SMS OTP delivery, the CRM webhook, Slack notifications, reCAPTCHA v3)
are backend/ops concerns and are not called from this frontend at all — OTPs
are returned directly in the API response and logged to the server console
for local testing instead.

## Migrating a mocked flow to the real backend

When the backend gains an equivalent endpoint, the swap is scoped to two
places per flow — nothing in `src/features/*` or `src/app/**/page.tsx` needs
to change:

1. **`src/app/api/**` route handlers** — replace the `portal-store.ts` call
   with a call through `backend-client.ts` (add a method there if needed).
2. **`src/lib/api/portal.ts`** — the browser-facing client — usually doesn't
   need to change at all, since it already just calls our own `/api/*`
   routes.

The one exception is portal **identity** (register/OTP/login): today those
routes mint an opaque portal session (`src/lib/server/session.ts`) entirely
locally. If the backend adds real self-serve merchant accounts with a
`merchant` role and JWTs, session issuance would move to calling
`POST /api/v1/auth/register` (net new) and `POST /api/v1/auth/login`
directly, and the cookie would carry the real JWT instead of an opaque
token — `middleware.ts` would need updating to inspect claims instead of the
own-rolled `{ token, status }` payload it reads today.

## A known backend caveat worth knowing before wiring more of this up

Per oncre-backend's own `CLAUDE.md`: `JwtStrategy.validate` is currently a
pass-through stub — it does not decode/attach a user from the token payload.
Handlers that need `request.user` (via the `@User()` decorator) should be
checked case-by-case before assuming a Bearer token alone is sufficient
against a live instance.
