import { z } from "zod";

import { isValidNigerianPhone } from "@/lib/utils/phone";
import { NplVolumeBracket } from "@/types/fi-lead";

const FREE_EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];

/** PRD 1.4.2 — the 5-field Enterprise (FI) lead-gen form. */
export const fiLeadSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(100),
  institution_name: z.string().trim().min(2, "Enter your institution's name").max(150),
  npl_volume_bracket: z.nativeEnum(NplVolumeBracket, { message: "Select your NPL volume" }),
  work_email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .refine((email) => !FREE_EMAIL_DOMAINS.includes(email.split("@")[1] ?? ""), {
      message: "Please use your institutional email address.",
    }),
  phone_number: z
    .string()
    .trim()
    .refine(isValidNigerianPhone, "Enter a valid Nigerian phone number (0XXXXXXXXXX or +234XXXXXXXXXX)"),
  /** Honeypot — real visitors never fill this in; simulates the reCAPTCHA v3 bot signal from PRD 1.4.4. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type FiLeadFormValues = z.infer<typeof fiLeadSchema>;
