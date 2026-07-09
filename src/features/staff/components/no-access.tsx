import { ShieldAlert } from "lucide-react";

/**
 * Whole-page RBAC denial (reached by bypassing a hidden nav item, e.g. a
 * `sales` user navigating straight to `/staff/admin/users`). Deliberately a
 * persistent inline state, not an auto-dismissing toast — see
 * lib/utils/staff-permissions.ts for why this is UX only, not enforcement.
 */
export function NoAccess() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-ink-100 bg-white py-20 text-center">
      <ShieldAlert className="h-8 w-8 text-status-serious" />
      <p className="text-base font-medium text-ink-900">You don&apos;t have access to this page.</p>
      <p className="max-w-sm text-sm text-ink-500">
        Your role doesn&apos;t include this section of the staff console. Contact an administrator if you believe
        this is a mistake.
      </p>
    </div>
  );
}
