import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types/auth";

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  accessTokenExpiresAt: null,
  user: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (
      state,
      action: PayloadAction<{ accessToken: string; accessTokenExpiresAt: string; user: User }>
    ) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.accessTokenExpiresAt = null;
      state.user = null;
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateAccessToken: (
      state,
      action: PayloadAction<{ accessToken: string; accessTokenExpiresAt: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.accessTokenExpiresAt = action.payload.accessTokenExpiresAt;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
  },
});

export const { login, logout, updateUser, updateAccessToken, setInitialized } =
  authSlice.actions;
export default authSlice.reducer;
