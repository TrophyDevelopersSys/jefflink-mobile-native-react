import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { UserProfile } from "../types/user.types";

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.login, {
      email,
      password
    });
    return response.data as AuthResponse;
  },
  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.register, payload);
    return response.data as AuthResponse;
  },
  async me(): Promise<UserProfile> {
    const response = await apiClient.get(endpoints.auth.me);
    return response.data as UserProfile;
  }
};
