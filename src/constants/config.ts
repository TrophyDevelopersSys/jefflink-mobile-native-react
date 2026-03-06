export const config = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api.example.com",
  apiTimeoutMs: 30000, // 30s — accounts for Render free-tier cold starts (~50s max)
  devForceHome: process.env.EXPO_PUBLIC_DEV_FORCE_HOME === "1"
};
