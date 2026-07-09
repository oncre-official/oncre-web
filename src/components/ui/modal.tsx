"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Centered dialog on desktop, full-height bottom sheet on mobile — satisfies
 * both AC-LND-002 ("inline modal or drawer... URL does not change") and
 * AC-LND-008 ("FI form renders in a scrollable full-height drawer" at 375px).
 */
export function Modal({ open, onClose, title, description, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} aria-hidden="true" />
      <div
        className={cn(
          "relative flex h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl",
          "sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-2xl",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
