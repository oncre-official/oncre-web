import { Suspense } from "react";

import { NoticeToast } from "@/features/auth/components/notice-toast";
import { StaffLoginForm } from "@/features/staff/components/staff-login-form";

export default function StaffLoginPage() {
  return (
    <div>
      <Suspense>
        <NoticeToast />
      </Suspense>
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Staff sign in</h1>
      <p className="mb-6 text-sm text-ink-500">Sign in with your recovery-engine credentials.</p>
      <StaffLoginForm />
    </div>
  );
}
