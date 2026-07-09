"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createMerchant } from "@/lib/api/staff/merchants";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { createMerchantSchema, CreateMerchantFormValues } from "@/lib/validation/staff.schema";
import { toast } from "@/lib/stores/toast-store";
import type { Merchant } from "@/types/merchant";

interface CreateMerchantModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (merchant: Merchant) => void;
}

export function CreateMerchantModal({ open, onClose, onCreated }: CreateMerchantModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateMerchantFormValues>({ resolver: zodResolver(createMerchantSchema) });

  const onSubmit = async (values: CreateMerchantFormValues) => {
    try {
      const merchant = await createMerchant(values);
      toast.success("Merchant created successfully.");
      onCreated(merchant);
      reset();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create merchant">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Merchant name" htmlFor="merchant_name" required error={errors.merchant_name?.message}>
          <Input id="merchant_name" invalid={!!errors.merchant_name} {...register("merchant_name")} />
        </Field>
        <Field
          label="Store name"
          htmlFor="merchant_store_name"
          required
          error={errors.merchant_store_name?.message}
        >
          <Input id="merchant_store_name" invalid={!!errors.merchant_store_name} {...register("merchant_store_name")} />
        </Field>
        <Field label="Phone number" htmlFor="merchant_phone" required error={errors.merchant_phone?.message}>
          <Input id="merchant_phone" invalid={!!errors.merchant_phone} {...register("merchant_phone")} />
        </Field>
        <Field label="Location" htmlFor="location" required error={errors.location?.message}>
          <Input id="location" invalid={!!errors.location} {...register("location")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create merchant
        </Button>
      </form>
    </Modal>
  );
}
