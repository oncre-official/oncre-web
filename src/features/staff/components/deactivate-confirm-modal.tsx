"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { handleStaffApiError } from "@/lib/utils/staff-error";

interface DeactivateConfirmModalProps {
  open: boolean;
  entityLabel: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeactivateConfirmModal({ open, entityLabel, onClose, onConfirm }: DeactivateConfirmModalProps) {
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      handleStaffApiError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Deactivate ${entityLabel}?`}
      description="They will no longer be shown as active in the recovery engine. An admin can review this later."
    >
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="danger" loading={submitting} onClick={handleConfirm}>
          Deactivate
        </Button>
      </div>
    </Modal>
  );
}
