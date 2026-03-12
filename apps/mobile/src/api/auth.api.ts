import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { UserProfile } from "../types/user.types";

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// Backend wraps every response: { success: true, data: { ... } }
// Backend auth endpoints return: { accessToken, refreshToken, user: { id, email, name, role } }
function mapAuthResponse(raw: unknown): AuthResponse {
  const body = raw as { data: { accessToken: string; user: { id: string; email: string; name: string; role: string; avatarUrl?: string } } };
  const { accessToken, user } = body.data;
  return {
    token: accessToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.name,
      role: user.role as UserProfile["role"],
      status: "active",
      avatarUrl: user.avatarUrl,
    },
  };
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.login, { email, password });
    return mapAuthResponse(response.data);
  },

  async register(payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
  }): Promise<AuthResponse> {
    const response = await apiClient.post(endpoints.auth.register, {
      name: payload.fullName,
      email: payload.email,
      password: payload.password,
    });
    return mapAuthResponse(response.data);
  },

  async me(): Promise<UserProfile> {
    const response = await apiClient.get(endpoints.auth.me);
    const body = response.data as { data: { id: string; email: string; name: string; role: string; avatarUrl?: string } };
    const u = body.data;
    return {
      id: u.id,
      email: u.email,
      fullName: u.name,
      role: u.role as UserProfile["role"],
      status: "active",
      avatarUrl: u.avatarUrl,
    };
  },
};
