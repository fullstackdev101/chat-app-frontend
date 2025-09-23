"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  password?: string;
  role_id: number;
  phone_number?: string;
  notes?: string;
  status: "offline" | "online" | "away" | "busy";
  is_active?: boolean;
  created_by?: string;
  interview_approved_by?: string;
  last_seen?: string;
  profile_image?: string;
}

interface AddUserModalProps {
  modalOpen: boolean;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  editingUser: User | null;
  form: Partial<User>;
  setForm: React.Dispatch<React.SetStateAction<Partial<User>>>;
  handleInputChange: (field: keyof User, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const AddUserModal = ({
  modalOpen,
  setModalOpen,
  editingUser,
  form,
  setForm,
  handleInputChange,
  handleSubmit,
}: AddUserModalProps) => {
  if (!modalOpen) return null;

  return (
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
          {/* Form Inputs */}
          <input
            type="text"
            placeholder="Name *"
            value={form.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
          <input
            type="text"
            placeholder="Username *"
            value={form.username || ""}
            onChange={(e) => handleInputChange("username", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
          <input
            type="email"
            placeholder="Email *"
            value={form.email || ""}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
          {!editingUser && (
            <input
              type="password"
              placeholder="Password *"
              value={form.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
            />
          )}
          {/* Other form fields */}
          <button
            type="submit"
            className="mt-3 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 py-2 rounded-xl text-white font-semibold hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition"
          >
            {editingUser ? "Update User" : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
