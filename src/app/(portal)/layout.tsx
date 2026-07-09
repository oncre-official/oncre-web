"use client";

import { Suspense, useEffect } from "react";

import { NoticeToast } from "@/features/auth/components/notice-toast";
import { PortalTopbar } from "@/features/portal/components/portal-topbar";
import { useSessionStore } from "@/lib/stores/session-store";

/**
 * Shell for everything behind the paywall (`/onboarding/*`, `/dashboard`).
 * `middleware.ts` is the authoritative guard (redirects unauthenticated /
 * unactivated visitors before this even renders); this layout just hydrates
 * the client-side session store so components can read `account` locally.
 */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const hydrate = useSessionStore((s) => s.hydrate);
  const status = useSessionStore((s) => s.status);

  useEffect(() => {
    if (status === "idle") hydrate();
  }, [status, hydrate]);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-ink-50">
      <Suspense>
        <NoticeToast />
      </Suspense>
      <PortalTopbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
