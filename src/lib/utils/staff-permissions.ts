/**
 * Single source of truth for the staff console's role→action matrix. Every
 * constant mirrors an exact `@Roles(...)` list on the real oncre-backend
 * (paths noted per constant) — this is UX only. The backend's `RoleGuard`
 * (fresh DB lookup per request) is the only real enforcement; every
 * `/api/staff/**` route handler must behave correctly even if every check
 * here were bypassed entirely (e.g. via devtools or a direct curl).
 */

export const STAFF_ROLES = [
  "super-admin",
  "admin",
  "recovery",
  "sales",
  "field-agent",
  "merchant",
  "customer",
] as const;

export type StaffRoleName = (typeof STAFF_ROLES)[number];

/** Mirrors `CaseController#findCase` `@Roles(...)`. */
export const CASE_LIST_ROLES = ["admin", "super-admin", "sales", "field-agent", "recovery"] as const;
/** Mirrors `CaseController#createCase` / dispute resolve+escalate / `#transition` `@Roles(...)`. */
export const CASE_ACTION_ROLES = ["admin", "super-admin", "recovery"] as const;
/** Mirrors `MerchantController#createMerchant` / `CustomerController#createCustomer` `@Roles(...)`. */
export const MERCHANT_CUSTOMER_CREATE_ROLES = ["admin", "super-admin", "sales", "field-agent"] as const;
/** Mirrors `CallController#findCallList` / `CallLogController#logCalls` `@Roles(...)`. */
export const CALL_PRIVILEGED_ROLES = ["admin", "super-admin", "recovery"] as const;
/** Mirrors `PaymentController#createCase` (plan) `@Roles(...)`. */
export const PAYMENT_PLAN_CREATE_ROLES = ["admin", "super-admin", "recovery"] as const;
/**
 * Mirrors `AdminController` `@Roles(...)` on the mutation routes. `GET
 * admin/users` itself has no backend role restriction, but the console still
 * gates the whole Admin Users page to this list as a matter of product
 * intent — a UI-only restriction layered on a more permissive backend.
 */
export const ADMIN_USER_ROLES = ["admin", "super-admin"] as const;

export function hasRole(roleName: string | undefined, allowed: readonly string[]): boolean {
  return !!roleName && allowed.includes(roleName);
}
