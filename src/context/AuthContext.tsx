import { createContext, useContext } from "react";
import type { UserProfile } from "../types/user.types";

export type AuthContextValue = {
  user: UserProfile | null;
  token: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null
});

export const useAuthContext = () => useContext(AuthContext);

export default AuthContext;
