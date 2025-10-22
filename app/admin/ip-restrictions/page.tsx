"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import {
  getIpAddresses,
  createIp,
  deleteIp,
  updateIp,
} from "../../../services/ipsService";

interface ipRestrictions {
  id: number;
  ip: string;
  office_location: string;
  notes: string;
  status: string;
}

export default function IpRestrictionsPage() {
  const [ips, setIps] = useState<ipRestrictions[]>([]);
  const [newIp, setNewIp] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    ip: "",
    office_location: "",
    notes: "",
    status: "blocked",
  });

  const startEdit = (entry: ipRestrictions) => {
    setEditingId(entry.id);
    setEditForm({
      ip: entry.ip,
      office_location: entry.office_location,
      notes: entry.notes,
      status: entry.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ ip: "", office_location: "", notes: "", status: "blocked" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await updateIp(editingId, editForm);
      setIps((prev) =>
        prev.map((ip) => (ip.id === editingId ? { ...ip, ...editForm } : ip))
      );
      cancelEdit();
    } catch (err) {
      console.error("Failed to update IP:", err);
    }
  };

  const addIp = async () => {
    if (!newIp) return;

    const newEntry = {
      ip: newIp.trim(),
      office_location: officeLocation || "Unknown",
      notes: notes || "No notes provided",
      status: "blocked",
    };

    try {
      setError(null); // clear old errors

      const response = await createIp(newEntry);
      // console.log(response);
      // console.log(response.error);
      if (response.error) {
        setError(response.error);
        return false;
      }
      console.log(ips);
      console.log(response);
      // Transform response to state object

      setIps((prev) => [...prev, response]);
      setNewIp("");
      setOfficeLocation("");
      setNotes("");
    } catch (err) {
      console.error("Failed to create IP:", err);
      setError("🚫 Failed to save IP." + err);
    }
  };

  useEffect(() => {
    async function fetchpAddresses() {
      try {
        const data = await getIpAddresses();
        setIps(data);
      } catch (err) {
        console.error("Failed to fetch IPs:", err);
      }
    }
    fetchpAddresses();
  }, []);

  const removeIp = async (id: number) => {
    try {
      await deleteIp(id);
      setIps(ips.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Failed to delete IP:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          IP Restrictions
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 text-red-700 border border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700">
          {error}
        </div>
      )}

      {/* Add new IP form */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Add IP
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter IP address"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Office Location"
            value={officeLocation}
            onChange={(e) => setOfficeLocation(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            onClick={addIp}
            className="flex items-center justify-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-white font-medium shadow hover:opacity-90 transition"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Restricted IPs list */}
      <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
          IPs
        </h2>
        {ips.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No IPs restricted yet.
          </p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 px-4">IP Address</th>
                <th className="py-2 px-4">Office Location</th>
                <th className="py-2 px-4">Notes</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ips.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {editingId === entry.id ? (
                    <>
                      {/* Editable row */}
                      <td className="py-2 px-4">
                        {/* <input
                          key={`ip-${entry.id}`}
                          type="text"
                          value={editForm.ip}
                          onChange={(e) =>
                            setEditForm({ ...editForm, ip: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:text-gray-100"
                        /> */}
                        {entry.ip}
                      </td>
                      <td className="py-2 px-4">
                        <input
                          key={`loc-${entry.id}`}
                          type="text"
                          value={editForm.office_location}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              office_location: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:text-gray-100"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <input
                          key={`notes-${entry.id}`}
                          type="text"
                          value={editForm.notes}
                          onChange={(e) =>
                            setEditForm({ ...editForm, notes: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:text-gray-100"
                        />
                      </td>
                      <td className="py-2 px-4">
                        <select
                          key={`status-${entry.id}`}
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm({ ...editForm, status: e.target.value })
                          }
                          className="w-full px-2 py-1 rounded border dark:bg-gray-800 dark:text-gray-100"
                        >
                          <option value="allowed">Allowed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </td>
                      <td className="py-2 px-4 text-right space-x-2">
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 rounded bg-green-500 text-white hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Static row */}
                      <td className="py-2 px-4 text-gray-900 dark:text-gray-100">
                        {entry.ip}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {entry.office_location}
                      </td>
                      <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                        {entry.notes}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full
                ${
                  entry.status === "allowed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (entry.id !== 1) removeIp(entry.id);
                          }}
                          disabled={entry.id === 1}
                          title={
                            entry.id === 1
                              ? "Global IP cannot be removed/deleted"
                              : "Remove this IP"
                          }
                          className={`p-2 rounded-lg transition ${
                            entry.id === 1
                              ? "bg-red-500/10 text-red-400 opacity-60 cursor-not-allowed"
                              : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
                          }`}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
