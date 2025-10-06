// components/admin/UserForm.tsx
"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone_number?: string;
  notes?: string;
  role_id: number;
  account_status: "active" | "inactive";
}

interface UserFormProps {
  mode: "add" | "edit";
  initialData?: User;
  onClose: () => void;
  onSave: (data: Omit<User, "id"> & { password: string }) => void;
}

// Local form state (always safe strings)
interface FormState {
  name: string;
  username: string;
  email: string;
  password: string;
  role_id: number;
  phone_number: string;
  notes: string;
  account_status: "active" | "inactive";
}

export default function UserForm({
  mode,
  initialData,
  onClose,
  onSave,
}: UserFormProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    username: "",
    email: "",
    password: "",
    role_id: 1,
    phone_number: "",
    notes: "",
    account_status: "inactive",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({
        name: initialData.name,
        username: initialData.username,
        email: initialData.email,
        password: "", // blank password in edit
        role_id: initialData.role_id,
        phone_number: initialData.phone_number ?? "",
        notes: initialData.notes ?? "",
        account_status: initialData.account_status ?? "inactive",
      });
    }
  }, [mode, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "active" : "inactive") : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Data matches Omit<User, "id"> + password
    const payload: Omit<User, "id"> & { password: string } = {
      name: form.name,
      username: form.username,
      email: form.email,
      password: form.password,
      role_id: form.role_id,
      phone_number: form.phone_number,
      notes: form.notes,
      account_status: form.account_status,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "add" ? "Add User" : "Edit User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            />
          </div>

          {mode === "add" && (
            <div>
              <label className="block text-sm mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Phone Number</label>
            <input
              type="text"
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Role</label>
            <select
              name="role_id"
              value={form.role_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700"
            >
              <option value={1}>User</option>
              <option value={2}>Admin</option>
              <option value={3}>Manager</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="account_status"
              checked={form.account_status === "active"}
              onChange={handleChange}
            />
            <label>Active</label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              {mode === "add" ? "Save" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
