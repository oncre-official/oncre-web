import { TextareaHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, invalid, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-500",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
        invalid ? "border-status-critical" : "border-ink-300",
        className,
      )}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
