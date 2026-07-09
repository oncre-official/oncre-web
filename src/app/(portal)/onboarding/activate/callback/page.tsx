"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { verifyActivation } from "@/lib/api/portal";
import { useSessionStore } from "@/lib/stores/session-store";
import { toast } from "@/lib/stores/toast-store";
import { ApiError } from "@/types/api";

/**
 * Where Paystack's hosted checkout redirects the browser back to after a real
 * activation payment. Confirms via the synchronous verify endpoint (not the
 * webhook — Paystack's webhook can't reach `localhost`), since that's the
 * only reliable signal available in this environment.
 */
function ActivationCallback() {
  const router = useRouter();
  const params = useSearchParams();
  const setAccount = useSessionStore((s) => s.setAccount);
  const reference = params.get("reference") ?? params.get("trxref");
  const [status, setStatus] = useState<"checking" | "pending">("checking");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!reference) return;

    let cancelled = false;

    verifyActivation(reference)
      .then((result) => {
        if (cancelled) return;
        if (result.activated) {
          if (result.account) setAccount(result.account);
          toast.success("Payment confirmed. Account activated.");
          router.push("/onboarding/upload");
          return;
        }
        setStatus("pending");
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(error instanceof ApiError ? error.message : "Could not confirm your payment.");
        setStatus("pending");
      });

    return () => {
      cancelled = true;
    };
  }, [reference, attempt, router, setAccount]);

  if (!reference) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-ink-900">Missing payment reference</h1>
        <p className="mt-1 text-sm text-ink-500">
          We couldn&apos;t find a payment reference in the URL. Please try the payment again.
        </p>
        <Button size="lg" className="mt-6 w-full" onClick={() => router.push("/onboarding/activate")}>
          Back to activation
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
        <ShieldCheck className="h-6 w-6" />
      </div>

      {status === "checking" && (
        <>
          <h1 className="text-xl font-semibold text-ink-900">Confirming your payment</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-ink-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Please wait a moment...
          </p>
        </>
      )}

      {status === "pending" && (
        <>
          <h1 className="text-xl font-semibold text-ink-900">Still waiting on confirmation</h1>
          <p className="mt-1 text-sm text-ink-500">
            We haven&apos;t received confirmation of your payment yet. If you completed checkout, check again below.
          </p>
          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => {
              setStatus("checking");
              setAttempt((a) => a + 1);
            }}
          >
            Check again
          </Button>
        </>
      )}
    </Card>
  );
}

export default function ActivationCallbackPage() {
  return (
    <div className="mx-auto max-w-lg">
      <Suspense>
        <ActivationCallback />
      </Suspense>
    </div>
  );
}
