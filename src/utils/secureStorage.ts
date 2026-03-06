/**
 * secureStorage
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform-aware key/value storage.
 *
 * • Native (iOS / Android) → expo-secure-store  (encrypted hardware-backed)
 * • Web                    → localStorage       (expo-secure-store native
 *                                                module is unavailable on web)
 *
 * Drop-in replacement for direct SecureStore calls. All three callsites
 * (ThemeContext, tokenManager, onboardingManager) should use this helper so
 * the platform guard lives in exactly one place.
 */
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const isWeb = Platform.OS === "web";

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    if (isWeb) return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },

  async setItem(key: string, value: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },

  async removeItem(key: string): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};
