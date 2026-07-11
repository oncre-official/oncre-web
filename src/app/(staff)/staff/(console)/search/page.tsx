"use client";

import { Search as SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { StaffDirectoryProfileDrawer, type ProfileTarget } from "@/features/staff/components/staff-directory-profile-drawer";
import { searchCustomers } from "@/lib/api/staff/customers";
import { searchMerchants } from "@/lib/api/staff/merchants";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import { CustomerStatus, type Customer } from "@/types/customer";
import type { Merchant } from "@/types/merchant";

const MIN_QUERY_LENGTH = 3;

export default function StaffSearchPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 300);

  const [results, setResults] = useState<{ query: string; merchants: Merchant[]; customers: Customer[] } | null>(null);
  const [target, setTarget] = useState<ProfileTarget | null>(null);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) return;

    let cancelled = false;

    Promise.all([searchMerchants(debouncedQuery), searchCustomers(debouncedQuery)])
      .then(([merchantResult, customerResult]) => {
        if (cancelled) return;
        setResults({ query: debouncedQuery, merchants: merchantResult.row, customers: customerResult.row });
      })
      .catch((error) => {
        if (!cancelled) handleStaffApiError(error);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const idle = debouncedQuery.length < MIN_QUERY_LENGTH;
  const loading = !idle && results?.query !== debouncedQuery;
  const merchants = results?.query === debouncedQuery ? results.merchants : [];
  const customers = results?.query === debouncedQuery ? results.customers : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Search</h1>
        <p className="text-sm text-ink-500">Find any merchant or debtor by name or phone number.</p>
      </div>

      <div className="relative mb-6 max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or phone…"
          className="pl-10"
        />
      </div>

      {idle ? (
        <p className="py-10 text-center text-sm text-ink-400">Type at least {MIN_QUERY_LENGTH} characters to search.</p>
      ) : loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="mb-2 text-sm font-medium text-ink-700">Merchants</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Merchant ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Phone</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {merchants.length === 0 ? (
                  <TableEmptyState colSpan={4} message="No matching merchants." />
                ) : (
                  merchants.map((merchant) => (
                    <TableRow
                      key={merchant._id}
                      onClick={() => setTarget({ kind: "merchant", record: merchant })}
                      className="cursor-pointer hover:bg-ink-50"
                    >
                      <TableCell className="font-mono text-xs">{merchant.merchant_id}</TableCell>
                      <TableCell>{merchant.merchant_name}</TableCell>
                      <TableCell>{merchant.merchant_phone}</TableCell>
                      <TableCell>
                        <Badge tone={merchant.is_active === false ? "critical" : merchant.activated ? "good" : "neutral"}>
                          {merchant.is_active === false ? "Deactivated" : merchant.activated ? "Activated" : "Pending"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>

          <section>
            <h2 className="mb-2 text-sm font-medium text-ink-700">Debtors</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Customer ID</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Phone</TableHeaderCell>
                  <TableHeaderCell>Status</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.length === 0 ? (
                  <TableEmptyState colSpan={4} message="No matching debtors." />
                ) : (
                  customers.map((customer) => (
                    <TableRow
                      key={customer._id}
                      onClick={() => setTarget({ kind: "customer", record: customer })}
                      className="cursor-pointer hover:bg-ink-50"
                    >
                      <TableCell className="font-mono text-xs">{customer.customer_id}</TableCell>
                      <TableCell>{customer.customer_name}</TableCell>
                      <TableCell>{customer.customer_phone}</TableCell>
                      <TableCell>
                        <Badge
                          tone={
                            customer.status === CustomerStatus.INACTIVE
                              ? "critical"
                              : customer.status === CustomerStatus.CASH_ONLY
                                ? "warning"
                                : "good"
                          }
                        >
                          {customer.status === CustomerStatus.INACTIVE
                            ? "Deactivated"
                            : customer.status === CustomerStatus.CASH_ONLY
                              ? "Cash only"
                              : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </section>
        </div>
      )}

      <StaffDirectoryProfileDrawer target={target} onClose={() => setTarget(null)} onChanged={() => setTarget(null)} />
    </div>
  );
}
