"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Plus, X } from "lucide-react";
import { getUsers } from "@/services/authService"; // ✅ import API service

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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<User>>({});

  // ✅ Fetch users from backend
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers();
        setUsers(data); // set backend data
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const recordsPerPage = 8;
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const handleInputChange = (field: keyof User, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.email || !form.password) {
      alert("Name, Username, Email, and Password are required.");
      return;
    }

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...form } : u))
      );
    } else {
      setUsers((prev) => [
        ...prev,
        {
          ...form,
          id: prev.length + 1,
          status: form.status || "active",
        } as User,
      ]);
    }
    setModalOpen(false);
    setEditingUser(null);
    setForm({});
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              is_active: user.is_active === true ? false : true,
            }
          : user
      )
    );
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm(user);
    setModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading users...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-950 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
          User Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-xl w-full sm:w-64 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={() => {
              setModalOpen(true);
              setEditingUser(null);
              setForm({});
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition"
          >
            <Plus size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
        <table className="min-w-full text-left divide-y divide-white/30">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Name
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Username
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Email
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Phone
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Role
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Status
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Is Active Status
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {currentUsers.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-white/30 transition h-12 rounded-md"
              >
                <td className="px-4 py-1 text-white">{user.name}</td>
                <td className="px-4 py-1 text-white/90">{user.username}</td>
                <td className="px-4 py-1 text-white/90">{user.email}</td>
                <td className="px-4 py-1 text-white/90">{user.phone_number}</td>
                <td className="px-4 py-1 text-white/90">{user.role_id}</td>
                <td className="px-4 py-1 text-white/90">{user.status}</td>
                <td className="px-4 py-1">
                  <span
                    onClick={() => toggleStatus(user.id)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                      user.is_active === true
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-500 hover:via-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:from-red-500 hover:via-red-600 hover:to-red-700"
                    }`}
                  >
                    {user.is_active === true ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-1 flex justify-end gap-2">
                  <button
                    className="text-white/80 hover:text-sky-300 p-1 transition"
                    onClick={() => openViewModal(user)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="text-yellow-300 hover:text-yellow-400 p-1 transition"
                    onClick={() => openEditModal(user)}
                  >
                    <Edit size={16} />
                  </button>
                  <button className="text-red-400 hover:text-red-500 p-1 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center mt-4 gap-2 text-white">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-white/20 rounded-xl hover:bg-white/30 transition"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-xl text-white transition ${
              currentPage === i + 1
                ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 shadow-md"
                : "bg-white/20"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-white/20 rounded-xl hover:bg-white/30 transition"
        >
          Next
        </button>
      </div>

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
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
                />
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
                onChange={(e) => handleInputChange("role_id", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
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
                onChange={(e) =>
                  handleInputChange("created_by", e.target.value)
                }
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
                onChange={(e) =>
                  handleInputChange("profile_image", e.target.value)
                }
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
                <strong>Status:</strong> {viewingUser.status}
              </p>
              <p>
                <strong>Phone:</strong> {viewingUser.phone_number}
              </p>
              <p>
                <strong>Notes:</strong> {viewingUser.notes}
              </p>
              <p>
                <strong>Created By:</strong> {viewingUser.created_by}
              </p>
              <p>
                <strong>Interview Approved By:</strong>{" "}
                {viewingUser.interview_approved_by}
              </p>
              <p>
                <strong>Profile Image:</strong>{" "}
                {viewingUser.profile_image || "-"}
              </p>
              <p>
                <strong>Last Seen:</strong> {viewingUser.last_seen}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
