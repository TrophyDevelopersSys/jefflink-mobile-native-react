/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(
  isoString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale = "en-UG"
): string {
  try {
    return new Date(isoString).toLocaleDateString(locale, options);
  } catch {
    return isoString;
  }
}

/**
 * Returns a relative time string (e.g. "2 days ago").
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const date = new Date(isoString).getTime();
  const diffMs = now - date;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return formatDate(isoString);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}
