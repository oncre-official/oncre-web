import type { BadgeProps } from "@/components/ui/badge";
import { MerchantPaymentStatus } from "@/types/payment";

const STATUS_TONE: Record<MerchantPaymentStatus, NonNullable<BadgeProps["tone"]>> = {
  [MerchantPaymentStatus.PENDING]: "warning",
  [MerchantPaymentStatus.CONFIRMED]: "good",
  [MerchantPaymentStatus.FLAGGED]: "critical",
  [MerchantPaymentStatus.FOLLOW_UP]: "warning",
};

const STATUS_LABEL: Record<MerchantPaymentStatus, string> = {
  [MerchantPaymentStatus.PENDING]: "Pending verification",
  [MerchantPaymentStatus.CONFIRMED]: "Confirmed",
  [MerchantPaymentStatus.FLAGGED]: "Flagged",
  [MerchantPaymentStatus.FOLLOW_UP]: "Follow-up needed",
};

export function getActivationFeeStatusTone(status: MerchantPaymentStatus): NonNullable<BadgeProps["tone"]> {
  return STATUS_TONE[status] ?? "neutral";
}

export function getActivationFeeStatusLabel(status: MerchantPaymentStatus): string {
  return STATUS_LABEL[status] ?? status;
}
