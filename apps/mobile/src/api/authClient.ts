import type {
  AuthTokensResponse,
  CurrentUserResponse,
  LoginCredentials,
  RefreshTokensResponse,
  RegisterInput,
} from "@jefflink/types";
import type { AuthAdapter } from "@jefflink/auth";
import { config } from "../constants/config";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string | string[];
}

export class AuthApiError extends Error {
  status?: number;
  code?: string;
  payload?: unknown;

  constructor(
    message: string,
    options?: { status?: number; code?: string; payload?: unknown },
  ) {
    super(message);
    this.name = "AuthApiError";
    this.status = options?.status;
    this.code = options?.code;
    this.payload = options?.payload;
  }
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
    if (Array.isArray(nested) && nested.length > 0) {
      const first = nested[0];
      if (typeof first === "string" && first.trim()) return first;
    }
  }

  return fallback;
}

function extractErrorCode(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;

  const record = payload as Record<string, unknown>;
  const code = record["code"];
  if (typeof code === "string" && code.trim()) return code;

  const error = record["error"];
  if (typeof error === "string" && error.trim()) return error;

  return undefined;
}

function unwrapData<T>(payload: unknown): T {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected API response");
  }

  const record = payload as ApiEnvelope<T>;
  if (record.data !== undefined) {
    return record.data;
  }

  return payload as T;
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  fallbackError: string,
): Promise<T> {
  const response = await fetch(`${config.apiBaseUrl}${path}`, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthApiError(extractErrorMessage(payload, fallbackError), {
      status: response.status,
      code: extractErrorCode(payload),
      payload,
    });
  }

  return unwrapData<T>(payload);
}

export async function login(
  credentials: LoginCredentials,
  adapter: AuthAdapter,
): Promise<AuthTokensResponse> {
  const data = await requestJson<AuthTokensResponse>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim().toLowerCase(),
        password: credentials.password,
      }),
    },
    "Login failed",
  );

  await adapter.setToken(data.accessToken);
  return data;
}

export async function register(
  payload: RegisterInput,
  adapter: AuthAdapter,
): Promise<AuthTokensResponse> {
  const normalizedName = payload.name?.trim() || payload.fullName?.trim() || "";
  const data = await requestJson<AuthTokensResponse>(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
        name: normalizedName || undefined,
        fullName: payload.fullName?.trim() || undefined,
        phone: payload.phone?.trim() || undefined,
        role: payload.role,
        isDealer: payload.isDealer,
      }),
    },
    "Registration failed",
  );

  await adapter.setToken(data.accessToken);
  return data;
}

export async function refreshToken(
  refreshTokenValue: string,
  adapter: AuthAdapter,
): Promise<RefreshTokensResponse | null> {
  try {
    const data = await requestJson<RefreshTokensResponse>(
      "/auth/refresh",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      },
      "Unable to refresh token",
    );

    await adapter.setToken(data.accessToken);
    return data;
  } catch {
    return null;
  }
}

export async function getCurrentUser(
  adapter: AuthAdapter,
): Promise<CurrentUserResponse> {
  const token = await adapter.getToken();
  if (!token) {
    throw new AuthApiError("No active session", { status: 401, code: "NO_TOKEN" });
  }

  return requestJson<CurrentUserResponse>(
    "/auth/me",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    "Unable to fetch current user",
  );
}

export async function logout(adapter: AuthAdapter): Promise<void> {
  const token = await adapter.getToken();

  if (token) {
    await fetch(`${config.apiBaseUrl}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  await adapter.clearToken();
}