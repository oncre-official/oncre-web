export enum MessageType {
  FREE_REGULAR = "free_regular",
  FREE_REENGAGEMENT = "free_reengagement",
  OLD_DEBT = "old_debt",
  PAID_PART_REENGAGEMENT = "paid_part_reengagement",
  ESCALATION = "escalation",
  CASE_ESCALATION = "case_escalation",
  CASE_ACTIVATION = "case_activation",
  MISSED_CALL = "missed_call",
  PAYMENT_CONFIRMATION = "payment_confirmation",
  PAYMENT_PLAN = "payment_plan",
  PASSIVE_RECOVERY = "passive_recovery",
}

export enum MessageDeliveryStatus {
  SCHEDULED = "scheduled",
  PENDING = "pending",
  SENT = "sent",
  DELIVERED = "delivered",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum ActionType {
  SMS = "sms",
  CALL = "call",
}

/** Mirrors oncre-backend `Message` model (src/app/message/model/message.model.ts). */
export interface Message {
  _id: string;
  case_id?: string;
  credit_id?: string;
  merchant_id: string;
  customer_phone?: string;
  debtor_phone?: string;
  day?: number;
  message_type: MessageType;
  action_type: ActionType;
  message_body: string;
  scheduled_for?: string;
  sent_at?: string;
  delivery_status: MessageDeliveryStatus;
  created_at?: string;
}
