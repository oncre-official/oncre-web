"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { DeactivateConfirmModal } from "@/features/staff/components/deactivate-confirm-modal";
import { listCases } from "@/lib/api/staff/cases";
import { clearCashOnly, deactivateCustomer, getCustomer, getRestrictions, setCashOnly } from "@/lib/api/staff/customers";
import { approveMerchant, deactivateMerchant, getMerchant, rejectMerchant } from "@/lib/api/staff/merchants";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { toast } from "@/lib/stores/toast-store";
import { formatNaira } from "@/lib/utils/currency";
import { getCaseStatusLabel, getCaseStatusTone } from "@/lib/utils/case-status-tone";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import {
  hasRole,
  MERCHANT_APPROVAL_ROLES,
  MERCHANT_CUSTOMER_DEACTIVATE_ROLES,
} from "@/lib/utils/staff-permissions";
import type { Case } from "@/types/case";
import { CustomerStatus, type Customer, type DebtorRestriction } from "@/types/customer";
import { MerchantApprovalStatus, type Merchant } from "@/types/merchant";

export type ProfileTarget = { kind: "merchant"; record: Merchant } | { kind: "customer"; record: Customer };

interface StaffDirectoryProfileDrawerProps {
  target: ProfileTarget | null;
  onClose: () => void;
  onChanged: () => void;
}

const approvalStatusTone: Record<MerchantApprovalStatus, BadgeProps["tone"]> = {
  [MerchantApprovalStatus.PENDING]: "warning",
  [MerchantApprovalStatus.APPROVED]: "good",
  [MerchantApprovalStatus.REJECTED]: "critical",
};

const approvalStatusLabel: Record<MerchantApprovalStatus, string> = {
  [MerchantApprovalStatus.PENDING]: "Pending approval",
  [MerchantApprovalStatus.APPROVED]: "Approved",
  [MerchantApprovalStatus.REJECTED]: "Rejected",
};

const customerStatusTone: Record<CustomerStatus, BadgeProps["tone"]> = {
  [CustomerStatus.ACTIVE]: "good",
  [CustomerStatus.CASH_ONLY]: "warning",
  [CustomerStatus.INACTIVE]: "neutral",
};

const customerStatusLabel: Record<CustomerStatus, string> = {
  [CustomerStatus.ACTIVE]: "Active",
  [CustomerStatus.CASH_ONLY]: "Cash only",
  [CustomerStatus.INACTIVE]: "Deactivated",
};

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return format(new Date(value), "d MMM yyyy");
  } catch {
    return "—";
  }
}

function creatorLabel(creator?: { email?: string; phone?: string }) {
  if (!creator) return "—";
  return creator.email ?? creator.phone ?? "—";
}

export function StaffDirectoryProfileDrawer({ target, onClose, onChanged }: StaffDirectoryProfileDrawerProps) {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canDeactivate = hasRole(roleName, MERCHANT_CUSTOMER_DEACTIVATE_ROLES);
  const canApprove = hasRole(roleName, MERCHANT_APPROVAL_ROLES);

  const [data, setData] = useState<{
    targetId: string;
    profile: Merchant | Customer;
    cases: Case[];
    restrictions: DebtorRestriction[];
  } | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cashOnlyBusy, setCashOnlyBusy] = useState(false);

  useEffect(() => {
    if (!target) return;

    let cancelled = false;

    const profileRequest =
      target.kind === "merchant" ? getMerchant(target.record._id) : getCustomer(target.record._id);
    const casesRequest =
      target.kind === "merchant"
        ? listCases({ merchant_id: target.record.merchant_id, limit: 50 })
        : listCases({ customer_id: target.record.customer_id, limit: 50 });
    const restrictionsRequest = target.kind === "customer" ? getRestrictions(target.record._id) : Promise.resolve([]);

    Promise.all([profileRequest, casesRequest, restrictionsRequest])
      .then(([fetchedProfile, caseResult, restrictions]) => {
        if (cancelled) return;
        setData({ targetId: target.record._id, profile: fetchedProfile, cases: caseResult.row, restrictions });
      })
      .catch((error) => {
        if (!cancelled) handleStaffApiError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [target]);

  if (!target) return null;

  const isMerchant = target.kind === "merchant";
  const profileMatchesTarget = data?.targetId === target.record._id;
  const merchant = isMerchant && profileMatchesTarget ? (data.profile as Merchant) : null;
  const customer = !isMerchant && profileMatchesTarget ? (data.profile as Customer) : null;
  const cases = profileMatchesTarget ? data.cases : [];
  const alreadyDeactivated = isMerchant ? merchant?.is_active === false : customer?.status === CustomerStatus.INACTIVE;

  const title = isMerchant ? target.record.merchant_name : target.record.customer_name;

  const handleConfirmDeactivate = async () => {
    if (!data) return;
    const updatedProfile = isMerchant ? await deactivateMerchant(target.record._id) : await deactivateCustomer(target.record._id);
    setData({ ...data, profile: updatedProfile });
    toast.success(`${title} deactivated.`);
    onChanged();
  };

  const handleApprove = async () => {
    if (!data || !merchant) return;
    try {
      const updated = await approveMerchant(merchant._id);
      setData({ ...data, profile: updated });
      toast.success(`${title} approved.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  const handleReject = async () => {
    if (!data || !merchant) return;
    try {
      const updated = await rejectMerchant(merchant._id);
      setData({ ...data, profile: updated });
      toast.success(`${title} rejected.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    }
  };

  const handleSetCashOnly = async () => {
    if (!data || !customer) return;
    setCashOnlyBusy(true);
    try {
      const updated = await setCashOnly(customer._id);
      const restrictions = await getRestrictions(customer._id);
      setData({ ...data, profile: updated, restrictions });
      toast.success(`${title} restricted to cash-only.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    } finally {
      setCashOnlyBusy(false);
    }
  };

  const handleClearCashOnly = async () => {
    if (!data || !customer) return;
    setCashOnlyBusy(true);
    try {
      const updated = await clearCashOnly(customer._id);
      const restrictions = await getRestrictions(customer._id);
      setData({ ...data, profile: updated, restrictions });
      toast.success(`Cash-only restriction cleared for ${title}.`);
      onChanged();
    } catch (error) {
      handleStaffApiError(error);
    } finally {
      setCashOnlyBusy(false);
    }
  };

  return (
    <Drawer open={!!target} onClose={onClose} title={title}>
      {!profileMatchesTarget ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-start justify-between gap-4 rounded-xl bg-ink-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                {isMerchant ? "Merchant ID" : "Customer ID"}
              </p>
              <p className="font-mono text-sm text-ink-900">{isMerchant ? merchant?.merchant_id : customer?.customer_id}</p>
            </div>
            {isMerchant ? (
              <div className="flex flex-col items-end gap-1.5">
                <Badge tone={merchant?.activated ? "good" : "neutral"}>
                  {merchant?.activated ? "Activated" : "Pending activation"}
                </Badge>
                <Badge tone={merchant?.is_active === false ? "critical" : "good"}>
                  {merchant?.is_active === false ? "Deactivated" : "Active"}
                </Badge>
                {merchant && merchant.approval_status !== MerchantApprovalStatus.APPROVED && (
                  <Badge tone={approvalStatusTone[merchant.approval_status]}>
                    {approvalStatusLabel[merchant.approval_status]}
                  </Badge>
                )}
              </div>
            ) : (
              customer && <Badge tone={customerStatusTone[customer.status]}>{customerStatusLabel[customer.status]}</Badge>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            {isMerchant && merchant ? (
              <>
                <Field label="Name" value={merchant.merchant_name} />
                <Field label="Store name" value={merchant.merchant_store_name} />
                <Field label="Phone" value={merchant.merchant_phone} />
                <Field label="Business type" value={merchant.business_type} />
                <Field label="Location" value={merchant.location} />
                <Field label="Channel" value={merchant.channel} />
                <Field label="Bank name" value={merchant.bank_name} />
                <Field label="Bank account number" value={merchant.bank_account_number} />
                <Field label="Bank account name" value={merchant.bank_account_name} />
                <Field label="Created" value={formatDate(merchant.created_at)} />
                <Field label="Created by" value={creatorLabel(merchant.creator)} />
              </>
            ) : (
              customer && (
                <>
                  <Field label="Name" value={customer.customer_name} />
                  <Field label="Business name" value={customer.business_name} />
                  <Field label="Phone" value={customer.customer_phone} />
                  <Field label="Address" value={customer.customer_address} />
                  <Field label="Created" value={formatDate(customer.created_at)} />
                  <Field label="Created by" value={creatorLabel(customer.creator)} />
                </>
              )
            )}
          </dl>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Linked cases</p>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Case ID</TableHeaderCell>
                  <TableHeaderCell>{isMerchant ? "Debtor" : "Merchant"}</TableHeaderCell>
                  <TableHeaderCell>Amount</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cases.length === 0 ? (
                  <TableEmptyState colSpan={4} message="No linked cases." />
                ) : (
                  cases.map((caze) => (
                    <TableRow key={caze._id}>
                      <TableCell className="font-mono text-xs">{caze.case_id}</TableCell>
                      <TableCell>{isMerchant ? caze.debtor_name : (caze.merchant?.merchant_name ?? caze.merchant_id)}</TableCell>
                      <TableCell className="tabular-nums">{formatNaira(caze.amount)}</TableCell>
                      <TableCell>
                        <Badge tone={getCaseStatusTone(caze.status)}>{getCaseStatusLabel(caze.status)}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {!isMerchant && customer && (
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">Cash-only restriction history</p>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Reason</TableHeaderCell>
                    <TableHeaderCell>By</TableHeaderCell>
                    <TableHeaderCell>Date</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.restrictions.length === 0 ? (
                    <TableEmptyState colSpan={4} message="No restriction history." />
                  ) : (
                    data.restrictions.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell>
                          <Badge tone={entry.status === "cash_only" ? "warning" : "good"}>
                            {entry.status === "cash_only" ? "Cash only" : "Cleared"}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.reason || "—"}</TableCell>
                        <TableCell>{creatorLabel(entry.actioned_by)}</TableCell>
                        <TableCell>{formatDate(entry.actioned_at)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {!isMerchant && canDeactivate && customer && customer.status !== CustomerStatus.INACTIVE && (
            <div className="flex gap-2">
              {customer.status === CustomerStatus.CASH_ONLY ? (
                <Button variant="secondary" loading={cashOnlyBusy} onClick={handleClearCashOnly}>
                  Clear cash-only restriction
                </Button>
              ) : (
                <Button variant="secondary" loading={cashOnlyBusy} onClick={handleSetCashOnly}>
                  Restrict to cash-only
                </Button>
              )}
            </div>
          )}

          {isMerchant && canApprove && merchant?.approval_status === MerchantApprovalStatus.PENDING && (
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleApprove}>
                Approve merchant
              </Button>
              <Button variant="secondary" onClick={handleReject}>
                Reject merchant
              </Button>
            </div>
          )}

          {canDeactivate && !alreadyDeactivated && (
            <div>
              <Button variant="danger" onClick={() => setConfirmOpen(true)}>
                Deactivate {isMerchant ? "merchant" : "customer"}
              </Button>
            </div>
          )}

          {!canDeactivate && (
            <p className="text-xs text-ink-400">Your role can view this profile but not deactivate it.</p>
          )}
        </div>
      )}

      <DeactivateConfirmModal
        open={confirmOpen}
        entityLabel={title}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDeactivate}
      />
    </Drawer>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="text-ink-800">{value || "—"}</dd>
    </div>
  );
}
