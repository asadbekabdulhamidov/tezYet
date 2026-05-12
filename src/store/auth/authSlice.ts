import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Role = "client" | "driver" | "admin";

type AuthState = {
  isAuth: boolean;
  role: Role | null;
  accessToken: string | null;
  refreshToken: string | null;
};

const initialState: AuthState = {
  isAuth: false,
  role: null,
  accessToken: null,
  refreshToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(
      state,
      action: PayloadAction<{ access: string; refresh: string; role: Role }>,
    ) {
      state.isAuth = true;
      state.accessToken = action.payload.access;
      state.refreshToken = action.payload.refresh;
      state.role = action.payload.role;
    },
    clearAuth(state) {
      state.isAuth = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.role = null;
    },
  },
});

export const { setTokens, clearAuth } = authSlice.actions;
export const authReducer = authSlice.reducer;
