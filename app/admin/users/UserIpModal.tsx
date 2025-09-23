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
};

export default function UserIpModal({
  ipModalOpen,
  setIpModalOpen,
  editingUser,
}: UserIpModalProps) {
  const [ips, setIps] = useState<IpAddress[]>([]);
  const [selectedIps, setSelectedIps] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available IPs
  useEffect(() => {
    if (ipModalOpen) {
      getAllowedIpAddresses().then((data) => {
        setIps(data || []);
      });
      setSelectedIps([]); // reset when modal opens
    }
  }, [ipModalOpen]);

  // Toggle selection
  const toggleIpSelection = (id: number) => {
    setSelectedIps((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || selectedIps.length === 0) {
      alert("Please select at least one IP address");
      return;
    }

    setLoading(true);
    try {
      const res = await saveUserIpAddresses(editingUser.id, selectedIps);
      if (res.success) {
        alert("IPs assigned successfully ✅");
        setIpModalOpen(false);
      } else {
        alert("Error: " + (res.error || "Unknown issue"));
      }
    } catch (err) {
      console.error("Failed to assign IPs:", err);
      alert("Something went wrong while saving IPs");
    } finally {
      setLoading(false);
    }
  };

  if (!ipModalOpen || !editingUser) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-4">
          Manage Allowed IPs for{" "}
          <span className="text-blue-600">{editingUser.name}</span>
        </h2>

        {/* IP List */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-3 mb-4">
          {ips.length === 0 ? (
            <p className="text-gray-500">No IP addresses available</p>
          ) : (
            <ul className="space-y-2">
              {ips.map((ip) => (
                <li key={ip.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`ip-${ip.id}`}
                    checked={selectedIps.includes(ip.id)}
                    onChange={() => toggleIpSelection(ip.id)}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`ip-${ip.id}`}
                    className="flex-1 text-sm cursor-pointer"
                  >
                    <span className="font-medium">{ip.ip}</span>{" "}
                    <span className="text-gray-500 text-xs">
                      {ip.office_location || "N/A"} ({ip.status})
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actions */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Selected IPs"}
          </button>
          <button
            type="button"
            onClick={() => setIpModalOpen(false)}
            className="w-full border px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
