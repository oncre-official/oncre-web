import { z } from "zod";

import { isValidNigerianPhone } from "@/lib/utils/phone";
import { TransitionOutcome } from "@/types/case";

/** Mirrors oncre-backend `CreateMerchantDto` (src/app/merchant/dto/merchant.dto.ts). */
export const createMerchantSchema = z.object({
  merchant_name: z.string().trim().min(1, "Enter the merchant's name"),
  merchant_store_name: z.string().trim().min(1, "Enter the store name"),
  merchant_phone: z.string().trim().min(1, "Enter a phone number"),
  location: z.string().trim().min(1, "Enter a location"),
});

export type CreateMerchantFormValues = z.infer<typeof createMerchantSchema>;

/** Mirrors oncre-backend `CreateCustomerDto` (src/app/customer/dto/customer.dto.ts). */
export const createCustomerSchema = z.object({
  customer_name: z.string().trim().min(1, "Enter the customer's name"),
  business_name: z.string().trim().optional(),
  customer_phone: z.string().trim().min(1, "Enter a phone number"),
});

export type CreateCustomerFormValues = z.infer<typeof createCustomerSchema>;

/** Mirrors oncre-backend `CreateCaseDto` (src/app/case/dto/case.dto.ts). */
export const createCaseSchema = z.object({
  merchant_name: z.string().trim().min(1, "Enter the merchant's name"),
  merchant_phone: z.string().trim().refine(isValidNigerianPhone, "Enter a valid Nigerian phone number"),
  debtor_name: z.string().trim().min(1, "Enter the debtor's name"),
  debtor_phone: z.string().trim().refine(isValidNigerianPhone, "Enter a valid Nigerian phone number"),
  debtor_address: z.string().trim().optional(),
  wholesaler_name: z.string().trim().optional(),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  description: z.string().trim().optional(),
  due_date: z.string().trim().min(1, "Select a due date"),
});

export type CreateCaseFormValues = z.input<typeof createCaseSchema>;
export type CreateCaseFormOutput = z.output<typeof createCaseSchema>;

/** Mirrors oncre-backend `TransitionCaseDto` (src/app/case/dto/transition.dto.ts). */
export const transitionCaseSchema = z.object({
  confirmationText: z.string().trim().min(1, "Type the confirmation text to proceed"),
  outcome: z.nativeEnum(TransitionOutcome, { message: "Select an outcome" }),
  note: z.string().trim().optional(),
});

export type TransitionCaseFormValues = z.infer<typeof transitionCaseSchema>;

/** Mirrors oncre-backend `LogCallDto` (src/app/call-log/dto/log.dto.ts). */
export const logCallOutcomeSchema = z.object({
  call_id: z.string().trim().min(1),
  outcome: z.string().trim().min(1, "Select an outcome"),
  note: z.string().trim().optional(),
});

export type LogCallOutcomeFormValues = z.infer<typeof logCallOutcomeSchema>;

/** Mirrors oncre-backend `CreatePlanDto` (src/app/payment/dto/plan.dto.ts). */
export const createPaymentPlanSchema = z.object({
  case_id: z.string().trim().min(1),
  type: z.enum(["week", "month"], { message: "Select a tranche type" }),
  value: z.coerce.number().positive("Value must be greater than 0"),
});

export type CreatePaymentPlanFormValues = z.input<typeof createPaymentPlanSchema>;
export type CreatePaymentPlanFormOutput = z.output<typeof createPaymentPlanSchema>;

/** Mirrors oncre-backend `AdminCreateUserDto` (src/app/admin/dto/create-user.dto.ts) — password is server-generated. */
export const adminCreateUserSchema = z.object({
  first_name: z.string().trim().optional(),
  last_name: z.string().trim().optional(),
  zone: z.string().trim().optional(),
  country_code: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  role_id: z.string().trim().min(1, "Select a role"),
});

export type AdminCreateUserFormValues = z.infer<typeof adminCreateUserSchema>;

/** Mirrors oncre-backend `ChangePinDto` (src/app/user/dto/pin.dto.ts). */
export const changePinSchema = z.object({
  oldPin: z.string().regex(/^\d{4}$/, "Enter your current 4-digit PIN"),
  newPin: z.string().regex(/^\d{4}$/, "Enter a new 4-digit PIN"),
});

export type ChangePinFormValues = z.infer<typeof changePinSchema>;
