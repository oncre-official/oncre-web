"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { changePin } from "@/lib/api/staff/auth";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { changePinSchema, ChangePinFormValues } from "@/lib/validation/staff.schema";

export function ChangePinForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePinFormValues>({ resolver: zodResolver(changePinSchema) });

  const onSubmit = async (values: ChangePinFormValues) => {
    try {
      await changePin(values);
      toast.success("PIN changed successfully.");
      reset();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4" noValidate>
      <Field label="Current PIN" htmlFor="oldPin" required error={errors.oldPin?.message}>
        <Input id="oldPin" inputMode="numeric" maxLength={4} invalid={!!errors.oldPin} {...register("oldPin")} />
      </Field>
      <Field label="New PIN" htmlFor="newPin" required error={errors.newPin?.message}>
        <Input id="newPin" inputMode="numeric" maxLength={4} invalid={!!errors.newPin} {...register("newPin")} />
      </Field>
      <Button type="submit" loading={isSubmitting}>
        Change PIN
      </Button>
    </form>
  );
}
