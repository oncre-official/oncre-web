import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "brand" | "good" | "warning" | "serious" | "critical";
}

/**
 * Status tones (good/warning/serious/critical) pair a colored dot with an
 * ink-colored label rather than colored text — the reserved status hues
 * don't clear text-contrast on a light surface at their saturated value, so
 * the dot + label is the mitigation (never color alone).
 */
const toneConfig: Record<NonNullable<BadgeProps["tone"]>, { bg: string; text: string; dot?: string }> = {
  neutral: { bg: "bg-ink-100", text: "text-ink-700" },
  brand: { bg: "bg-brand-50", text: "text-brand-700" },
  good: { bg: "bg-status-good-soft", text: "text-ink-800", dot: "bg-status-good" },
  warning: { bg: "bg-status-warning-soft", text: "text-ink-800", dot: "bg-status-warning" },
  serious: { bg: "bg-status-serious-soft", text: "text-ink-800", dot: "bg-status-serious" },
  critical: { bg: "bg-status-critical-soft", text: "text-ink-800", dot: "bg-status-critical" },
};

export function Badge({ className, tone = "neutral", children, ...props }: BadgeProps) {
  const { bg, text, dot } = toneConfig[tone];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", bg, text, className)}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}
