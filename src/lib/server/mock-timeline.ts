import "server-only";

import { CallStatus, CallType, Call } from "@/types/call";
import { Case } from "@/types/case";
import { ActionType, Message, MessageDeliveryStatus, MessageType } from "@/types/message";

import { isCaseResolved } from "@/lib/utils/case-phase";

/**
 * For cases that fell back to the local mock store (no real backend
 * reachable), synthesizes a small, deterministic activity timeline so the
 * case-detail slide-over isn't empty. Shape matches the real backend's
 * `Message`/`Call` models exactly, so the UI never needs a mock-only branch.
 */
export function synthesizeMockTimeline(caze: Case): { messages: Message[]; calls: Call[] } {
  const messages: Message[] = [
    {
      _id: `${caze._id}-activation`,
      case_id: caze.case_id,
      merchant_id: caze.merchant_id,
      debtor_phone: caze.debtor_phone,
      day: 0,
      message_type: MessageType.CASE_ACTIVATION,
      action_type: ActionType.SMS,
      message_body: `Hi ${caze.debtor_name}, this is a reminder that an outstanding balance is due. Please make payment at your earliest convenience.`,
      sent_at: caze.activated_at,
      delivery_status: MessageDeliveryStatus.SENT,
      created_at: caze.activated_at,
    },
  ];

  const calls: Call[] = [];

  if (caze.current_day >= 8) {
    calls.push({
      _id: `${caze._id}-call-1`,
      call_id: `${caze.case_id}-CL-01`,
      case_id: caze.case_id,
      merchant_id: caze.merchant_id,
      debtor_phone: caze.debtor_phone,
      day: 8,
      call_type: CallType.CASE,
      status: CallStatus.SCHEDULED,
      scheduled_for: caze.due_date,
      created_at: caze.activated_at,
    });
  }

  if (isCaseResolved(caze)) {
    messages.push({
      _id: `${caze._id}-confirmation`,
      case_id: caze.case_id,
      merchant_id: caze.merchant_id,
      debtor_phone: caze.debtor_phone,
      day: caze.current_day,
      message_type: MessageType.PAYMENT_CONFIRMATION,
      action_type: ActionType.SMS,
      message_body: `Thank you ${caze.debtor_name}, your payment has been received and this case is now resolved.`,
      sent_at: caze.due_date,
      delivery_status: MessageDeliveryStatus.DELIVERED,
      created_at: caze.due_date,
    });
  }

  return { messages, calls };
}
