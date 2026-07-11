"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MerchantPaymentStatus } from "@/types/payment";

interface ActivationSubmissionsFilterProps {
  agentName: string;
  onAgentNameChange: (value: string) => void;
  zone: string;
  onZoneChange: (value: string) => void;
  status: MerchantPaymentStatus | "";
  onStatusChange: (value: MerchantPaymentStatus | "") => void;
}

export function ActivationSubmissionsFilter({
  agentName,
  onAgentNameChange,
  zone,
  onZoneChange,
  status,
  onStatusChange,
}: ActivationSubmissionsFilterProps) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Input
        placeholder="Filter by agent name…"
        value={agentName}
        onChange={(e) => onAgentNameChange(e.target.value)}
      />
      <Input placeholder="Filter by zone…" value={zone} onChange={(e) => onZoneChange(e.target.value)} />
      <Select value={status} onChange={(e) => onStatusChange(e.target.value as MerchantPaymentStatus | "")}>
        <option value="">All statuses</option>
        <option value={MerchantPaymentStatus.PENDING}>Pending verification</option>
        <option value={MerchantPaymentStatus.CONFIRMED}>Confirmed</option>
        <option value={MerchantPaymentStatus.FLAGGED}>Flagged</option>
        <option value={MerchantPaymentStatus.FOLLOW_UP}>Follow-up needed</option>
      </Select>
    </div>
  );
}
