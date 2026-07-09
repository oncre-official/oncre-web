import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { toast } from "@/lib/stores/toast-store";
import { ApiError } from "@/types/api";

/**
 * The one place that reacts to a dead staff session (no refresh token exists
 * on the real backend — see docs/BACKEND_INTEGRATION.md-equivalent reasoning
 * in the staff-console plan): a 401 from any `/api/staff/**` call means the
 * JWT is gone, so we clear local state and hard-navigate to login rather
 * than leaving the SPA in a half-authenticated state. Everything else is a
 * normal action failure, surfaced as a toast (matches the existing
 * `manual-entry-form.tsx`/`kanban-board.tsx` convention).
 */
export function handleStaffApiError(error: unknown): void {
  if (error instanceof ApiError && error.status === 401) {
    useStaffSessionStore.getState().setUser(null);
    window.location.href = "/staff/login?notice=session-expired";
    return;
  }

  toast.error(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
}
