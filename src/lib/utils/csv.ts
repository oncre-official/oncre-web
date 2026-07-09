import Papa from "papaparse";

import { CSV_ALL_COLUMNS, CSV_REQUIRED_COLUMNS } from "@/lib/validation/debtor-row.schema";
import type { Case } from "@/types/case";

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
  missingColumns: string[];
}

export function parseCsvFile(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const missingColumns = CSV_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
        resolve({ headers, rows: result.data, missingColumns });
      },
      error: (error) => reject(error),
    });
  });
}

export function buildCsvTemplate(): string {
  const exampleRow: Record<(typeof CSV_ALL_COLUMNS)[number], string> = {
    debtor_full_name: "Aminu Musa Traders",
    debtor_phone: "08031234567",
    debtor_email: "aminu@example.com",
    business_name: "AMT Wholesale Ltd",
    amount_owed_ngn: "250000",
    invoice_reference: "INV-2024-0091",
    debt_date: "2024-09-15",
    notes: "3 months overdue, disputed Oct",
  };

  return Papa.unparse({
    fields: [...CSV_ALL_COLUMNS],
    data: [CSV_ALL_COLUMNS.map((col) => exampleRow[col])],
  });
}

export function buildCaseBoardCsv(cases: Case[]): string {
  return Papa.unparse(
    cases.map((c) => ({
      case_id: c.case_id,
      debtor_name: c.debtor_name,
      debtor_phone: c.debtor_phone,
      amount_owed_ngn: c.amount,
      status: c.status,
      current_day: c.current_day,
      due_date: c.due_date,
    })),
  );
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8;"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
