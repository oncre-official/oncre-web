"use client";

import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bulkUploadCases } from "@/lib/api/portal";
import { toast } from "@/lib/stores/toast-store";
import { buildCsvTemplate, downloadTextFile, parseCsvFile } from "@/lib/utils/csv";
import { debtorRecordSchema } from "@/lib/validation/debtor-row.schema";
import { ApiError } from "@/types/api";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_ROWS = 500;

interface RowError {
  row: number;
  column: string;
  message: string;
}

type PanelState =
  | { phase: "idle" }
  | { phase: "error"; message: string }
  | { phase: "preview"; rows: Record<string, string>[]; validCount: number; invalidCount: number; errors: RowError[] }
  | { phase: "importing" }
  | { phase: "done"; total: number; valid: number; invalid: number; errors: RowError[] };

export function CsvUploadPanel() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<PanelState>({ phase: "idle" });
  const [dragOver, setDragOver] = useState(false);

  const handleDownloadTemplate = () => {
    downloadTextFile("oncre-debtor-template.csv", buildCsvTemplate());
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setState({
        phase: "error",
        message: "File size exceeds the 5MB limit. Please split your file and upload in batches.",
      });
      return;
    }

    const { rows, missingColumns } = await parseCsvFile(file);

    if (missingColumns.length > 0) {
      setState({
        phase: "error",
        message: `Missing required column: ${missingColumns[0]}. Please use the Oncre CSV template.`,
      });
      return;
    }

    if (rows.length > MAX_ROWS) {
      setState({ phase: "error", message: `A single upload can contain at most ${MAX_ROWS} rows.` });
      return;
    }

    const errors: RowError[] = [];
    let validCount = 0;

    rows.forEach((row, index) => {
      const result = debtorRecordSchema.safeParse(row);
      if (result.success) {
        validCount += 1;
      } else {
        for (const issue of result.error.issues) {
          errors.push({ row: index + 1, column: String(issue.path[0] ?? ""), message: issue.message });
        }
      }
    });

    setState({ phase: "preview", rows, validCount, invalidCount: rows.length - validCount, errors });
  };

  const handleConfirmImport = async () => {
    if (state.phase !== "preview") return;
    setState({ phase: "importing" });
    try {
      const result = await bulkUploadCases(state.rows);
      setState({ phase: "done", total: result.total, valid: result.valid, invalid: result.invalid, errors: result.errors });
      toast.success(`${result.valid} cases created successfully.`);
    } catch (error) {
      setState({ phase: "idle" });
      toast.error(error instanceof ApiError ? error.message : "Import failed. Please try again.");
    }
  };

  const handleDownloadErrorReport = (errors: RowError[]) => {
    const csv = ["row,column,message", ...errors.map((e) => `${e.row},${e.column},"${e.message}"`)].join("\n");
    downloadTextFile("oncre-import-errors.csv", csv);
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-ink-500">Upload up to 500 debtors at once using the 8-column template.</p>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
        >
          <Download className="h-4 w-4" />
          Download template
        </button>
      </div>

      {(state.phase === "idle" || state.phase === "error") && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-brand-500 bg-brand-50" : "border-ink-300"
          }`}
        >
          <Upload className="h-8 w-8 text-ink-400" />
          <p className="text-sm font-medium text-ink-700">Drag and drop your CSV here, or click to browse</p>
          <p className="text-xs text-ink-500">Max 5MB, 500 rows</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {state.phase === "error" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-status-critical-soft p-3 text-sm text-ink-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-critical" />
          {state.message}
        </div>
      )}

      {state.phase === "preview" && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm font-medium text-ink-800">
            {state.validCount} row{state.validCount === 1 ? "" : "s"} valid
            {state.invalidCount > 0 && `, ${state.invalidCount} row${state.invalidCount === 1 ? "" : "s"} have errors`}.
          </p>
          {state.errors.length > 0 && (
            <button
              onClick={() => handleDownloadErrorReport(state.errors)}
              className="w-fit text-sm font-medium text-brand-700 hover:underline"
            >
              Download error report
            </button>
          )}
          <div className="flex gap-3">
            <Button onClick={handleConfirmImport} disabled={state.validCount === 0}>
              Confirm Import
            </Button>
            <Button variant="secondary" onClick={() => setState({ phase: "idle" })}>
              Choose a different file
            </Button>
          </div>
        </div>
      )}

      {state.phase === "importing" && <p className="mt-4 text-sm text-ink-500">Importing cases…</p>}

      {state.phase === "done" && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start gap-2 rounded-lg bg-status-good-soft p-3 text-sm text-ink-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-good" />
            {state.valid} cases created successfully.
            {state.invalid > 0 && ` ${state.invalid} row${state.invalid === 1 ? "" : "s"} were skipped.`}
          </div>
          {state.errors.length > 0 && (
            <button
              onClick={() => handleDownloadErrorReport(state.errors)}
              className="w-fit text-sm font-medium text-brand-700 hover:underline"
            >
              Download error report
            </button>
          )}
        </div>
      )}

      <div className="mt-6 flex border-t border-ink-100 pt-4">
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Go to Kanban Dashboard
        </Button>
      </div>
    </Card>
  );
}
