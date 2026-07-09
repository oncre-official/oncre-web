import { z } from "zod";

import { isValidNigerianPhone } from "@/lib/utils/phone";

/** PRD 2.4.4 — shared by the CSV bulk-upload validator and the manual-entry form. */
export const debtorRecordSchema = z.object({
  debtor_full_name: z.string().trim().min(1, "Debtor name is required").max(150),
  debtor_phone: z
    .string()
    .trim()
    .refine(isValidNigerianPhone, "Enter a valid Nigerian phone number (0XXXXXXXXXX or +234XXXXXXXXXX)"),
  debtor_email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, "Enter a valid email address"),
  business_name: z.string().trim().max(150).optional(),
  amount_owed_ngn: z.coerce.number().int("Amount must be a whole number").positive("Amount must be greater than 0"),
  invoice_reference: z.string().trim().max(100).optional(),
  debt_date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use ISO date format YYYY-MM-DD"),
  notes: z.string().trim().max(500).optional(),
});

export type DebtorRecordFormValues = z.input<typeof debtorRecordSchema>;

export const CSV_REQUIRED_COLUMNS = [
  "debtor_full_name",
  "debtor_phone",
  "amount_owed_ngn",
  "debt_date",
] as const;

export const CSV_ALL_COLUMNS = [
  "debtor_full_name",
  "debtor_phone",
  "debtor_email",
  "business_name",
  "amount_owed_ngn",
  "invoice_reference",
  "debt_date",
  "notes",
] as const;
