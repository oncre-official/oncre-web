"use client";

import { format } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableEmptyState,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/ui/table";
import { ActivationSubmissionsFilter } from "@/features/staff/components/activation-submissions-filter";
import { NoAccess } from "@/features/staff/components/no-access";
import { ReceiptViewerModal } from "@/features/staff/components/receipt-viewer-modal";
import { listActivationFeeSubmissions } from "@/lib/api/staff/activation-submissions";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import {
  getActivationFeeStatusLabel,
  getActivationFeeStatusTone,
} from "@/lib/utils/activation-fee-status-tone";
import { formatNaira } from "@/lib/utils/currency";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { AOP_SUBMISSIONS_ROLES, hasRole } from "@/lib/utils/staff-permissions";
import { ActivationFeeSortField, type ActivationFeeSubmission, type SortDirection } from "@/types/activation-submission";
import { MerchantPaymentStatus } from "@/types/payment";

const PAGE_SIZE = 20;

interface SortableHeaderProps {
  label: string;
  field: ActivationFeeSortField;
  sortBy: ActivationFeeSortField;
  sortDir: SortDirection;
  onSort: (field: ActivationFeeSortField) => void;
}

function SortableHeader({ label, field, sortBy, sortDir, onSort }: SortableHeaderProps) {
  const active = sortBy === field;
  return (
    <TableHeaderCell>
      <button onClick={() => onSort(field)} className="flex items-center gap-1 hover:text-ink-800">
        {label}
        {active ? (
          sortDir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </button>
    </TableHeaderCell>
  );
}

export default function ActivationSubmissionsPage() {
  const sessionStatus = useStaffSessionStore((s) => s.status);
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canAccess = hasRole(roleName, AOP_SUBMISSIONS_ROLES);

  const [results, setResults] = useState<{ key: string; submissions: ActivationFeeSubmission[] } | null>(null);

  const [agentName, setAgentName] = useState("");
  const [zone, setZone] = useState("");
  const [status, setStatus] = useState<MerchantPaymentStatus | "">("");
  const debouncedAgentName = useDebouncedValue(agentName, 300);
  const debouncedZone = useDebouncedValue(zone, 300);

  const [sortBy, setSortBy] = useState<ActivationFeeSortField>(ActivationFeeSortField.DATE);
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const [selectedReceipt, setSelectedReceipt] = useState<ActivationFeeSubmission | null>(null);

  const handleSort = (field: ActivationFeeSortField) => {
    if (field === sortBy) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("desc");
    }
  };

  const queryKey = JSON.stringify({ debouncedAgentName, debouncedZone, status, sortBy, sortDir });

  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;

    listActivationFeeSubmissions({
      limit: PAGE_SIZE,
      agent_name: debouncedAgentName || undefined,
      zone: debouncedZone || undefined,
      merchant_status: status || undefined,
      sort_by: sortBy,
      sort_dir: sortDir,
    })
      .then((result) => {
        if (!cancelled) setResults({ key: queryKey, submissions: result.row });
      })
      .catch((error) => {
        if (!cancelled) handleStaffApiError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [canAccess, queryKey, debouncedAgentName, debouncedZone, status, sortBy, sortDir]);

  const loading = results?.key !== queryKey;
  const submissions = results?.key === queryKey ? results.submissions : [];

  if (sessionStatus !== "ready") {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-6 w-6 text-brand-600" />
      </div>
    );
  }

  if (!canAccess) return <NoAccess />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Field Agent Payments</h1>
        <p className="text-sm text-ink-500">
          Every merchant activation payment submitted by a field agent with a receipt, for verification.
        </p>
      </div>

      <ActivationSubmissionsFilter
        agentName={agentName}
        onAgentNameChange={setAgentName}
        zone={zone}
        onZoneChange={setZone}
        status={status}
        onStatusChange={setStatus}
      />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <SortableHeader label="Agent" field={ActivationFeeSortField.AGENT} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Zone" field={ActivationFeeSortField.ZONE} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <SortableHeader
                label="Merchant"
                field={ActivationFeeSortField.MERCHANT_NAME}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              />
              <SortableHeader label="Amount" field={ActivationFeeSortField.AMOUNT} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <TableHeaderCell>Status</TableHeaderCell>
              <SortableHeader label="Date" field={ActivationFeeSortField.DATE} sortBy={sortBy} sortDir={sortDir} onSort={handleSort} />
              <TableHeaderCell>Receipt</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length === 0 ? (
              <TableEmptyState colSpan={7} message="No field agent submissions yet." />
            ) : (
              submissions.map((submission) => (
                <TableRow key={submission._id}>
                  <TableCell>
                    {submission.agent_first_name || submission.agent_last_name
                      ? `${submission.agent_first_name ?? ""} ${submission.agent_last_name ?? ""}`.trim()
                      : "—"}
                  </TableCell>
                  <TableCell>{submission.zone || "—"}</TableCell>
                  <TableCell>
                    <div>{submission.merchant_name || "—"}</div>
                    <div className="text-xs text-ink-400">{submission.merchant_phone}</div>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatNaira(submission.amount)}</TableCell>
                  <TableCell>
                    <Badge tone={getActivationFeeStatusTone(submission.merchant_status)}>
                      {getActivationFeeStatusLabel(submission.merchant_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(submission.created_at), "d MMM yyyy")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedReceipt(submission)}>
                      <Eye className="h-4 w-4" />
                      View Receipt
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <ReceiptViewerModal
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        receiptUrl={selectedReceipt?.receipt_url ?? null}
        merchantName={selectedReceipt?.merchant_name}
      />
    </div>
  );
}
