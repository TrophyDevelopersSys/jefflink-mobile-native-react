export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.com",
  apiTimeoutMs: 15000,
  devForceHome: process.env.EXPO_PUBLIC_DEV_FORCE_HOME === "1"
};
