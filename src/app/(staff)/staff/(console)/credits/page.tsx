"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { listCredits } from "@/lib/api/staff/credits";
import { formatNaira } from "@/lib/utils/currency";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import type { Credit } from "@/types/credit";

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCredits({ limit: 100 })
      .then((result) => setCredits(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Credits</h1>
        <p className="text-sm text-ink-500">
          The bulk-imported credit ledger that drives messaging independent of Cases — read-only.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Credit ID</TableHeaderCell>
              <TableHeaderCell>Customer</TableHeaderCell>
              <TableHeaderCell>Amount</TableHeaderCell>
              <TableHeaderCell>Payment status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {credits.length === 0 ? (
              <TableEmptyState colSpan={4} message="No credits yet." />
            ) : (
              credits.map((credit) => (
                <TableRow key={credit._id}>
                  <TableCell className="font-mono text-xs">{credit.credit_id}</TableCell>
                  <TableCell>{credit.customer_name}</TableCell>
                  <TableCell className="tabular-nums">{formatNaira(credit.credit_amount)}</TableCell>
                  <TableCell>
                    <Badge tone="neutral">{credit.payment_status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
