// components/admin/Users.tsx
"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, Plus, Edit } from "lucide-react";
import UserForm from "./UserForm";

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

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);

  const [showForm, setShowForm] = useState<null | {
    mode: "add" | "edit";
    data?: User;
  }>(null);

  // const handleSave = (data: any) => {
  const handleSave = (data: Omit<User, "id">) => {
    if (showForm?.mode === "add") {
      setUsers((prev) => [...prev, { ...data, id: prev.length + 1 }]);
    } else if (showForm?.mode === "edit" && showForm.data) {
      setUsers((prev) =>
        prev.map((u) => (u.id === showForm.data?.id ? { ...u, ...data } : u))
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Users</h3>
        <button
          onClick={() => setShowForm({ mode: "add" })}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Table */}
      <table className="w-full text-sm border-collapse border border-slate-300 dark:border-slate-700">
        <thead className="bg-slate-200 dark:bg-slate-700">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Phone</th>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">account_status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.id}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.username}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.phone_number || "-"}</td>
              <td className="p-2 border">
                {u.role_id === 2
                  ? "Admin"
                  : u.role_id === 3
                  ? "Manager"
                  : "User"}
              </td>
              <td className="p-2 border">
                {u.account_status === "active" ? "active" : "Inactive"}
              </td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  className="text-blue-500"
                  onClick={() =>
                    setUsers((prev) =>
                      prev.map((x) =>
                        x.id === u.id
                          ? {
                              ...x,
                              account_status:
                                x.account_status === "active"
                                  ? "inactive"
                                  : "active",
                            }
                          : x
                      )
                    )
                  }
                >
                  {u.account_status === "active" ? (
                    <ToggleRight />
                  ) : (
                    <ToggleLeft />
                  )}
                </button>
                <button
                  className="text-green-500"
                  onClick={() => setShowForm({ mode: "edit", data: u })}
                >
                  <Edit />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {showForm && (
        <UserForm
          mode={showForm.mode}
          initialData={showForm.data}
          onClose={() => setShowForm(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
