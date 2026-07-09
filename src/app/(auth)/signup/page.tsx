import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/register-form";
import { StepIndicator } from "@/features/auth/components/step-indicator";

export default function SignupPage() {
  return (
    <div>
      <StepIndicator current={1} />
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Create your merchant account</h1>
      <p className="mb-6 text-sm text-ink-500">It&apos;s free to join — activation is a one-time ₦5,000 fee.</p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-ink-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
