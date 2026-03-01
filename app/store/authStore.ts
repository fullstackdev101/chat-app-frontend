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
          // Step 1: Clear Zustand state immediately
          set({ user: null }, false, "auth/logout");

          // Step 2: Clear all client-side auth data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('auth-storage');
            sessionStorage.clear();

            // ✅ SECURITY: Call backend to clear the HttpOnly cookie
            // document.cookie cannot clear HttpOnly cookies (by design — that's the security feature)
            // The backend /api/logout sets: token=; Max-Age=0; HttpOnly — which clears it
            fetch(
              (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/api/logout',
              { method: 'POST', credentials: 'include' }
            ).finally(() => {
              // Step 3: Redirect to login regardless of whether logout API succeeded
              window.location.replace('/login');
            });
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
