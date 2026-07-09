import { randomInt, randomUUID } from "crypto";

/** PRD 2.3 Sub-flow C: cases created through the self-serve portal get an `ONC-XXXXXX` id. */
export function generateOncCaseId(): string {
  const digits = String(randomInt(0, 1_000_000)).padStart(6, "0");
  return `ONC-${digits}`;
}

export function generateMerchantId(): string {
  return `PMER-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function generateLeadId(): string {
  return randomUUID();
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function generateJobId(): string {
  return `job_${randomUUID()}`;
}

export function generatePaymentReference(): string {
  return `ONC-PAY-${randomUUID().slice(0, 12)}`;
}
