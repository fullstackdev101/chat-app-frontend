"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Plus, X, ShieldOff } from "lucide-react";
import { getUsers } from "@/services/authService"; // ✅ import API service
import { User } from "../../types/user";
import UserModals from "./UserModals";
import UserIpModal from "./UserIpModal";
import { socket } from "../../../lib/socket"; // ✅ import socket instance

export const defaultUser: User = {
  id: 0,
  name: "",
  username: "",
  email: "",
  password: "",
  role_id: 1,
  phone_number: null,
  notes: null,
  created_by: null,
  presence: "offline",
  account_status: "active",
  last_seen: new Date().toISOString(),
  profile_image: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [ipModalOpen, setIpModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<User>(defaultUser);

  // ✅ Fetch users from backend
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getUsers();
        console.log("----------------- Fetch Users -------------------");
        console.log(data);
        setUsers(data); // set backend data
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    socket.on("user:updated", (updatedUser: User) => {
      const jsonString = JSON.stringify(updatedUser);

      // Function to update single record
      // React style update function
      function updateUserById(users: User[], id: number, userData: User) {
        return users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        );
      }

      // Example usage in setState
      setUsers((prev) => updateUserById(prev, updatedUser.id, updatedUser));
    });

    socket.on("user:created", (newUser: User) => {
      const jsonString = JSON.stringify(newUser);

      // 🔄 Transform to desired structure
      const transformed = JSON.parse(jsonString).map((u: any) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        password: u.password,
        role_id: u.role_id,
        phone_number: u.phone_number,
        notes: u.notes,
        created_by: u.created_by,
        presence: u.presence,
        last_seen: u.last_seen,
        account_status: u.account_status,
        profile_image: u.profile_image,
        created_at: u.created_at,
        updated_at: u.updated_at,
      }));

      setUsers((prev) => [...prev, transformed[0]]);
    });

    return () => {
      socket.off("user:created");
      socket.off("user:updated");
    };
  }, []);

  const recordsPerPage = 8;

  const userList = Object.values(users).flat();

  const filteredUsers = userList.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // const filteredUsers = users.filter(
  //   (u) =>
  //     (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
  //     (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
  //     (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  // );
  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  console.log("----- Current Users -----");
  console.log(currentUsers);

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
          account_status: form.account_status || "active",
        } as User,
      ]);
    }
    setModalOpen(false);
    setEditingUser(null);
    // setForm({});
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              account_status:
                user.account_status === "active" ? "inactive" : "active",
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

  const openIpUserModal = (user: User) => {
    console.log("------------ LINE 182 -------------");

    setEditingUser(user);
    setForm(user);
    setIpModalOpen(true);
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
              // setForm({});
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
                Account Status
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Presence
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
                <td className="px-4 py-1 text-white/90">{user.role_name}</td>
                <td className="px-4 py-1 text-white/90">
                  {/*  onClick={() => toggleStatus(user.id)} */}
                  <span>{user.account_status}</span>
                </td>
                <td className="px-4 py-1 text-white/90">
                  {/* <span
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                      user.presence === "online"
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-500 hover:via-green-600 hover:to-green-700"
                        : user.presence === "offline"
                        ? "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white hover:from-gray-500 hover:via-gray-600 hover:to-gray-700"
                        : user.presence === "away"
                        ? "bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 text-white hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600"
                        : user.presence === "busy"
                        ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:from-red-500 hover:via-red-600 hover:to-red-700"
                        : ""
                    }`}
                  > */}
                  <span>{user.presence}</span>
                  {/* <span
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                      user.presence === "online"
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-500 hover:via-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white hover:from-gray-500 hover:via-gray-600 hover:to-gray-700"
                    }`}
                  >
                    {user.presence}
                  </span> */}
                </td>
                <td className="px-4 py-1">
                  <div className="flex justify-end items-center gap-2 h-full">
                    <button
                      className="text-white/80 hover:text-sky-300 p-1 transition"
                      onClick={() => openIpUserModal(user)}
                    >
                      <ShieldOff size={16} />
                    </button>
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
                  </div>
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

      {/* Import modals */}
      <UserModals
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        viewModalOpen={viewModalOpen}
        setViewModalOpen={setViewModalOpen}
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        viewingUser={viewingUser}
        form={form}
        handleInputChange={handleInputChange}
        // handleSubmit={handleSubmit}
      />

      <UserIpModal
        ipModalOpen={ipModalOpen}
        setIpModalOpen={setIpModalOpen}
        editingUser={editingUser}
      />
    </div>
  );
}
