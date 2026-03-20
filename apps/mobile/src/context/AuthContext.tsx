import { createContext, useContext, type PropsWithChildren } from "react";
import type { UserProfile } from "@jefflink/types";
import type { AuthStatus } from "../store/auth.store";
import { useAuthStore } from "../store/auth.store";

export type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
  status: AuthStatus;
  isGuest: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  status: "idle",
  isGuest: false,
  isAuthenticated: false,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const { user, token, status, isGuest } = useAuthStore();

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        status,
        isGuest,
        isAuthenticated: status === "authenticated",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
