import { secureStorage } from "./secureStorage";

const TOKEN_KEY = "jefflink_access_token";
const REFRESH_TOKEN_KEY = "jefflink_refresh_token";

export const tokenManager = {
  getToken(): Promise<string | null> {
    return secureStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string): Promise<void> {
    return secureStorage.setItem(TOKEN_KEY, token);
  },
  clearToken(): Promise<void> {
    return Promise.all([
      secureStorage.removeItem(TOKEN_KEY),
      secureStorage.removeItem(REFRESH_TOKEN_KEY),
    ]).then(() => undefined);
  },
  getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string): Promise<void> {
    return secureStorage.setItem(REFRESH_TOKEN_KEY, token);
  },
  clearRefreshToken(): Promise<void> {
    return secureStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};
