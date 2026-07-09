"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { createCase } from "@/lib/api/staff/cases";
import { toast } from "@/lib/stores/toast-store";
import { toE164Nigerian } from "@/lib/utils/phone";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { createCaseSchema, CreateCaseFormValues, CreateCaseFormOutput } from "@/lib/validation/staff.schema";
import type { Case } from "@/types/case";

interface CreateCaseModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (caze: Case) => void;
}

export function CreateCaseModal({ open, onClose, onCreated }: CreateCaseModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCaseFormValues, unknown, CreateCaseFormOutput>({ resolver: zodResolver(createCaseSchema) });

  const onSubmit = async (values: CreateCaseFormOutput) => {
    try {
      const caze = await createCase({
        ...values,
        merchant_phone: toE164Nigerian(values.merchant_phone),
        debtor_phone: toE164Nigerian(values.debtor_phone),
      });
      toast.success("Case created successfully.");
      onCreated(caze);
      reset();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create case">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="Merchant name" htmlFor="merchant_name" required error={errors.merchant_name?.message}>
          <Input id="merchant_name" invalid={!!errors.merchant_name} {...register("merchant_name")} />
        </Field>
        <Field label="Merchant phone" htmlFor="merchant_phone" required error={errors.merchant_phone?.message}>
          <Input id="merchant_phone" invalid={!!errors.merchant_phone} {...register("merchant_phone")} />
        </Field>
        <Field label="Debtor name" htmlFor="debtor_name" required error={errors.debtor_name?.message}>
          <Input id="debtor_name" invalid={!!errors.debtor_name} {...register("debtor_name")} />
        </Field>
        <Field label="Debtor phone" htmlFor="debtor_phone" required error={errors.debtor_phone?.message}>
          <Input id="debtor_phone" invalid={!!errors.debtor_phone} {...register("debtor_phone")} />
        </Field>
        <Field label="Debtor address" htmlFor="debtor_address" error={errors.debtor_address?.message}>
          <Input id="debtor_address" invalid={!!errors.debtor_address} {...register("debtor_address")} />
        </Field>
        <Field label="Wholesaler name" htmlFor="wholesaler_name" error={errors.wholesaler_name?.message}>
          <Input id="wholesaler_name" invalid={!!errors.wholesaler_name} {...register("wholesaler_name")} />
        </Field>
        <Field label="Amount owed (₦)" htmlFor="amount" required error={errors.amount?.message}>
          <Input id="amount" type="number" min={1} invalid={!!errors.amount} {...register("amount")} />
        </Field>
        <Field label="Due date" htmlFor="due_date" required error={errors.due_date?.message}>
          <Input id="due_date" type="date" invalid={!!errors.due_date} {...register("due_date")} />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description?.message} className="sm:col-span-2">
          <Textarea id="description" rows={3} invalid={!!errors.description} {...register("description")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
          Create case
        </Button>
      </form>
    </Modal>
  );
}
