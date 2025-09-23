"use client";
import { X } from "lucide-react";
import { User } from "./UsersPage";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: Partial<User>;
  handleInputChange: (field: keyof User, value: any) => void;
  editingUser: User | null;
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  form,
  handleInputChange,
  editingUser,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-lg relative text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-400"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {editingUser ? "Edit User" : "Add New User"}
        </h2>
        <form className="grid grid-cols-1 gap-3 text-sm" onSubmit={onSubmit}>
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
          <input
            type="text"
            placeholder="Phone Number"
            value={form.phone_number || ""}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
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
            onChange={(e) => handleInputChange("role_id", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
          >
            <option value="">Select Role</option>
            <option value="1">Admin</option>
            <option value="2">Editor</option>
            <option value="3">Viewer</option>
          </select>
          <select
            value={form.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <input
            type="text"
            placeholder="Created By"
            value={form.created_by || ""}
            onChange={(e) => handleInputChange("created_by", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
          <input
            type="text"
            placeholder="Interview Approved By"
            value={form.interview_approved_by || ""}
            onChange={(e) =>
              handleInputChange("interview_approved_by", e.target.value)
            }
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
          <input
            type="text"
            placeholder="Profile Image URL"
            value={form.profile_image || ""}
            onChange={(e) => handleInputChange("profile_image", e.target.value)}
            className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
          />
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
}
