const compactNumberFormatter = new Intl.NumberFormat("en-NG", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Auto-compact form for stat tiles (1,284 stays as-is; 12,900 -> 12.9K). */
export function formatCompactNumber(value: number): string {
  return value >= 10_000 ? compactNumberFormatter.format(value) : value.toLocaleString("en-NG");
}
