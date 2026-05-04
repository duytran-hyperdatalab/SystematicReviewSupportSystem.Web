export interface User {
  id: string;
  name: string;
  email?: string;
  username?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  accessTokenExpiresAt: string | null;
  user: User | null;
  isInitialized: boolean;
}

export interface LoginRequest {
  keyLogin: string;
  password: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export interface LoginResponseData {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  role: string;
}

export interface LoginResponse {
  isSuccess: boolean;
  message: string;
  errors: ApiError[];
  data: LoginResponseData;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: number;
}

export interface RegisterResponse {
  isSuccess: boolean;
  message: string;
  errors: ApiError[] | null;
  data: any;
}

export interface RefreshResponseData {
  userId: string;
  username: string;
  email: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  role: string;
}

export interface RefreshResponse {
  isSuccess: boolean;
  message: string;
  errors: ApiError[];
  data: RefreshResponseData;
}
