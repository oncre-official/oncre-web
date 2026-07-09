"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { register as registerAccount } from "@/lib/api/portal";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { toE164Nigerian } from "@/lib/utils/phone";
import { registerSchema, RegisterFormValues } from "@/lib/validation/auth.schema";
import { ApiError } from "@/types/api";
import { BusinessType } from "@/types/portal";

/** PRD 2.3 Sub-flow A, steps 13-16 — merchant registration form. */
export function RegisterForm() {
  const router = useRouter();
  const setRegistration = useOnboardingStore((s) => s.setRegistration);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema), mode: "onBlur" });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);
    try {
      const { merchant_id } = await registerAccount({
        ...values,
        phone: toE164Nigerian(values.phone),
      });
      setRegistration(merchant_id, values.email);
      router.push("/signup/verify");
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setSubmitError("An account with this email already exists. Log in instead.");
      } else {
        setSubmitError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="Full name" htmlFor="full_name" required error={errors.full_name?.message}>
        <Input id="full_name" invalid={!!errors.full_name} {...register("full_name")} />
      </Field>

      <Field label="Business name" htmlFor="business_name" required error={errors.business_name?.message}>
        <Input id="business_name" invalid={!!errors.business_name} {...register("business_name")} />
      </Field>

      <Field label="Business type" htmlFor="business_type" required error={errors.business_type?.message}>
        <Select id="business_type" defaultValue="" invalid={!!errors.business_type} {...register("business_type")}>
          <option value="" disabled>
            Select a type
          </option>
          {Object.values(BusinessType).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Business email" htmlFor="email" required error={errors.email?.message}>
        <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
      </Field>

      <Field label="Phone number" htmlFor="phone" required error={errors.phone?.message}>
        <Input id="phone" type="tel" placeholder="0801 234 5678" invalid={!!errors.phone} {...register("phone")} />
      </Field>

      <Field
        label="Password"
        htmlFor="password"
        required
        error={errors.password?.message}
        hint="At least 8 characters, 1 uppercase, 1 number, 1 special character."
      >
        <Input id="password" type="password" invalid={!!errors.password} {...register("password")} />
      </Field>

      <Field label="Confirm password" htmlFor="confirm_password" required error={errors.confirm_password?.message}>
        <Input id="confirm_password" type="password" invalid={!!errors.confirm_password} {...register("confirm_password")} />
      </Field>

      {submitError && (
        <p className="rounded-lg bg-status-critical-soft px-3 py-2 text-sm text-ink-800" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        Continue
      </Button>
    </form>
  );
}
