"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addManualCase } from "@/lib/api/portal";
import { toast } from "@/lib/stores/toast-store";
import { toE164Nigerian } from "@/lib/utils/phone";
import { debtorRecordSchema, DebtorRecordFormValues } from "@/lib/validation/debtor-row.schema";
import { ApiError } from "@/types/api";
import type { DebtorRecordInput } from "@/types/portal";

/** PRD 2.3 Sub-flow C, Manual Entry Path — the same 8-field schema as the CSV template. */
export function ManualEntryForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtorRecordFormValues, unknown, DebtorRecordInput>({ resolver: zodResolver(debtorRecordSchema) });

  const onSubmit = async (values: DebtorRecordInput) => {
    try {
      await addManualCase({ ...values, debtor_phone: toE164Nigerian(values.debtor_phone) });
      toast.success("Case created successfully.");
      reset();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not create case. Please try again.");
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Debtor full name" htmlFor="debtor_full_name" required error={errors.debtor_full_name?.message}>
          <Input id="debtor_full_name" invalid={!!errors.debtor_full_name} {...register("debtor_full_name")} />
        </Field>

        <Field label="Debtor phone" htmlFor="debtor_phone" required error={errors.debtor_phone?.message}>
          <Input id="debtor_phone" placeholder="0801 234 5678" invalid={!!errors.debtor_phone} {...register("debtor_phone")} />
        </Field>

        <Field label="Debtor email" htmlFor="debtor_email" error={errors.debtor_email?.message}>
          <Input id="debtor_email" type="email" invalid={!!errors.debtor_email} {...register("debtor_email")} />
        </Field>

        <Field label="Business name" htmlFor="business_name" error={errors.business_name?.message}>
          <Input id="business_name" invalid={!!errors.business_name} {...register("business_name")} />
        </Field>

        <Field label="Amount owed (₦)" htmlFor="amount_owed_ngn" required error={errors.amount_owed_ngn?.message}>
          <Input
            id="amount_owed_ngn"
            type="number"
            min={1}
            invalid={!!errors.amount_owed_ngn}
            {...register("amount_owed_ngn")}
          />
        </Field>

        <Field label="Invoice reference" htmlFor="invoice_reference" error={errors.invoice_reference?.message}>
          <Input id="invoice_reference" invalid={!!errors.invoice_reference} {...register("invoice_reference")} />
        </Field>

        <Field label="Debt date" htmlFor="debt_date" required error={errors.debt_date?.message}>
          <Input id="debt_date" type="date" invalid={!!errors.debt_date} {...register("debt_date")} />
        </Field>

        <Field label="Notes" htmlFor="notes" error={errors.notes?.message} className="sm:col-span-2">
          <Textarea id="notes" rows={3} invalid={!!errors.notes} {...register("notes")} />
        </Field>

        <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row">
          <Button type="submit" loading={isSubmitting}>
            Add debtor
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.push("/dashboard")}>
            Go to Kanban Dashboard
          </Button>
        </div>
      </form>
    </Card>
  );
}
