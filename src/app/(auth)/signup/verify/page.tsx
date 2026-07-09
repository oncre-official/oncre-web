import { OtpForm } from "@/features/auth/components/otp-form";
import { StepIndicator } from "@/features/auth/components/step-indicator";

export default function VerifyOtpPage() {
  return (
    <div>
      <StepIndicator current={1} />
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Verify your account</h1>
      <p className="mb-6 text-sm text-ink-500">Enter the code we sent to confirm it&apos;s you.</p>
      <OtpForm />
    </div>
  );
}
