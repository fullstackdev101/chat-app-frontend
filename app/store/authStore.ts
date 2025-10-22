"use client";

import { create } from "zustand";
import { devtools } from "zustand/middleware";

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
}

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
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
  }))
);
