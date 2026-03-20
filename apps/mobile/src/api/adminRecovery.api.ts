import { config } from "../constants/config";

class AdminRecoveryApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "AdminRecoveryApiError";
    this.status = status;
  }
}

function extractMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const record = payload as Record<string, unknown>;
  const msg = record["message"];
  if (typeof msg === "string" && msg.trim()) return msg;
  if (Array.isArray(msg) && typeof msg[0] === "string") return msg[0];
  return fallback;
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") throw new Error("Unexpected API response");
  const record = payload as Record<string, unknown>;
  if (record["data"] !== undefined) return record["data"] as T;
  return payload as T;
}

async function requestJson<T>(
  path: string,
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AdminRecoveryApiError(
      extractMessage(payload, fallbackError),
      response.status,
    );
  }
  return unwrapData<T>(payload);
}

export async function requestAdminRecovery(email: string) {
  return requestJson<{ message: string }>(
    "/admin-recovery/request",
    { email },
    "Unable to process recovery request.",
  );
}

export async function resetAdminPassword(input: {
  userId: string;
  token: string;
  newPassword: string;
}) {
  return requestJson<{ message: string }>(
    "/admin-recovery/reset",
    input,
    "Unable to reset admin password.",
  );
}
