import { create } from "zustand";
import type { UserProfile } from "../types/user.types";

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  status: AuthStatus;
  setStatus: (status: AuthStatus) => void;
  setSession: (token: string, user: UserProfile) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  status: "idle",
  setStatus: (status) => set({ status }),
  setSession: (token, user) =>
    set({ token, user, status: "authenticated" }),
  clearSession: () => set({ token: null, user: null, status: "unauthenticated" })
}));
