import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./auth/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer, // MUHIM: nomi "auth" bo‘lsin
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
