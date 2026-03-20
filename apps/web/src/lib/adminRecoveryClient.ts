/**
 * Admin Recovery API client for the Next.js web app.
 * Public endpoints use unauthenticated fetch.
 * Protected endpoints (SUPER_ADMIN) use the stored JWT.
 */

const API_BASE =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ??
  process.env["NEXT_PUBLIC_API_URL"] ??
  "https://api.jefflinkcars.com/api/v1";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string | string[];
}

function extractErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const message = record["message"];
  if (typeof message === "string" && message.trim()) return message;
  if (Array.isArray(message) && message.length > 0) {
    const first = message[0];
    if (typeof first === "string" && first.trim()) return first;
  }
  if (record["data"] && typeof record["data"] === "object") {
    const data = record["data"] as Record<string, unknown>;
    const nested = data["message"];
    if (typeof nested === "string" && nested.trim()) return nested;
  }
  return fallback;
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected API response");
  const record = payload as ApiEnvelope<T>;
  return record.data !== undefined ? record.data : (payload as T);
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(extractErrorMessage(payload, fallbackError));
  return unwrapData<T>(payload);
}

// ── Public endpoints ─────────────────────────────────────────────────────────

export interface AdminRecoveryResult {
  message: string;
  userId?: string;
  token?: string;
  resetUrl?: string;
  expiresInSeconds?: number;
}

export async function requestAdminRecovery(
  email: string,
): Promise<AdminRecoveryResult> {
  return requestJson<AdminRecoveryResult>(
    "/admin-recovery/request",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
    "Unable to start admin recovery",
  );
}

export interface AdminResetResult {
  message: string;
}

export async function resetAdminPassword(input: {
  userId: string;
  token: string;
  newPassword: string;
}): Promise<AdminResetResult> {
  return requestJson<AdminResetResult>(
    "/admin-recovery/reset",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "Unable to reset admin password",
  );
}
