"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/portal";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { useSessionStore } from "@/lib/stores/session-store";
import { loginSchema, LoginFormValues } from "@/lib/validation/auth.schema";
import { ApiError } from "@/types/api";
import { PortalAccountStatus } from "@/types/portal";

const STATUS_REDIRECT: Record<PortalAccountStatus, string> = {
  [PortalAccountStatus.PENDING_PAYMENT]: "/signup/verify",
  [PortalAccountStatus.VERIFIED_PENDING_PAYMENT]: "/onboarding/activate",
  [PortalAccountStatus.ACTIVE]: "/dashboard",
  [PortalAccountStatus.SUSPENDED]: "/login",
};

/** PRD 1.3 Flow A step: "Returning merchant clicks 'Log In' — routed to Merchant Portal login." */
export function LoginForm() {
  const router = useRouter();
  const setRegistration = useOnboardingStore((s) => s.setRegistration);
  const setAccount = useSessionStore((s) => s.setAccount);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      const { account } = await login(values.value, values.password);
      setAccount(account);
      setRegistration(account.merchant_id, account.email);
      router.push(STATUS_REDIRECT[account.status]);
    } catch (error) {
      setSubmitError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="Email or phone number" htmlFor="value" required error={errors.value?.message}>
        <Input id="value" invalid={!!errors.value} {...register("value")} />
      </Field>

      <Field label="Password" htmlFor="password" required error={errors.password?.message}>
        <Input id="password" type="password" invalid={!!errors.password} {...register("password")} />
      </Field>

      {submitError && (
        <p className="rounded-lg bg-status-critical-soft px-3 py-2 text-sm text-ink-800" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Log In
      </Button>
    </form>
  );
}
