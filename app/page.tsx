"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const goToChat = () => router.push("/chat");
  const goToAdmin = () => router.push("/admin/dashboard");

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="space-y-6 p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <button
          onClick={goToChat}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Chat
        </button>
        <button
          onClick={goToAdmin}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Go to Admin Dashboard
        </button>
      </div>
    </div>
  );
}
