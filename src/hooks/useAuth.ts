import { useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { onboardingManager } from "../utils/onboardingManager";
import { tokenManager } from "../utils/tokenManager";
import type { TokenPayload, UserProfile } from "../types/user.types";
import { Roles } from "../constants/roles";

const buildUserFromToken = (payload: TokenPayload): UserProfile | null => {
  if (!payload.sub || !payload.role || !payload.email) return null;
  return {
    id: payload.sub,
    email: payload.email,
    fullName: payload.name ?? payload.email,
    role: payload.role,
    status: "active"
  };
};

export const useAuth = () => {
  const { setSession, clearSession, setStatus, setError, status, error, user, token } =
    useAuthStore();

  const initialize = useCallback(async () => {
    setStatus("loading");
    const storedToken = await tokenManager.getToken();
    if (!storedToken) {
      clearSession();
      return;
    }

    try {
      const payload = jwtDecode<TokenPayload>(storedToken);
      const sessionUser = buildUserFromToken(payload);
      if (!sessionUser) {
        await tokenManager.clearToken();
        clearSession();
        return;
      }
      setSession(storedToken, sessionUser);
    } catch {
      await tokenManager.clearToken();
      clearSession();
    }
  }, [clearSession, setSession, setStatus]);

  const signIn = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    setError(null);
    try {
      const response = await authApi.login(email, password);
      await tokenManager.setToken(response.token);
      await onboardingManager.markComplete();
      setSession(response.token, response.user);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ??
        (e as { message?: string })?.message ??
        "Login failed. Please try again.";
      setError(msg);
      setStatus("error");
    }
  }, [setSession, setStatus, setError]);

  const register = useCallback(
    async (payload: { fullName: string; email: string; password: string; isDealer?: boolean }) => {
      setStatus("loading");
      setError(null);
      try {
        const role = payload.isDealer ? Roles.Agent : Roles.Customer;
        const response = await authApi.register({
          fullName: payload.fullName,
          email: payload.email,
          password: payload.password,
          role,
        });
        await tokenManager.setToken(response.token);
        await onboardingManager.markComplete();
        setSession(response.token, response.user);
      } catch (e: unknown) {
        const msg =
          (e as { response?: { data?: { message?: string } }; message?: string })
            ?.response?.data?.message ??
          (e as { message?: string })?.message ??
          "Registration failed. Please try again.";
        setError(msg);
        setStatus("error");
        throw e; // re-throw so the screen can react
      }
    },
    [setSession, setStatus, setError]
  );

  const signOut = useCallback(async () => {
    await tokenManager.clearToken();
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
