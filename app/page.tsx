"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getAllowedIpAddresses } from "@/services/ipsService";
import { useAuthStore } from "./store/authStore";

type IpAddress = {
  id: number;
  ip: string;
  office_location: string | null;
  notes?: string;
  status: string;
};

export default function Home() {
  const router = useRouter();

  // ✅ Zustand
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locations, setLocations] = useState<IpAddress[]>([]);
  const [userIpLocation] = useState<string>(user?.user_ip ?? "");

  const roleId = user?.role_id ?? 1;

  const goToChat = () => router.push("/chat");
  const goToAdmin = () => router.push("/admin/dashboard");

  // ✅ Fetch allowed IPs & initialize selected location
  useEffect(() => {
    let mounted = true;

    const fetchLocations = async () => {
      try {
        const data = await getAllowedIpAddresses();
        if (!mounted) return;
        setLocations(data);

        // ✅ If user already has sup_admin_selected_ip, preselect it
        if (user?.sup_admin_selected_ip) {
          setSelectedLocation(user.sup_admin_selected_ip);
        }
        // ✅ Else auto-select for non-admins
        else if (roleId !== 1) {
          setSelectedLocation(userIpLocation);
          updateUser({ sup_admin_selected_ip: userIpLocation });
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
    return () => {
      mounted = false;
    };
  }, [roleId, updateUser, userIpLocation, user?.sup_admin_selected_ip]);

  // ✅ Handle dropdown selection
  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    setSelectedLocation(selected);
    updateUser({ sup_admin_selected_ip: selected });
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-900">
      <div className="w-full max-w-md p-10 rounded-3xl shadow-2xl bg-white/5 backdrop-blur-lg border border-white/10 text-center space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-white tracking-tight">
            🌐 Choose a Site Location
          </h1>
          <p className="text-gray-400 text-sm">
            {roleId === 1
              ? "Select your nearest data center to continue"
              : "Your IP has been automatically detected"}
          </p>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <select
            value={selectedLocation ?? ""}
            onChange={handleLocationChange}
            disabled={roleId !== 1}
            className={`w-full appearance-none rounded-lg px-4 py-3 text-gray-200 border border-white/10 focus:outline-none transition-all duration-200
              ${
                roleId === 1
                  ? "bg-gray-800/60 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  : "bg-gray-700/40 cursor-not-allowed opacity-70"
              }`}
          >
            {roleId === 1 && <option value="">Select a location</option>}

            {roleId === 1 ? (
              locations.map((loc) => (
                <option key={loc.id} value={loc.ip}>
                  {loc.office_location ?? "Unknown Location"} — {loc.ip}
                </option>
              ))
            ) : (
              <option value={userIpLocation}>{userIpLocation}</option>
            )}
          </select>

          {/* Icon */}
          <span className="absolute right-4 top-3.5 text-gray-400 pointer-events-none">
            ▼
          </span>
        </div>

        {/* Buttons */}
        <div className="space-y-4 pt-2">
          <button
            onClick={goToChat}
            disabled={roleId === 1 && !selectedLocation}
            className={`w-full px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 shadow-md 
              ${
                roleId !== 1 || selectedLocation
                  ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
          >
            Go to Chat
          </button>

          <button
            onClick={goToAdmin}
            disabled={roleId === 1 && !selectedLocation}
            className={`w-full px-6 py-3 text-base font-medium rounded-lg transition-all duration-300 shadow-md 
              ${
                roleId !== 1 || selectedLocation
                  ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg text-white"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
          >
            Go to Admin Dashboard
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 pt-2">
          Selected IP:{" "}
          <span className="text-indigo-400">{selectedLocation || "None"}</span>
        </p>

        {/* Debug Info */}
        <p className="text-[10px] text-gray-600 italic">
          Role ID: {roleId} | User: {user?.name ?? "Guest"} |{" "}
          <span className="text-indigo-400">
            {user?.sup_admin_selected_ip ?? "No IP Selected"}
          </span>
        </p>
      </div>
    </div>
  );
}
