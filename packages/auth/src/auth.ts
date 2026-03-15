import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@jefflink/types";
import type { AuthAdapter } from "./adapter";

const API_BASE =
  (typeof process !== "undefined" &&
    (process.env["EXPO_PUBLIC_API_BASE_URL"] ??
     process.env["NEXT_PUBLIC_API_BASE_URL"])) ||
  "https://api.jefflinkcars.com/api/v1";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  refreshToken?: string;
  user: TokenPayload;
}

/**
 * Authenticates the user and stores the token using the provided adapter.
 * Fully platform-agnostic — token storage is delegated to the adapter.
 */
export async function login(
  credentials: LoginCredentials,
  adapter: AuthAdapter
): Promise<AuthResult> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as { message?: string }).message ?? "Login failed");
  }

  // Backend wraps all responses: { success, data, timestamp }
  const raw = (await response.json()) as { success: boolean; data: { accessToken: string; refreshToken?: string } };
  const data = raw.data;
  const user = jwtDecode<TokenPayload>(data.accessToken);

  await adapter.setToken(data.accessToken);

  return { ...data, user };
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
  adapter: AuthAdapter
): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!response.ok) return null;

    // Backend wraps all responses: { success, data, timestamp }
    const raw = (await response.json()) as { success: boolean; data: { accessToken: string } };
    await adapter.setToken(raw.data.accessToken);
    return raw.data.accessToken;
  } catch {
    return null;
  }
}

/**
 * Decodes the stored token to extract the user payload.
 * Returns null if no valid token is stored.
 */
export async function getSession(
  adapter: AuthAdapter
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
