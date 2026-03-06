import { create } from "zustand";
import type { UserProfile } from "../types/user.types";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "error";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  status: AuthStatus;
  error: string | null;
  isGuest: boolean;
  /** Set to true once initialize() has run at least once. */
  initialized: boolean;
  setStatus: (status: AuthStatus) => void;
  setError: (error: string | null) => void;
  setSession: (token: string, user: UserProfile) => void;
  clearSession: () => void;
  setGuestMode: (value: boolean) => void;
  setInitialized: () => void;
}

// Zustand v5 requires the curried create<T>()((set) => ...) pattern
export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  status: "idle",
  error: null,
  isGuest: false,
  initialized: false,
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
  setSession: (token, user) =>
    set({ token, user, status: "authenticated", error: null, isGuest: false }),
  clearSession: () =>
    set({ token: null, user: null, status: "unauthenticated", error: null, isGuest: false }),
  setGuestMode: (value) => set({ isGuest: value }),
  setInitialized: () => set({ initialized: true }),
}));
