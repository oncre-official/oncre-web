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
/** Mirrors `CaseController#createCase` `@Roles(...)` — Sales handles case ingestion only (no dispute/transition rights). */
export const CASE_CREATE_ROLES = ["admin", "super-admin", "recovery", "sales"] as const;
/** Mirrors dispute resolve+escalate / `CaseController#transition` `@Roles(...)`. */
export const CASE_ACTION_ROLES = ["admin", "super-admin", "recovery"] as const;
/** Mirrors `MerchantController#createMerchant` `@Roles(...)` — Sales registers merchants only, not debtors. */
export const MERCHANT_CREATE_ROLES = ["admin", "super-admin", "sales", "field-agent"] as const;
/** Mirrors `CustomerController#createCustomer` `@Roles(...)` — Sales is intentionally excluded. */
export const DEBTOR_CREATE_ROLES = ["admin", "super-admin", "field-agent"] as const;
/** Mirrors `CallController#findCall` / `#findCallList` / `CallLogController#logCalls` `@Roles(...)`. */
export const CALL_PRIVILEGED_ROLES = ["admin", "super-admin", "recovery"] as const;
/** Mirrors `PaymentController#findPayment` `@Roles(...)`. */
export const PAYMENT_VIEW_ROLES = ["admin", "super-admin", "recovery"] as const;
/** Mirrors `PaymentController#createCase` (plan) `@Roles(...)`. */
export const PAYMENT_PLAN_CREATE_ROLES = ["admin", "super-admin", "recovery"] as const;
/**
 * Mirrors `AdminController` `@Roles(...)` on the mutation routes. `GET
 * admin/users` itself has no backend role restriction, but the console still
 * gates the whole Admin Users page to this list as a matter of product
 * intent — a UI-only restriction layered on a more permissive backend.
 */
export const ADMIN_USER_ROLES = ["admin", "super-admin"] as const;
/**
 * SOW role table: Admin (Ops) has full access to Dashboard/Recovery/Reminder/
 * Payment/Users but explicitly "Cannot access Settings" — Settings (role
 * management, commission config, platform config, audit log) is Super Admin
 * only. UI-only nav restriction, same caveat as `ADMIN_USER_ROLES` above —
 * the backend routes underneath are unchanged this pass.
 */
export const SETTINGS_MODULE_ROLES = ["super-admin"] as const;
/** Users module (merchant + debtor directory) nav visibility — Recovery has no Users access per the SOW role table. */
export const USERS_MODULE_ROLES = ["admin", "super-admin", "sales", "field-agent"] as const;
/** Mirrors `MerchantController#deactivateMerchant` / `CustomerController#deactivateCustomer` `@Roles(...)`. */
export const MERCHANT_CUSTOMER_DEACTIVATE_ROLES = ["admin", "super-admin"] as const;
/** Mirrors `DashboardController#summary` `@Roles(...)` — all 5 staff roles can hit the endpoint. */
export const DASHBOARD_ROLES = ["admin", "super-admin", "sales", "field-agent", "recovery"] as const;
/**
 * UI-only mirror of `DashboardService#summary`'s server-side role check that
 * decides whether `payment_pipeline`/`upcoming_payments` are even present in
 * the response body — Recovery/Sales/field-agent never receive those keys
 * over the wire, this constant just controls whether the UI *tries* to
 * render sections that would be `undefined` anyway.
 */
export const DASHBOARD_PAYMENT_ROLES = ["admin", "super-admin"] as const;
/** Mirrors `AgentController#findActivationSubmissions` `@Roles(...)`. */
export const AOP_SUBMISSIONS_ROLES = ["admin", "super-admin"] as const;
/** Mirrors `MerchantController#approveMerchant` / `#rejectMerchant` `@Roles(...)`. */
export const MERCHANT_APPROVAL_ROLES = ["admin", "super-admin"] as const;

export interface DashboardQuickAction {
  label: string;
  href: string;
  allowedRoles: readonly string[];
}

/** Curated dashboard quick actions — per the AC role matrix (not the full nav, see `staffNavItems`). */
export const DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  { label: "New Case", href: "/staff/recovery?create=1", allowedRoles: [...DASHBOARD_PAYMENT_ROLES, "recovery", "sales"] },
  { label: "View Call List", href: "/staff/recovery?tab=calls", allowedRoles: [...DASHBOARD_PAYMENT_ROLES, "recovery"] },
  { label: "Open Dispute Queue", href: "/staff/recovery?tab=disputes", allowedRoles: DASHBOARD_PAYMENT_ROLES },
  {
    label: "Register Merchant",
    href: "/staff/users?tab=merchants&create=1",
    allowedRoles: [...DASHBOARD_PAYMENT_ROLES, "sales"],
  },
];

export function hasRole(roleName: string | undefined, allowed: readonly string[]): boolean {
  return !!roleName && allowed.includes(roleName);
}
