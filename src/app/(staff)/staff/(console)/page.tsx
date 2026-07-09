"use client";

import { StaffDashboard } from "@/features/staff/components/staff-dashboard";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";

export default function StaffHomePage() {
  const user = useStaffSessionStore((s) => s.user);
  const roleName = user?.role?.name;

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink-900">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>
      <p className="mb-6 text-sm text-ink-500">
        Signed in as <span className="font-medium text-ink-700">{roleName ?? "—"}</span>. What you see below
        reflects what your role can access — the backend enforces this independently of the UI.
      </p>

      <StaffDashboard />
    </div>
  );
}
