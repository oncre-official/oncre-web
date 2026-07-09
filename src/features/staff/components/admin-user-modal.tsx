"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { createStaffUser } from "@/lib/api/staff/admin-users";
import { listRoles } from "@/lib/api/staff/roles";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { adminCreateUserSchema, AdminCreateUserFormValues } from "@/lib/validation/staff.schema";
import type { CreatedStaffUser } from "@/types/admin-user";
import type { RoleWithPermissions } from "@/types/role";

interface AdminUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: CreatedStaffUser) => void;
}

export function AdminUserModal({ open, onClose, onCreated }: AdminUserModalProps) {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);

  useEffect(() => {
    if (open) listRoles().then(setRoles).catch(handleStaffApiError);
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateUserFormValues>({ resolver: zodResolver(adminCreateUserSchema) });

  const onSubmit = async (values: AdminCreateUserFormValues) => {
    try {
      const user = await createStaffUser(values);
      onCreated(user);
      reset();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create staff user" description="A password is generated automatically and shown once.">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2" noValidate>
        <Field label="First name" htmlFor="first_name" error={errors.first_name?.message}>
          <Input id="first_name" invalid={!!errors.first_name} {...register("first_name")} />
        </Field>
        <Field label="Last name" htmlFor="last_name" error={errors.last_name?.message}>
          <Input id="last_name" invalid={!!errors.last_name} {...register("last_name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" invalid={!!errors.email} {...register("email")} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone?.message}>
          <Input id="phone" invalid={!!errors.phone} {...register("phone")} />
        </Field>
        <Field label="Zone" htmlFor="zone" error={errors.zone?.message}>
          <Input id="zone" invalid={!!errors.zone} {...register("zone")} />
        </Field>
        <Field label="Role" htmlFor="role_id" required error={errors.role_id?.message}>
          <Select id="role_id" defaultValue="" invalid={!!errors.role_id} {...register("role_id")}>
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.name}
              </option>
            ))}
          </Select>
        </Field>
        <Button type="submit" loading={isSubmitting} className="sm:col-span-2">
          Create staff user
        </Button>
      </form>
    </Modal>
  );
}
