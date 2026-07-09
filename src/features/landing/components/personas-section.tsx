import { Building2, Store } from "lucide-react";

const personas = [
  {
    icon: Store,
    title: "SME Merchant",
    description:
      "Nigerian SME owner with outstanding B2B invoices owed by buyers or distributors. Recover unpaid debts without damaging business relationships.",
  },
  {
    icon: Building2,
    title: "Financial Institution",
    description:
      "Banks, MFBs, and lenders with significant Non-Performing Loan portfolios. Reduce NPL ratios using Oncre's structured recovery engine at scale.",
  },
];

export function PersonasSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {personas.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-2xl border border-ink-100 p-6">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">{title}</h3>
            <p className="mt-2 text-sm text-ink-500">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
