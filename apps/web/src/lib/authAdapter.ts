/**
 * Web auth adapter — stores the JWT access token in localStorage.
 * httpOnly cookies require a server relay; for client-only SPAs / RSC pages
 * that do not yet have a dedicated /api/auth/* route we use localStorage.
 * The adapter shape matches @jefflink/auth's AuthAdapter interface exactly.
 */

const TOKEN_KEY = "jl_access_token";
const REFRESH_KEY = "jl_refresh_token";

export const webAuthAdapter = {
  async getToken(): Promise<string | null> {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  async clearToken(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export const webRefreshAdapter = {
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_KEY);
  },

  setRefreshToken(token: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_KEY, token);
  },

  clearRefreshToken(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(REFRESH_KEY);
  },
};
