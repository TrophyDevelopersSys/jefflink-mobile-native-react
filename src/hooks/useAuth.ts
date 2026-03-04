import { useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "../store/auth.store";
import { onboardingManager } from "../utils/onboardingManager";
import { tokenManager } from "../utils/tokenManager";
import type { TokenPayload, UserProfile } from "../types/user.types";

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
  const { setSession, clearSession, setStatus, status, user, token } =
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
    const response = await authApi.login(email, password);
    await tokenManager.setToken(response.token);
    await onboardingManager.markComplete();
    setSession(response.token, response.user);
  }, [setSession, setStatus]);

  const register = useCallback(
    async (payload: { fullName: string; email: string; password: string }) => {
      setStatus("loading");
      const response = await authApi.register(payload);
      await tokenManager.setToken(response.token);
      await onboardingManager.markComplete();
      setSession(response.token, response.user);
    },
    [setSession, setStatus]
  );

  const signOut = useCallback(async () => {
    await tokenManager.clearToken();
    await onboardingManager.reset();
    clearSession();
  }, [clearSession]);

  return {
    status,
    user,
    token,
    initialize,
    signIn,
    register,
    signOut
  };
};
