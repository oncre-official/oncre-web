import { cn } from "@/lib/utils/cn";

interface MeterProps {
  /** 0–100 */
  value: number;
  fillClassName?: string;
  trackClassName?: string;
  className?: string;
}

/** Same-ramp progress track: the fill carries the value, the track is a lighter step of the same hue. */
export function Meter({ value, fillClassName = "bg-brand-600", trackClassName = "bg-brand-100", className }: MeterProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-1.5 w-full overflow-hidden rounded-full", trackClassName, className)}
    >
      <div className={cn("h-full rounded-full", fillClassName)} style={{ width: `${clamped}%` }} />
    </div>
  );
}
