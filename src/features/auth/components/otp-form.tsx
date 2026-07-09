"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resendOtp, verifyOtp } from "@/lib/api/portal";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { otpSchema, OtpFormValues } from "@/lib/validation/auth.schema";
import { ApiError } from "@/types/api";

const RESEND_COOLDOWN_SECONDS = 60;

/** PRD 2.3 Sub-flow A, steps 17-19 — 6-digit OTP verification. */
export function OtpForm() {
  const router = useRouter();
  const merchantId = useOnboardingStore((s) => s.merchantId);
  const email = useOnboardingStore((s) => s.email);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OtpFormValues>({ resolver: zodResolver(otpSchema) });

  useEffect(() => {
    if (cooldown === 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!merchantId) router.replace("/signup");
  }, [merchantId, router]);

  if (!merchantId) return null;

  const onSubmit = async (values: OtpFormValues) => {
    setSubmitError(null);
    try {
      await verifyOtp({ merchant_id: merchantId, otp_code: values.otp_code });
      router.push("/onboarding/activate");
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(
          error.message.includes("expired")
            ? "Your code has expired. Request a new one."
            : error.message,
        );
      } else {
        setSubmitError("Something went wrong. Please try again.");
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setSubmitError(null);
    try {
      const { dev_otp } = await resendOtp(merchantId);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      console.info(`[demo] verification code: ${dev_otp}`);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <p className="text-sm text-ink-500">
        We sent a 6-digit code to {email ?? "your email and phone"}. Check the server console for the demo
        code (no live SMS/email provider is configured for this frontend).
      </p>

      <Field label="Verification code" htmlFor="otp_code" required error={errors.otp_code?.message}>
        <Input
          id="otp_code"
          inputMode="numeric"
          maxLength={6}
          placeholder="123456"
          invalid={!!errors.otp_code}
          {...register("otp_code")}
        />
      </Field>

      {submitError && (
        <p className="rounded-lg bg-status-critical-soft px-3 py-2 text-sm text-ink-800" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Verify
      </Button>

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || resending}
        className="text-sm font-medium text-brand-700 hover:underline disabled:cursor-not-allowed disabled:text-ink-400 disabled:no-underline"
      >
        {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
      </button>
    </form>
  );
}
