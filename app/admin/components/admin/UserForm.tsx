// components/admin/UserForm.tsx
"use client";

import { useState, useEffect } from "react";

interface UserFormProps {
  mode: "add" | "edit";
  initialData?: any;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function UserForm({
  mode,
  initialData,
  onClose,
  onSave,
}: UserFormProps) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    role_id: 1,
    phone_number: "",
    notes: "",
    account_status: "",
  });

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setForm({ ...initialData, password: "" }); // password blank in edit
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
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
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
              checked={form.account_status == "active"}
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
