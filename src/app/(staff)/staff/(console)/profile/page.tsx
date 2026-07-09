"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChangePinForm } from "@/features/staff/components/change-pin-form";
import { useStaffSessionStore } from "@/lib/stores/staff-session-store";

export default function ProfilePage() {
  const user = useStaffSessionStore((s) => s.user);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink-900">Profile</h1>
        <p className="text-sm text-ink-500">Your account details.</p>
      </div>

      <Card className="mb-6 p-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Email</dt>
            <dd className="text-ink-800">{user?.email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Phone</dt>
            <dd className="text-ink-800">
              {user?.country_code}
              {user?.phone}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Role</dt>
            <dd>
              <Badge tone="brand">{user?.role?.name ?? "—"}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">Status</dt>
            <dd>
              <Badge tone={user?.status === "active" ? "good" : "neutral"}>{user?.status}</Badge>
            </dd>
          </div>
        </dl>
      </Card>

      <h2 className="mb-3 text-sm font-semibold text-ink-900">Change PIN</h2>
      <ChangePinForm />
    </div>
  );
}
