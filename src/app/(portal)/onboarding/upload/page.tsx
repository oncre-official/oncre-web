"use client";

import { useState } from "react";

import { Tabs } from "@/components/ui/tabs";
import { StepIndicator } from "@/features/auth/components/step-indicator";
import { CsvUploadPanel } from "@/features/onboarding/components/csv-upload-panel";
import { ManualEntryForm } from "@/features/onboarding/components/manual-entry-form";

const TABS = [
  { key: "csv", label: "Upload CSV" },
  { key: "manual", label: "Add Manually" },
];

export default function UploadPage() {
  const [tab, setTab] = useState("csv");

  return (
    <div className="mx-auto max-w-2xl">
      <StepIndicator current={3} />
      <h1 className="mb-1 text-xl font-semibold text-ink-900">Add your debtors</h1>
      <p className="mb-6 text-sm text-ink-500">
        Bulk-import via CSV or add debtors one at a time — either way, each becomes a tracked recovery case.
      </p>

      <div className="mb-6">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />
      </div>

      {tab === "csv" ? <CsvUploadPanel /> : <ManualEntryForm />}
    </div>
  );
}
