import { useCallback } from "react";
import type { AuthenticatedUser, UserProfile } from "@jefflink/types";
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  refreshToken as authRefreshToken,
  getCurrentUser,
} from "../api/authClient";
import { useAuthStore } from "../store/auth.store";
import { onboardingManager } from "../utils/onboardingManager";
import { tokenManager } from "../utils/tokenManager";
import { AuthMessages } from "../constants/authMessages";

type ApiError = {
  response?: { data?: { message?: string | string[] }; status?: number };
  message?: string;
  code?: string;
  status?: number;
  payload?: { message?: string | string[] };
};

function pickMessage(value: string | string[] | undefined): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const first = value.find((entry) => typeof entry === "string" && entry.trim());
    if (first) return first;
  }
  return null;
}

function resolveApiError(e: unknown, fallback: string): string {
  const err = e as ApiError;
  const status = err?.response?.status ?? err?.status;
  const serverMsg =
    pickMessage(err?.response?.data?.message) ??
    pickMessage(err?.payload?.message);

  if (status === 401) {
    if (serverMsg && /not active/i.test(serverMsg)) return AuthMessages.account.disabled;
    return AuthMessages.login.invalidCredentials;
  }
  if (status === 403) return AuthMessages.account.suspended;
  if (status === 429) return AuthMessages.rateLimit.login;
  if (!err.response && err.code === "ECONNABORTED") return AuthMessages.general.timeout;
  const isNetwork = !err.response && (
    err.message === "Network Error" ||
    err.message === "Network request failed" ||
    err.code === "ERR_NETWORK"
  );
  if (isNetwork) return AuthMessages.general.networkOffline;
  if (serverMsg) return serverMsg;
  if (err?.message && err.message.trim() && err.message !== fallback) return err.message;
  return fallback;
}

const mapAuthenticatedUser = (user: AuthenticatedUser): UserProfile => ({
  id: user.id,
  email: user.email,
  fullName: user.name,
  role: user.role,
  status: "active",
  avatarUrl: user.avatarUrl,
});

const mobileAuthAdapter = {
  getToken: () => tokenManager.getToken(),
  setToken: (token: string) => tokenManager.setToken(token),
  clearToken: () => tokenManager.clearToken(),
};

export const useAuth = () => {
  const { setSession, clearSession, setStatus, setError, setInitialized, status, error, user, token } =
    useAuthStore();

  const resolveSessionUser = useCallback(async (): Promise<UserProfile | null> => {
    try {
      return mapAuthenticatedUser(await getCurrentUser(mobileAuthAdapter));
    } catch {
      return null;
    }
  }, []);

  const initialize = useCallback(async () => {
    setStatus("loading");
    const storedToken = await tokenManager.getToken();
    const storedRefreshToken = await tokenManager.getRefreshToken();

    try {
      const hydrateSession = async (accessToken: string | null): Promise<boolean> => {
        if (!accessToken) return false;
        const sessionUser = await resolveSessionUser();
        if (!sessionUser) return false;
        setSession(accessToken, sessionUser);
        return true;
      };

      if (await hydrateSession(storedToken)) {
        return;
      }

      if (storedRefreshToken) {
        const refreshedTokens = await authRefreshToken(
          storedRefreshToken,
          mobileAuthAdapter,
        );
        if (refreshedTokens?.refreshToken) {
          await tokenManager.setRefreshToken(refreshedTokens.refreshToken);
        }
        if (await hydrateSession(refreshedTokens?.accessToken ?? null)) {
          return;
        }
      }

      await tokenManager.clearToken();
      clearSession();
    } catch {
      await tokenManager.clearToken();
      clearSession();
    } finally {
      setInitialized();
    }
  }, [clearSession, resolveSessionUser, setSession, setStatus, setInitialized]);

  const signIn = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    setError(null);
    try {
      const response = await authLogin({ email, password }, mobileAuthAdapter);
      if (response.refreshToken) {
        await tokenManager.setRefreshToken(response.refreshToken);
      } else {
        await tokenManager.clearRefreshToken();
      }
      await onboardingManager.markComplete();
      setSession(response.accessToken, mapAuthenticatedUser(response.user));
    } catch (e: unknown) {
      setError(resolveApiError(e, AuthMessages.general.unexpected));
      setStatus("error");
    }
  }, [setSession, setStatus, setError]);

  const register = useCallback(
    async (payload: { fullName: string; email: string; password: string; isDealer?: boolean }) => {
      setStatus("loading");
      setError(null);
      try {
        const response = await authRegister({
          name: payload.fullName,
          email: payload.email,
          password: payload.password,
          isDealer: payload.isDealer,
          role: payload.isDealer ? "VENDOR" : "CUSTOMER",
        }, mobileAuthAdapter);
        if (response.refreshToken) {
          await tokenManager.setRefreshToken(response.refreshToken);
        } else {
          await tokenManager.clearRefreshToken();
        }
        await onboardingManager.markComplete();
        setSession(response.accessToken, mapAuthenticatedUser(response.user));
      } catch (e: unknown) {
        setError(resolveApiError(e, AuthMessages.general.unexpected));
        setStatus("error");
        throw e; // re-throw so the screen can react
      }
    },
    [setSession, setStatus, setError]
  );

  const signOut = useCallback(async () => {
    await authLogout(mobileAuthAdapter).catch(() => undefined);
    await onboardingManager.reset();
    clearSession();
  }, [clearSession]);

  return {
    status,
    error,
    user,
    token,
    initialize,
    signIn,
    register,
    signOut
  };
};
