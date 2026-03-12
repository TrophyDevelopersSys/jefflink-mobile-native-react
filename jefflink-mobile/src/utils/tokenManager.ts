import { secureStorage } from "./secureStorage";

const TOKEN_KEY = "jefflink_access_token";

export const tokenManager = {
  getToken(): Promise<string | null> {
    return secureStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): Promise<void> {
    return secureStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): Promise<void> {
    return secureStorage.removeItem(TOKEN_KEY);
  },
};
