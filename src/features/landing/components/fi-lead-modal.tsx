"use client";

import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/ui/modal";

import { FiLeadForm } from "./fi-lead-form";

interface FiLeadModalProps {
  open: boolean;
  onClose: () => void;
}

/** AC-LND-002 / AC-LND-005 — opens inline, no navigation, and swaps to a confirmation state on success. */
export function FiLeadModal({ open, onClose }: FiLeadModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    onClose();
    setTimeout(() => setSubmitted(false), 300);
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={submitted ? "Thank you" : "Contact enterprise sales"}
      description={submitted ? undefined : "Tell us about your NPL portfolio and our team will reach out."}
    >
      {submitted ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <CheckCircle2 className="h-12 w-12 text-brand-600" />
          <p className="text-base font-medium text-ink-900">
            Thank you. Our team will contact you within 1 business day.
          </p>
        </div>
      ) : (
        <FiLeadForm onSuccess={() => setSubmitted(true)} />
      )}
    </Modal>
  );
}
