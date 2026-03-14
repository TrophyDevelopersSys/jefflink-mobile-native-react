"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { login, logout, getSession } from "@jefflink/auth";
import type { TokenPayload } from "@jefflink/types";
import { webAuthAdapter, webRefreshAdapter } from "../lib/authAdapter";

// ─── Types ───────────────────────────────────────────────────────────────────

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: TokenPayload | null;
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
  const [user, setUser] = useState<TokenPayload | null>(null);
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getSession(webAuthAdapter)
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setUser(payload);
          setStatus("authenticated");
        } else {
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("unauthenticated");
      });
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
