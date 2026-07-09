"use client";

import { AlertTriangle } from "lucide-react";

import { Modal } from "@/components/ui/modal";
import type { CreatedStaffUser } from "@/types/admin-user";

interface AdminUserCreatedNoticeProps {
  user: CreatedStaffUser | null;
  onClose: () => void;
}

/**
 * The backend returns a plaintext generated password exactly once, in the
 * create response — see `types/admin-user.ts`. This is the only place it's
 * ever shown; it is never persisted client-side beyond this component's
 * lifetime and disappears on refresh/navigation.
 */
export function AdminUserCreatedNotice({ user, onClose }: AdminUserCreatedNoticeProps) {
  if (!user) return null;

  return (
    <Modal open={!!user} onClose={onClose} title="Staff user created">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 rounded-lg bg-status-warning-soft p-3 text-sm text-ink-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-status-warning" />
          This password is shown once and cannot be retrieved again. Share it securely.
        </div>
        <div className="rounded-lg border border-ink-100 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Email or phone</p>
          <p className="mb-3 font-mono text-sm text-ink-800">{user.email ?? user.phone}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">Password</p>
          <p className="font-mono text-lg text-ink-900">{user.password}</p>
        </div>
      </div>
    </Modal>
  );
}
