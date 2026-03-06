import axios from "axios";
import { config } from "../constants/config";
import { tokenManager } from "../utils/tokenManager";

export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: config.apiTimeoutMs
});

apiClient.interceptors.request.use(async (request) => {
  const token = await tokenManager.getToken();
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      await tokenManager.clearToken();
      // Lazy require avoids Hermes module init-order issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { useAuthStore } = require("../store/auth.store") as typeof import("../store/auth.store");
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);
