"use client";

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { clearAuth, getToken, isTokenExpired } from "@/lib/auth";

interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  role_name?: string;
  role_id: number;
  user_ip: string;
  office_location: string | null;
  sup_admin_selected_ip?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (partialUser: Partial<User>) => void;
  clearUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,

        setUser: (user) => set({ user }, false, "auth/setUser"),

        updateUser: (partialUser) =>
          set(
            (state) => ({
              user: state.user ? { ...state.user, ...partialUser } : null,
            }),
            false,
            "auth/updateUser"
          ),

        clearUser: () => set({ user: null }, false, "auth/clearUser"),

        logout: () => {
          console.log('🚪 Logging out...');
          clearAuth();
          set({ user: null }, false, "auth/logout");
          // Force redirect to login
          if (typeof window !== 'undefined') {
            window.location.replace('/login');
          }
        },
      }),
      {
        name: "auth-storage",
        partialize: (state) => ({ user: state.user }),
        // Validate token when rehydrating from localStorage
        onRehydrateStorage: () => (state) => {
          if (state?.user) {
            const token = getToken();
            // If no token or token is expired, clear the cached user
            if (!token || isTokenExpired(token)) {
              console.log("⚠️ Cached user data found but token is invalid, clearing...");
              clearAuth();
              state.clearUser();
            } else {
              console.log("✅ Valid token found, user data restored");
            }
          }
        },
      }
    )
  )
);
