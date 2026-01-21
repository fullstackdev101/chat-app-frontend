// app/ProtectedLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated, clearAuth, getToken } from "@/lib/auth";
import { useAuthStore } from "./store/authStore";

interface Props {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const { user, clearUser } = useAuthStore();

  useEffect(() => {
    // Allow access to login page without authentication
    if (pathname === "/login") {
      setIsChecking(false);
      return;
    }

    // First, check if token exists and is valid
    const token = getToken();
    const authenticated = isAuthenticated();

    console.log("🔐 Auth Check:", {
      pathname,
      hasToken: !!token,
      authenticated,
      hasUser: !!user
    });

    // If no valid token, clear everything and redirect
    if (!authenticated) {
      console.log("❌ Not authenticated, clearing data and redirecting to login");
      clearAuth();
      clearUser();
      router.push("/login");
      return;
    }

    // Token is valid, allow access
    console.log("✅ Authenticated, allowing access");
    setIsChecking(false);
  }, [pathname, router, clearUser, user]);

  // Show loading while checking authentication (prevents flash of protected content)
  if (isChecking && pathname !== "/login") {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900">
        <div className="text-white text-lg">Verifying authentication...</div>
      </div>
    );
  }

  return <>{children}</>;
}
