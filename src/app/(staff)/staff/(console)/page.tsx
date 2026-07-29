"use client";

import { StaffDashboard } from "@/features/staff/components/staff-dashboard";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";

export default function StaffHomePage() {
  const user = useStaffSessionStore((s) => s.user);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-ink-900">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>


      <StaffDashboard />
    </div>
  );
}
