import Link from "next/link";
import { Suspense } from "react";

import { NoticeToast } from "@/features/auth/components/notice-toast";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div>
      <Suspense>
        <NoticeToast />
      </Suspense>
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Log in to your portal</h1>
      <p className="mb-6 text-sm text-ink-500">Pick up your recovery cases where you left off.</p>
      <LoginForm />
      <p className="mt-6 text-center text-sm text-ink-500">
        New to Oncre?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
