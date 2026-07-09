"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { createCustomer } from "@/lib/api/staff/customers";
import { toast } from "@/lib/stores/toast-store";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { createCustomerSchema, CreateCustomerFormValues } from "@/lib/validation/staff.schema";
import type { Customer } from "@/types/customer";

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

export function CreateCustomerModal({ open, onClose, onCreated }: CreateCustomerModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCustomerFormValues>({ resolver: zodResolver(createCustomerSchema) });

  const onSubmit = async (values: CreateCustomerFormValues) => {
    try {
      const customer = await createCustomer(values);
      toast.success("Customer created successfully.");
      onCreated(customer);
      reset();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create customer">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Customer name" htmlFor="customer_name" required error={errors.customer_name?.message}>
          <Input id="customer_name" invalid={!!errors.customer_name} {...register("customer_name")} />
        </Field>
        <Field label="Business name" htmlFor="business_name" error={errors.business_name?.message}>
          <Input id="business_name" invalid={!!errors.business_name} {...register("business_name")} />
        </Field>
        <Field label="Phone number" htmlFor="customer_phone" required error={errors.customer_phone?.message}>
          <Input id="customer_phone" invalid={!!errors.customer_phone} {...register("customer_phone")} />
        </Field>
        <Button type="submit" loading={isSubmitting} className="w-full">
          Create customer
        </Button>
      </form>
    </Modal>
  );
}
