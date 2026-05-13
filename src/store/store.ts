import { configureStore } from "@reduxjs/toolkit";
import { authReducer, authInitialState } from "./auth/authSlice";
import { loadAuthFromStorage, saveAuthToStorage } from "./auth/persist";

const persistedAuth = loadAuthFromStorage();

export const store = configureStore({
  reducer: {
    auth: authReducer, // MUHIM: nomi "auth" bo‘lsin
  },
  ...(persistedAuth
    ? {
        preloadedState: {
          auth: { ...authInitialState, ...persistedAuth },
        },
      }
    : {}),
});

let prevAuth = store.getState().auth;
store.subscribe(() => {
  const next = store.getState().auth;
  if (
    next.accessToken !== prevAuth.accessToken ||
    next.refreshToken !== prevAuth.refreshToken ||
    next.role !== prevAuth.role ||
    next.isAuth !== prevAuth.isAuth
  ) {
    prevAuth = next;
    saveAuthToStorage(next);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
