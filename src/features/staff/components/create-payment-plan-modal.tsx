"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createPaymentPlan } from "@/lib/api/staff/payments";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import {
  createPaymentPlanSchema,
  CreatePaymentPlanFormValues,
  CreatePaymentPlanFormOutput,
} from "@/lib/validation/staff.schema";
import type { Payment } from "@/types/payment";

interface CreatePaymentPlanModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (payment: Payment) => void;
  /** Pre-fills the case ID field when opened in-context (e.g. from a case's detail drawer). */
  defaultCaseId?: string;
}

export function CreatePaymentPlanModal({ open, onClose, onCreated, defaultCaseId }: CreatePaymentPlanModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePaymentPlanFormValues, unknown, CreatePaymentPlanFormOutput>({
    resolver: zodResolver(createPaymentPlanSchema),
    defaultValues: { case_id: defaultCaseId, type: "week" },
  });

  const onSubmit = async (values: CreatePaymentPlanFormOutput) => {
    try {
      const payment = await createPaymentPlan(values);
      toast.success("Payment plan created successfully.");
      onCreated(payment);
      reset();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create payment plan">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Case ID" htmlFor="case_id" required error={errors.case_id?.message} hint="e.g. CA-00001">
          <Input id="case_id" invalid={!!errors.case_id} {...register("case_id")} />
        </Field>
        <Field label="Tranche type" htmlFor="type" required error={errors.type?.message}>
          <Select id="type" defaultValue="week" invalid={!!errors.type} {...register("type")}>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </Select>
        </Field>
        <Field label="Value per installment (₦)" htmlFor="value" required error={errors.value?.message}>
          <Input id="value" type="number" min={1} invalid={!!errors.value} {...register("value")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create plan
        </Button>
      </form>
    </Modal>
  );
}
