"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useShallow } from "zustand/shallow";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { submitFiLead } from "@/lib/api/leads";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { toE164Nigerian } from "@/lib/utils/phone";
import { fiLeadSchema, FiLeadFormValues } from "@/lib/validation/fi-lead.schema";
import { ApiError } from "@/types/api";
import { NplVolumeBracket } from "@/types/fi-lead";

const NPL_LABELS: Record<NplVolumeBracket, string> = {
  [NplVolumeBracket.UNDER_50M]: "Under ₦50M",
  [NplVolumeBracket.BETWEEN_50M_500M]: "₦50M – ₦500M",
  [NplVolumeBracket.ABOVE_500M]: "₦500M+",
  [NplVolumeBracket.UNDISCLOSED]: "Prefer not to say",
};

interface FiLeadFormProps {
  onSuccess: () => void;
}

/** PRD 1.4.2 — the 5-field Enterprise lead-gen form (AC-LND-002 through AC-LND-006). */
export function FiLeadForm({ onSuccess }: FiLeadFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const utm = useOnboardingStore(
    useShallow((s) => ({
      utm_source: s.utm_source,
      utm_medium: s.utm_medium,
      utm_campaign: s.utm_campaign,
    })),
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FiLeadFormValues>({ resolver: zodResolver(fiLeadSchema), mode: "onBlur" });

  const onSubmit = async (values: FiLeadFormValues) => {
    setSubmitError(null);
    try {
      await submitFiLead({
        ...values,
        phone_number: toE164Nigerian(values.phone_number),
        ...utm,
      });
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError && error.status === 429) {
        setSubmitError("Too many submissions. Please try again later.");
      } else {
        setSubmitError("Something went wrong. Please try again or email us at enterprise@oncre.co.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register("website")} />

      <Field label="Full name" htmlFor="full_name" required error={errors.full_name?.message}>
        <Input id="full_name" invalid={!!errors.full_name} {...register("full_name")} />
      </Field>

      <Field label="Institution name" htmlFor="institution_name" required error={errors.institution_name?.message}>
        <Input id="institution_name" invalid={!!errors.institution_name} {...register("institution_name")} />
      </Field>

      <Field label="NPL volume (₦)" htmlFor="npl_volume_bracket" required error={errors.npl_volume_bracket?.message}>
        <Select id="npl_volume_bracket" invalid={!!errors.npl_volume_bracket} defaultValue="" {...register("npl_volume_bracket")}>
          <option value="" disabled>
            Select a range
          </option>
          {Object.values(NplVolumeBracket).map((value) => (
            <option key={value} value={value}>
              {NPL_LABELS[value]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Work email" htmlFor="work_email" required error={errors.work_email?.message}>
        <Input id="work_email" type="email" invalid={!!errors.work_email} {...register("work_email")} />
      </Field>

      <Field label="Phone number" htmlFor="phone_number" required error={errors.phone_number?.message}>
        <Input
          id="phone_number"
          type="tel"
          placeholder="0801 234 5678"
          invalid={!!errors.phone_number}
          {...register("phone_number")}
        />
      </Field>

      {submitError && (
        <p className="rounded-lg bg-status-critical-soft px-3 py-2 text-sm text-ink-800" role="alert">
          {submitError}
        </p>
      )}

      <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
        Submit
      </Button>
    </form>
  );
}
