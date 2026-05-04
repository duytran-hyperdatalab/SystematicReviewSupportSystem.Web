import axios from "axios";
import api from "../config/axios";
import type { LoginRequest, LoginResponse, RefreshResponse, RegisterRequest, RegisterResponse } from "../types/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", data);
    return response.data;
  },
  refresh: async (): Promise<RefreshResponse> => {
    // Use raw axios (not the `api` instance) to avoid interceptor loops
    const response = await axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, null,
      { withCredentials: true },
    );
    return response.data;
  },
};