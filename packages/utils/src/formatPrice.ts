/**
 * Formats a numeric price with currency symbol.
 * Works identically on mobile and web.
 */
export function formatPrice(
  amount: number,
  currency = "UGX",
  locale = "en-UG"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

/**
 * Formats a compact price (e.g. 1.2M, 450K).
 */
export function formatCompactPrice(amount: number, currency = "UGX"): string {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(0)}K`;
  }
  return `${currency} ${amount}`;
}
