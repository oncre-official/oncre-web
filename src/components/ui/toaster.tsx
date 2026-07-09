"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";

import { cn } from "@/lib/utils/cn";
import { useToastStore } from "@/lib/stores/toast-store";

const toneStyles = {
  success: "border-ink-100 bg-status-good-soft text-ink-800",
  error: "border-ink-100 bg-status-critical-soft text-ink-800",
  info: "border-ink-100 bg-white text-ink-800",
};

const toneIconStyles = {
  success: "text-status-good",
  error: "text-status-critical",
  info: "text-ink-500",
};

const toneIcons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:right-4 sm:left-auto">
      {toasts.map((t) => {
        const Icon = toneIcons[t.tone];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border p-3 shadow-md sm:w-96",
              toneStyles[t.tone],
            )}
            role="status"
          >
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneIconStyles[t.tone])} />
            <p className="flex-1 text-sm">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-xs opacity-60 hover:opacity-100">
              Dismiss
            </button>
          </div>
        );
      })}
    </div>
  );
}
