"use client";

import { Modal } from "@/components/ui/modal";

interface ReceiptViewerModalProps {
  open: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  merchantName?: string;
}

export function ReceiptViewerModal({ open, onClose, receiptUrl, merchantName }: ReceiptViewerModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Payment receipt" description={merchantName}>
      {receiptUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Cloudinary URL, not a local asset
        <img src={receiptUrl} alt="Activation payment receipt" className="w-full rounded-lg border border-ink-100" />
      ) : (
        <p className="text-sm text-ink-500">No receipt available.</p>
      )}
    </Modal>
  );
}
