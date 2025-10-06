"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { X } from "lucide-react";
import { User, defaultUser } from "../../types/user"; // <-- defaultUser defined in types
import { createUser, updateUser } from "../../../services/authService";
import { USER_ROLES } from "../../../lib/constants";

interface UserModalsProps {
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  viewModalOpen: boolean;
  setViewModalOpen: Dispatch<SetStateAction<boolean>>;
  editingUser: User | null;
  setEditingUser: Dispatch<SetStateAction<User | null>>;
  viewingUser: User | null;
}

export default function UserModals({
  modalOpen,
  setModalOpen,
  viewModalOpen,
  setViewModalOpen,
  editingUser,
  setEditingUser,
  viewingUser,
}: UserModalsProps) {
  // ✅ Always have all fields
  const [form, setForm] = useState<User>(defaultUser);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  // Prefill form if editing
  useEffect(() => {
    if (editingUser) {
      setForm(editingUser);
    } else {
      setForm(defaultUser);
    }
  }, [editingUser, modalOpen]);

  const handleInputChange = <K extends keyof User>(
    field: K,
    value: User[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value } as User));
  };

  const validateForm = () => {
    if (!form.username || form.username.trim().length < 3) {
      return "Username must be at least 3 characters.";
    }
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return "Please enter a valid email address.";
    }
    if (!editingUser) {
      if (!form.password || form.password.length < 6) {
        return "Password must be at least 6 characters.";
      }
      if (form.password !== confirmPassword) {
        return "Passwords do not match.";
      }
    }
    if (form.phone_number && !/^\+?[0-9]{7,15}$/.test(form.phone_number)) {
      return "Invalid phone number format.";
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");

    // 🔧 Clean data to match API types
    const cleanedForm = {
      ...form,
      phone_number: form.phone_number ?? undefined,
      notes: form.notes ?? undefined,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, cleanedForm);
      } else {
        console.log("Creating user with data:", cleanedForm);
        await createUser(cleanedForm);
      }
      setModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {/* Add/Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-lg relative text-white">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? "Edit User" : "Add New User"}
            </h2>
            <form
              className="grid grid-cols-1 gap-3 text-sm"
              onSubmit={handleSubmit}
            >
              {error && (
                <p className="text-red-400 text-sm font-semibold">{error}</p>
              )}

              <input
                type="text"
                placeholder="Name *"
                value={form.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />

              <input
                type="text"
                placeholder="Username *"
                value={form.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />

              <input
                type="email"
                placeholder="Email *"
                value={form.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />

              {!editingUser && (
                <>
                  <input
                    type="password"
                    placeholder="Password *"
                    value={form.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password *"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
                  />
                </>
              )}

              <input
                type="text"
                placeholder="Phone Number"
                value={form.phone_number || ""}
                onChange={(e) =>
                  handleInputChange("phone_number", e.target.value)
                }
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />

              <textarea
                placeholder="Notes"
                value={form.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />

              <select
                value={form.role_id}
                onChange={(e) =>
                  handleInputChange("role_id", Number(e.target.value))
                }
                className="p-2 rounded-md bg-black/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                {USER_ROLES.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role}
                  </option>
                ))}
              </select>

              <select
                value={form.account_status}
                onChange={(e) =>
                  handleInputChange(
                    "account_status",
                    e.target.value as "active" | "inactive" | "blocked"
                  )
                }
                className="p-2 rounded-md bg-black/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="blocked">Blocked</option> {/* 🔧 added */}
              </select>

              <select
                value={form.presence}
                onChange={(e) =>
                  handleInputChange(
                    "presence",
                    e.target.value as "online" | "offline" | "busy" | "away" // 🔧 cast
                  )
                }
                className="p-2 rounded-md bg-black/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="busy">Busy</option>
                <option value="away">Away</option>
              </select>

              <button
                type="submit"
                className="mt-3 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 py-2 rounded-xl text-white font-semibold hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition"
              >
                {editingUser ? "Update User" : "Add User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewModalOpen && viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md relative text-white">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <p>
                <strong>Name:</strong> {viewingUser.name}
              </p>
              <p>
                <strong>Username:</strong> {viewingUser.username}
              </p>
              <p>
                <strong>Email:</strong> {viewingUser.email}
              </p>
              <p>
                <strong>Role:</strong> {viewingUser.role_id}
              </p>
              <p>
                <strong>Account status:</strong> {viewingUser.account_status}
              </p>
              <p>
                <strong>Phone:</strong> {viewingUser.phone_number}
              </p>
              <p>
                <strong>Notes:</strong> {viewingUser.notes}
              </p>
              <p>
                <strong>Last Seen:</strong> {viewingUser.last_seen}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
