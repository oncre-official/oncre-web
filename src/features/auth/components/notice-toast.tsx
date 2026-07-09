"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { toast } from "@/lib/stores/toast-store";

const NOTICE_MESSAGES: Record<string, string> = {
  "auth-required": "Please log in to access your dashboard.",
  "verify-required": "Please verify your account to continue.",
  "activate-required": "Activate your account to start recovering.",
  suspended: "Your account has been suspended. Contact support for help.",
  "staff-auth-required": "Please log in to access the staff console.",
  "session-expired": "Your session has expired. Please log in again.",
};

/** Surfaces the `?notice=` query param middleware.ts attaches on redirect (AC-KAN-002 / AC-KAN-003). */
export function NoticeToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const notice = searchParams.get("notice");
    if (notice && NOTICE_MESSAGES[notice]) toast.info(NOTICE_MESSAGES[notice]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
