"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/api/staff/auth";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { loginSchema, LoginFormValues } from "@/lib/validation/auth.schema";
import { ApiError } from "@/types/api";

/** Staff console login — real oncre-backend credentials, a separate identity system from the merchant portal. */
export function StaffLoginForm() {
  const router = useRouter();
  const setUser = useStaffSessionStore((s) => s.setUser);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    try {
      const { user } = await login(values.value, values.password);
      setUser(user);
      router.push("/staff");
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
