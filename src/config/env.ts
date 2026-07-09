/**
 * Central, typed access to environment variables. Import from here instead of
 * reading `process.env` directly so every consumer gets the same fallback.
 *
 * Note: the real oncre-backend's own base URL (`ONCRE_BACKEND_URL`) and the
 * service-account credentials are read directly in
 * `src/lib/server/backend-client.ts`, not here — they must never be
 * accessible from client components, and this file has no such boundary.
 */
export const env = {
  /** ₦5,000 activation fee from PRD 2.4.3, expressed in kobo like the backend's payment amounts. */
  activationFeeKobo: 500_000,
  /** Self-serve merchant portal session (mock identity — see docs/BACKEND_INTEGRATION.md). */
  sessionCookieName: "oncre_session",
  /** Staff console session — a real oncre-backend JWT, separate identity system from the portal above. */
  staffSessionCookieName: "oncre_staff_session",
} as const;
