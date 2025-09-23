"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const goToChat = () => router.push("/chat");
  const goToAdmin = () => router.push("/admin/dashboard");

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-[#0f172a] to-[#1e3a8a]">
      <div
        className="w-full max-w-md p-10 rounded-2xl shadow-2xl 
                  bg-gray-900/70 backdrop-blur-lg border border-white/10 text-center space-y-6"
      >
        {/* Title */}
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Welcome
        </h1>
        <p className="text-gray-400 text-sm">
          Please choose where you’d like to continue
        </p>

        {/* Buttons */}
        <div className="space-y-4">
          <button
            onClick={goToChat}
            className="w-full px-6 py-3 text-base font-medium rounded-lg 
                   bg-indigo-600 text-white shadow-sm 
                   hover:bg-indigo-700 hover:shadow-md 
                   transition-all duration-200"
          >
            Go to Chat
          </button>

          <button
            onClick={goToAdmin}
            className="w-full px-6 py-3 text-base font-medium rounded-lg 
                   bg-emerald-600 text-white shadow-sm 
                   hover:bg-emerald-700 hover:shadow-md 
                   transition-all duration-200"
          >
            Go to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
