"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { CreatePaymentPlanModal } from "@/features/staff/components/create-payment-plan-modal";
import { listPayments } from "@/lib/api/staff/payments";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";
import { formatNaira } from "@/lib/utils/currency";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { hasRole, PAYMENT_PLAN_CREATE_ROLES } from "@/lib/utils/staff-permissions";
import type { Payment } from "@/types/payment";

export default function PaymentsPage() {
  const roleName = useStaffSessionStore((s) => s.user?.role?.name);
  const canCreate = hasRole(roleName, PAYMENT_PLAN_CREATE_ROLES);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    listPayments({ limit: 100 })
      .then((result) => setPayments(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-900">Payments</h1>
          <p className="text-sm text-ink-500">Payment links and repayment plans across cases.</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create payment plan
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Payment ID</TableHeaderCell>
              <TableHeaderCell>Case ID</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.length === 0 ? (
              <TableEmptyState colSpan={4} message="No payments yet." />
            ) : (
              payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-mono text-xs">{payment.payment_id}</TableCell>
                  <TableCell className="font-mono text-xs">{payment.case_id}</TableCell>
                  <TableCell className="tabular-nums">{formatNaira(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge tone="neutral">{payment.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      <CreatePaymentPlanModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(payment) => setPayments((prev) => [payment, ...prev])}
      />
    </div>
  );
}
