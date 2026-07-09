import { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/** Wraps a form control with a label and the inline validation-error slot every PRD form uses. */
export function Field({ label, htmlFor, error, hint, required, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
        {label}
        {required && <span className="text-status-critical"> *</span>}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-status-critical" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}
