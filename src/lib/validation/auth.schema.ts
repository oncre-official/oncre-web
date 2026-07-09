import { z } from "zod";

import { isValidNigerianPhone } from "@/lib/utils/phone";
import { BusinessType } from "@/types/portal";

const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "At least 1 uppercase letter")
  .regex(/[0-9]/, "At least 1 number")
  .regex(/[^A-Za-z0-9]/, "At least 1 special character");

/** PRD 2.3 Sub-flow A — merchant registration form. */
export const registerSchema = z
  .object({
    full_name: z.string().trim().min(2, "Enter your full name").max(100),
    business_name: z.string().trim().min(2, "Enter your business name").max(150),
    business_type: z.nativeEnum(BusinessType, { message: "Select a business type" }),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: z.string().trim().refine(isValidNigerianPhone, "Enter a valid Nigerian phone number"),
    password: passwordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const otpSchema = z.object({
  otp_code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const loginSchema = z.object({
  value: z.string().trim().min(1, "Enter your email or phone number"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
