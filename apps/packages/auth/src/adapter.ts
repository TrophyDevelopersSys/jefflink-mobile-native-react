/**
 * Platform-agnostic token storage adapter interface.
 * Mobile: implemented with expo-secure-store
 * Web: implemented with httpOnly cookies via Next.js API routes
 */
export interface AuthAdapter {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clearToken(): Promise<void>;
}
