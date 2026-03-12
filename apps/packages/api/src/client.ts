import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

export type TokenGetter = () => Promise<string | null>;
export type SessionClearer = () => void;

export interface ApiClientOptions {
  getToken: TokenGetter;
  onUnauthorized?: SessionClearer;
}

/**
 * Creates a configured Axios instance for the JeffLink API.
 * Platform-agnostic: token retrieval and session clearing are
 * provided by the caller (mobile uses SecureStore, web uses cookies).
 */
export function createApiClient(options: ApiClientOptions): AxiosInstance {
  const baseURL =
    (typeof process !== "undefined" &&
      (process.env["EXPO_PUBLIC_API_BASE_URL"] ??
       process.env["NEXT_PUBLIC_API_BASE_URL"])) ||
    "https://jefflink.onrender.com/api/v1";

  const client = axios.create({
    baseURL,
    timeout: 30_000, // accounts for Render free-tier cold starts
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await options.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }
  );

  client.interceptors.response.use(
    (response: import("axios").AxiosResponse) => response,
    async (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401 && options.onUnauthorized) {
        options.onUnauthorized();
      }
      return Promise.reject(error);
    }
  );

  return client;
}
