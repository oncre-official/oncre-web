export enum CallType {
  DEBT = "debt",
  CASE = "case",
  CREDIT_REENGAGEMENT = "credit_reengagement",
  CASE_ESCALATION = "case_escalation",
}

export enum CallStatus {
  SCHEDULED = "scheduled",
  PENDING = "pending",
  COMPLETED = "completed",
  CLOSED = "closed",
  CANCELLED = "cancelled",
}

/** Mirrors oncre-backend `Call` model (src/app/call/model/call.model.ts). */
export interface Call {
  _id: string;
  call_id: string;
  credit_id?: string;
  case_id: string;
  merchant_id: string;
  debtor_phone: string;
  day?: number;
  call_type: CallType;
  status: CallStatus;
  scheduled_for?: string;
  created_at?: string;
}

/** Mirrors oncre-backend `CALL_OUTCOMES` (src/app/call-log/helpers/enum.ts). */
export enum CallLogOutcome {
  PROMISED_TO_PAY = "PROMISED_TO_PAY",
  PAYMENT_PLAN = "PAYMENT_PLAN",
  PARTIAL_PAYMENT = "PARTIAL_PAYMENT",
  FULL_PAYMENT = "FULL_PAYMENT",
  NO_ANSWER = "NO_ANSWER",
  CALL_BACK_LATER = "CALL_BACK_LATER",
  REFUSED = "REFUSED",
  DISPUTED = "DISPUTED",
  UNREACHABLE = "UNREACHABLE",
  NUMBER_INVALID = "NUMBER_INVALID",
}

export interface CallLog {
  _id: string;
  call_id: string;
  case_id: string;
  outcome: CallLogOutcome;
  note?: string;
  called_at: string;
}

export interface LogCallInput {
  call_id: string;
  outcome: CallLogOutcome;
  note?: string;
}
