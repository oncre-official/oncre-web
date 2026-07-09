const formatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const compactFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatNaira(amount: number): string {
  return formatter.format(amount);
}

/** Auto-compact form for stat tiles (₦4.2M) — per the dataviz skill's stat-tile contract. */
export function formatNairaCompact(amount: number): string {
  return compactFormatter.format(amount);
}

export function koboToNaira(kobo: number): number {
  return Math.round(kobo) / 100;
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}
