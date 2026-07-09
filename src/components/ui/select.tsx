import { SelectHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils/cn";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, invalid, children, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-ink-900",
        "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
        invalid ? "border-status-critical" : "border-ink-300",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
Select.displayName = "Select";
