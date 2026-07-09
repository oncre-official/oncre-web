import { cn } from "@/lib/utils/cn";

const STEPS = ["Register", "Activate", "Upload debtors"];

interface StepIndicatorProps {
  /** 1-indexed current step, matching the PRD's "Step X of 4" copy (step 4 is reaching the dashboard). */
  current: 1 | 2 | 3;
}

export function StepIndicator({ current }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-500">
        Step {current} of 4
      </p>
      <div className="flex items-center gap-2">
        {STEPS.map((label, index) => {
          const step = index + 1;
          const isActive = step === current;
          const isDone = step < current;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  isDone || isActive ? "bg-brand-600" : "bg-ink-100",
                )}
              />
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-medium text-ink-700">{STEPS[current - 1]}</p>
    </div>
  );
}
