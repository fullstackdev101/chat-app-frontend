// app/store/authStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
}

interface AuthState {
  user: User | null;
  setUser: (user: User) => void;
  clearUser: () => void;
}

const initialState: AuthState = {
  user: null,
  setUser: () => {},
  clearUser: () => {},
};

export const useAuthStore = create<AuthState>()(
  devtools((set) => ({
    ...initialState,
    setUser: (user) => set({ user }, false, "auth/setUser"),
    clearUser: () => set(initialState, false, "auth/clearUser"), // ✅ resets everything
  }))
);
