"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { login } from "@/services/authService";


export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // ✅ error state

  const setUser = useAuthStore((state) => state.setUser);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // reset previous error

    try {
      const user = await login(username, password);

      // Store token in localStorage for Authorization header use in API calls
      localStorage.setItem("token", user.token);

      // ✅ SECURITY: Do NOT set cookie via JavaScript - the backend now
      // sets an HttpOnly, Secure cookie automatically in the login response.
      // This prevents XSS from stealing the cookie.

      setUser(user);
      if (user.role_id === 3) {
        setTimeout(() => {
          router.push("/chat");
        }, 1500);

        return;
      }

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: unknown) {
      console.error("Login failed:", err);

      let message = "Invalid credentials, please try again.";

      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { error?: string; message?: string } };
        };
        message =
          axiosErr.response?.data?.error ||
          axiosErr.response?.data?.message ||
          message;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-blue-800/40">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-md">
            ChatSphere
          </h1>
          <p className="mt-3 text-blue-200 text-sm">
            Enter your username & password to start chatting
          </p>
        </div>

        {/* ✅ Error Message */}
        {error && (
          <div className="mt-4 text-red-400 text-sm text-center bg-red-900/30 border border-red-500/40 rounded-lg py-2 px-3">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 h-5 w-5 text-blue-300" />
            <input
              type="text"
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-10 pr-3 py-3 rounded-xl bg-slate-950/60 text-white border border-blue-800/50 placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />
          </div>

          {/* Password */}
          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-5 w-5 text-blue-300" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/60 text-white border border-blue-800/50 placeholder-blue-300/70 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
            />

            {/* 👁️ Toggle Password Visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-blue-300 hover:text-sky-400"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.96 9.96 0 012.532-4.568m3.226-2.366A9.961 9.961 0 0112 5c4.477 0 8.268 2.943 9.542 7a9.965 9.965 0 01-4.005 5.297M3 3l18 18"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sky-400 hover:text-sky-300 text-sm font-medium transition-colors"
              title="Contact Administrator to reset your password."
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
