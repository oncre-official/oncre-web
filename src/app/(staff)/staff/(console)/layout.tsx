"use client";

import { Suspense, useEffect } from "react";

import { NoticeToast } from "@/features/auth/components/notice-toast";
import { StaffSidenav } from "@/features/staff/components/staff-sidenav";
import { StaffTopbar } from "@/features/staff/components/staff-topbar";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";

/**
 * Shell for everything behind staff login. `src/proxy.ts` is the
 * authoritative guard (redirects unauthenticated visitors before this even
 * renders); this layout hydrates the client-side session store so the nav
 * and topbar can read the current user's role.
 */
export default function StaffConsoleLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useStaffSessionStore((s) => s.hydrate);
  const status = useStaffSessionStore((s) => s.status);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-ink-50">
      <Suspense>
        <NoticeToast />
      </Suspense>
      <StaffTopbar />
      <div className="flex flex-1">
        <StaffSidenav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
