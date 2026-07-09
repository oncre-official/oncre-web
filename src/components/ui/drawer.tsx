"use client";

import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
}

/** Right-anchored slide-over used for the Kanban case-detail panel (PRD 2.3 step 33). */
export function Drawer({ open, onClose, title, children }: DrawerProps) {
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
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl sm:max-w-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-white px-6 py-4">
          <div className="text-base font-semibold text-ink-900">{title}</div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 hover:text-ink-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
