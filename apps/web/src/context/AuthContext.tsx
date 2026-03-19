"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthenticatedUser } from "@jefflink/types";
import { login, logout, getCurrentUser, refreshToken } from "../lib/authClient";
import { webAuthAdapter, webRefreshAdapter } from "../lib/authAdapter";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: AuthenticatedUser | null;
  status: AuthStatus;
  error: string | null;
  isAuthenticated: boolean;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      setStatus("loading");
      try {
        const storedToken = await webAuthAdapter.getToken();
        if (cancelled) return;

        if (storedToken) {
          const currentUser = await getCurrentUser(webAuthAdapter);
          if (cancelled) return;
          setUser(currentUser);
          setStatus("authenticated");
          return;
        }

        const storedRefreshToken = webRefreshAdapter.getRefreshToken();
        if (storedRefreshToken) {
          const refreshedTokens = await refreshToken(storedRefreshToken, webAuthAdapter);
          if (cancelled) return;

          if (!refreshedTokens) {
            webRefreshAdapter.clearRefreshToken();
            setStatus("unauthenticated");
            return;
          }

          if (refreshedTokens.refreshToken) {
            webRefreshAdapter.setRefreshToken(refreshedTokens.refreshToken);
          }

          const refreshedToken = await webAuthAdapter.getToken();
          if (cancelled) return;

          if (refreshedToken) {
            const currentUser = await getCurrentUser(webAuthAdapter);
            if (cancelled) return;
            setUser(currentUser);
            setStatus("authenticated");
            return;
          }
        }

        setStatus("unauthenticated");
      } catch {
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    };

    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await login({ email, password }, webAuthAdapter);
      // also persist refresh token if returned
      if (result.refreshToken) {
        webRefreshAdapter.setRefreshToken(result.refreshToken);
      } else {
        webRefreshAdapter.clearRefreshToken();
      }
      setUser(result.user);
      setStatus("authenticated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
      setStatus("unauthenticated");
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await logout(webAuthAdapter).catch(() => undefined);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        isAuthenticated: status === "authenticated",
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}

/** Alias for useAuthContext — use either name. */
export const useAuth = useAuthContext;
