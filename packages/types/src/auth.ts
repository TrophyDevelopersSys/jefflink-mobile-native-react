import type { UserRole } from "./user";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
  isDealer?: boolean;
}

export interface ResetPasswordInput {
  userId: string;
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResult {
  message: string;
  userId?: string;
  token?: string;
  resetUrl?: string;
  expiresInSeconds?: number;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken?: string;
  user: AuthenticatedUser;
}

export interface RefreshTokensResponse {
  accessToken: string;
  refreshToken?: string;
}

export type CurrentUserResponse = AuthenticatedUser;