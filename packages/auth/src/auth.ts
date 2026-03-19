import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@jefflink/types";
import type { AuthAdapter } from "./adapter";

const API_BASE =
  (typeof process !== "undefined" &&
    (process.env["EXPO_PUBLIC_API_BASE_URL"] ??
      process.env["NEXT_PUBLIC_API_BASE_URL"] ??
      process.env["NEXT_PUBLIC_API_URL"])) ||
  "https://api.jefflinkcars.com/api/v1";

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string | string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ResetPasswordInput {
  userId: string;
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResult {
  message: string;
  userId?: string;
  token?: string;
  resetUrl?: string;
  expiresInSeconds?: number;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: TokenPayload;
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
  const response = await fetch(`${API_BASE}${path}`, init);
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload, fallbackError));
  }

  return unwrapData<T>(payload);
}

/**
 * Authenticates the user and stores the token using the provided adapter.
 * Fully platform-agnostic — token storage is delegated to the adapter.
 */
export async function login(
  credentials: LoginCredentials,
  adapter: AuthAdapter,
): Promise<AuthResult> {
  const data = await requestJson<{ accessToken: string; refreshToken?: string }>(
    "/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    },
    "Login failed",
  );

  const user = jwtDecode<TokenPayload>(data.accessToken);
  await adapter.setToken(data.accessToken);

  return { ...data, user };
}

/**
 * Registers a new account and stores the received access token.
 */
export async function register(
  payload: RegisterInput,
  adapter: AuthAdapter,
): Promise<AuthResult> {
  const data = await requestJson<{ accessToken: string; refreshToken?: string }>(
    "/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Registration failed",
  );

  const user = jwtDecode<TokenPayload>(data.accessToken);
  await adapter.setToken(data.accessToken);

  return { ...data, user };
}

/**
 * Starts the password reset flow.
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResult> {
  return requestJson<ForgotPasswordResult>(
    "/auth/forgot-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    },
    "Unable to start password reset",
  );
}

/**
 * Completes password reset using a userId + token pair.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
  return requestJson<{ message: string }>(
    "/auth/reset-password",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
    "Unable to reset password",
  );
}

/**
 * Clears the auth token from storage and notifies the server.
 */
export async function logout(adapter: AuthAdapter): Promise<void> {
  const token = await adapter.getToken();

  if (token) {
    // Best-effort server-side invalidation — failure is acceptable
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => undefined);
  }

  await adapter.clearToken();
}

/**
 * Attempts to refresh the access token.
 * Returns the new token or null if refresh fails.
 */
export async function refreshToken(
  refreshTokenValue: string,
  adapter: AuthAdapter,
): Promise<string | null> {
  try {
    const data = await requestJson<{ accessToken: string }>(
      "/auth/refresh",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      },
      "Unable to refresh token",
    );

    await adapter.setToken(data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Decodes the stored token to extract the user payload.
 * Returns null if no valid token is stored.
 */
export async function getSession(
  adapter: AuthAdapter,
): Promise<TokenPayload | null> {
  try {
    const token = await adapter.getToken();
    if (!token) return null;

    const payload = jwtDecode<TokenPayload>(token);
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      await adapter.clearToken();
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
