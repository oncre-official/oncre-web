"use client";

import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { initiateActivation, verifyActivation } from "@/lib/api/portal";
import { useSessionStore } from "@/lib/stores/session-store";
import { formatNaira, koboToNaira } from "@/lib/utils/currency";
import { toast } from "@/lib/stores/toast-store";
import { ApiError } from "@/types/api";
import { env } from "@/config/env";

const UNLOCK_FEATURES = [
  "Bulk CSV or manual debtor import",
  "21-day automated recovery engine (SMS + calls)",
  "Live Kanban tracking with case-level timelines",
];

/**
 * PRD 2.3 Sub-flow B. A real account (registered against the real backend)
 * redirects straight to a real Paystack test-mode checkout; the browser lands
 * back on `/onboarding/activate/callback` afterwards. Accounts with no real
 * backend link (pure mock, pre-dating real registration) keep the old
 * simulated confirmation button instead.
 */
export function ActivationCard() {
  const router = useRouter();
  const setAccount = useSessionStore((s) => s.setAccount);
  const [reference, setReference] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInitiate = async () => {
    setLoading(true);
    try {
      const result = await initiateActivation();
      if (result.payment_url) {
        window.location.href = result.payment_url;
        return;
      }
      setReference(result.reference);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Could not start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayment = async () => {
    if (!reference) return;
    setLoading(true);
    try {
      const { account } = await verifyActivation(reference);
      if (account) setAccount(account);
      toast.success("Payment confirmed. Account activated.");
      router.push("/onboarding/upload");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Payment confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <ShieldCheck className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-semibold text-ink-900">Activate your account</h1>
      <p className="mt-1 text-sm text-ink-500">
        A one-time ₦5,000 activation fee unlocks your recovery portal.
      </p>

      <ul className="my-6 flex flex-col gap-2.5">
        {UNLOCK_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-ink-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mb-6 rounded-lg bg-ink-50 px-4 py-3">
        <p className="text-sm text-ink-500">Activation fee</p>
        <p className="text-2xl font-bold text-ink-900">{formatNaira(koboToNaira(env.activationFeeKobo))}</p>
      </div>

      {!reference ? (
        <Button size="lg" className="w-full" loading={loading} onClick={handleInitiate}>
          Pay {formatNaira(koboToNaira(env.activationFeeKobo))} to Activate
        </Button>
      ) : (
        <div className="rounded-lg border border-dashed border-ink-300 p-4">
          <p className="mb-3 text-sm text-ink-600">
            Reference <span className="font-mono text-ink-900">{reference}</span> — no live payment gateway is
            connected in this environment, so confirm the charge manually to continue.
          </p>
          <Button size="lg" className="w-full" loading={loading} onClick={handleSimulatePayment}>
            Simulate successful payment
          </Button>
        </div>
      )}
    </Card>
  );
}
