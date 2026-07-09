const NG_LOCAL_PATTERN = /^0\d{10}$/;
const NG_INTL_PATTERN = /^\+234\d{10}$/;

/** Matches PRD 1.4.2 / 2.4.4: 0XXXXXXXXXX (11 digits) or +234XXXXXXXXXX. */
export function isValidNigerianPhone(value: string): boolean {
  const trimmed = value.trim();
  return NG_LOCAL_PATTERN.test(trimmed) || NG_INTL_PATTERN.test(trimmed);
}

/** Normalises a Nigerian phone number to E.164 (+234XXXXXXXXXX) before it is sent to any API. */
export function toE164Nigerian(value: string): string {
  const trimmed = value.trim();
  if (NG_INTL_PATTERN.test(trimmed)) return trimmed;
  if (NG_LOCAL_PATTERN.test(trimmed)) return `+234${trimmed.slice(1)}`;
  return trimmed;
}
