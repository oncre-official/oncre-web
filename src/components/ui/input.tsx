import { InputHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, invalid, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900 placeholder:text-ink-500",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
        invalid ? "border-status-critical" : "border-ink-300",
        className,
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";
