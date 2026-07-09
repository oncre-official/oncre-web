"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Table, TableBody, TableCell, TableEmptyState, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";
import { listMessages } from "@/lib/api/staff/messages";
import { handleStaffApiError } from "@/lib/utils/staff-error";
import type { Message } from "@/types/message";

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMessages({ limit: 100 })
      .then((result) => setMessages(result.row))
      .catch(handleStaffApiError)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Messages</h1>
        <p className="text-sm text-ink-500">SMS activity across cases — read-only.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Case ID</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Body</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {messages.length === 0 ? (
              <TableEmptyState colSpan={4} message="No messages yet." />
            ) : (
              messages.map((message) => (
                <TableRow key={message._id}>
                  <TableCell className="font-mono text-xs">{message.case_id ?? "—"}</TableCell>
                  <TableCell>{message.message_type.replaceAll("_", " ")}</TableCell>
                  <TableCell className="max-w-md truncate">{message.message_body}</TableCell>
                  <TableCell>
                    <Badge tone="neutral">{message.delivery_status}</Badge>
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
