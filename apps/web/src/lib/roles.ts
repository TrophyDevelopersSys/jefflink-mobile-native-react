const ADMIN_ROLE_SET = new Set([
  "SUPER_ADMIN",
  "ADMIN",
  "SYSTEM_ADMIN",
  "DIRECTOR",
  "MANAGER",
  "FINANCE_ADMIN",
  "FINANCE_OFFICER",
  "AUDITOR",
  "MODERATOR",
  "SUPPORT",
  "LEGAL",
]);

const DEALER_ROLE_SET = new Set([
  "DEALER",
  "VENDOR",
  "AGENT",
]);

export function normalizeRole(role?: string | null): string {
  return (role ?? "").toUpperCase();
}

export function isAdminRole(role?: string | null): boolean {
  return ADMIN_ROLE_SET.has(normalizeRole(role));
}

export function isDealerRole(role?: string | null): boolean {
  return DEALER_ROLE_SET.has(normalizeRole(role));
}

export function canManageListings(role?: string | null): boolean {
  return isAdminRole(role) || isDealerRole(role);
}

export function roleLabel(role?: string | null): string {
  const normalized = normalizeRole(role);
  if (!normalized) return "Customer";
  return normalized
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
