"use client";

import { useEffect, useState } from "react";
import {
  getAllowedIpAddresses,
  saveUserIpAddresses,
} from "@/services/ipsService";

type User = {
  id: number;
  name: string;
};

type IpAddress = {
  id: number;
  ip: string;
  office_location: string | null;
  notes?: string;
  status: string;
};

type UserIpModalProps = {
  ipModalOpen: boolean;
  setIpModalOpen: (open: boolean) => void;
  editingUser: User | null;
  onIpAssigned?: () => Promise<void> | void; // 👈 optional callback
};

export default function UserIpModal({
  ipModalOpen,
  setIpModalOpen,
  editingUser,
  onIpAssigned,
}: UserIpModalProps) {
  const [ips, setIps] = useState<IpAddress[]>([]);
  const [selectedIp, setSelectedIp] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch available IPs
  useEffect(() => {
    if (ipModalOpen) {
      getAllowedIpAddresses().then((data) => {
        setIps(data || []);
      });
      setSelectedIp(null); // reset selection when modal opens
    }
  }, [ipModalOpen]);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !selectedIp) {
      alert("Please select an IP address");
      return;
    }

    setLoading(true);
    try {
      const res = await saveUserIpAddresses(editingUser.id, [selectedIp]); // single IP wrapped in array
      if (res.success) {
        alert("IP assigned successfully ✅");
        // 🔥 trigger parent refresh if provided
        if (onIpAssigned) {
          await onIpAssigned();
        }
        setIpModalOpen(false);
      } else {
        alert("Error: " + (res.error || "Unknown issue"));
      }
    } catch (err) {
      console.error("Failed to assign IP:", err);
      alert("Something went wrong while saving IP");
    } finally {
      setLoading(false);
    }
  };

  if (!ipModalOpen || !editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-6 w-[480px] max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4 text-center">
          Assign IP to{" "}
          <span className="text-indigo-400">{editingUser.name}</span>
        </h2>

        {/* Dropdown */}
        <div className="flex-1 mb-6">
          {ips.length === 0 ? (
            <p className="text-gray-400 text-center mt-4">
              No IP addresses available
            </p>
          ) : (
            <div className="relative mt-2">
              <label
                htmlFor="ip-select"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Select IP Address
              </label>
              <p className="text-xs text-amber-400 mb-2">
                ⚠️ Once an IP is assigned, it cannot be changed later.
              </p>
              <select
                id="ip-select"
                value={selectedIp ?? ""}
                onChange={(e) => setSelectedIp(Number(e.target.value))}
                className="w-full appearance-none bg-gray-800/70 border border-gray-600 text-gray-100 
                           rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           transition-all duration-200 hover:border-indigo-400"
              >
                <option value="">Choose an IP address</option>
                {ips.map((ip) => (
                  <option key={ip.id} value={ip.id}>
                    {ip.office_location || "N/A"} — {ip.ip} ({ip.status})
                  </option>
                ))}
              </select>

              {/* Dropdown Icon */}
              <span className="absolute right-3 top-[45px] text-gray-400 pointer-events-none">
                ▼
              </span>

              {/* Selected Info */}
              {selectedIp && (
                <p className="text-xs text-gray-400 mt-2">
                  Selected:{" "}
                  <span className="text-indigo-400 font-medium">
                    {ips.find((ip) => ip.id === selectedIp)?.ip}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg 
                       hover:bg-indigo-700 transition-all duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Selected IP"}
          </button>
          <button
            type="button"
            onClick={() => setIpModalOpen(false)}
            className="w-full border border-gray-600 text-gray-300 px-4 py-2 rounded-lg 
                       hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
