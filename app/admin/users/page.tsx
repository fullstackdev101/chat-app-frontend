"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Plus, ShieldOff, Shield } from "lucide-react";
import { getUsers } from "@/services/authService"; // ✅ import API service
import { User } from "../../types/user";
// import { User as ChatUser } from "../../chat/types/index";
import UserModals from "./UserModals";
import UserIpModal from "./UserIpModal";
import { getSocket } from "../../../lib/socket"; // ✅ import socket instance
import { useAuthStore } from "../../store/authStore";

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
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    location: "all",
    hasIp: "all", // all | assigned | unassigned
  });
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role_id === 1;

  // ✅ Fetch users from backend
  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ Define this function outside of useEffect
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      console.log("----------------- Fetch Users -------------------");
      console.log(data);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("user:updated", (updatedUser: User) => {
      // Convert socket user to admin user type by ensuring phone_number is string | null
      const adminUser: User = {
        ...updatedUser,
        phone_number: updatedUser.phone_number ?? null,
        notes: updatedUser.notes ?? null,
        created_by: updatedUser.created_by ?? null,
        profile_image: updatedUser.profile_image ?? null,
      };

      // Function to update single record
      // React style update function
      function updateUserById(users: User[], id: number, userData: User) {
        return users.map((user) =>
          user.id === id ? { ...user, ...userData } : user
        );
      }

      // Example usage in setState
      setUsers((prev) => updateUserById(prev, adminUser.id, adminUser));
    });

    socket.on("user:created", (newUser: User) => {
      // Convert socket user to admin user type by ensuring phone_number is string | null
      setUsers((prev) => [...prev, newUser]);
    });

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("user:created");
        socket.off("user:updated");
      }
    };
  }, [users]);

  const recordsPerPage = 8;

  const userList = Object.values(users).flat();

  // Apply search filter
  let filteredUsers = userList.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.username ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  // Apply role filter
  if (filters.role !== "all") {
    filteredUsers = filteredUsers.filter(
      (u) => u.role_id === Number(filters.role)
    );
  }

  // Apply status filter
  if (filters.status !== "all") {
    filteredUsers = filteredUsers.filter(
      (u) => u.account_status === filters.status
    );
  }

  // Apply location filter
  if (filters.location !== "all") {
    filteredUsers = filteredUsers.filter(
      (u) => u.office_location === filters.location
    );
  }

  // Apply IP assignment filter
  if (filters.hasIp === "assigned") {
    filteredUsers = filteredUsers.filter((u) => u.office_location);
  } else if (filters.hasIp === "unassigned") {
    filteredUsers = filteredUsers.filter((u) => !u.office_location);
  }

  // Apply sorting
  filteredUsers.sort((a, b) => {
    let aVal: string | number | null | undefined = a[sortBy as keyof User];
    let bVal: string | number | null | undefined = b[sortBy as keyof User];

    // Handle null/undefined
    if (aVal == null) aVal = "";
    if (bVal == null) bVal = "";

    // Convert to string for comparison
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();

    if (sortOrder === "asc") {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const totalPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  // console.log("----- Current Users -----");
  // console.log(currentUsers);

  const openEditModal = (user: User) => {
    setEditingUser({
      ...user,
      name: user.name ?? "", // ensure string, not null
    });
    // setForm(user);
    setModalOpen(true);
  };

  const openIpUserModal = (user: User) => {
    console.log("------------ LINE 182 -------------");

    setEditingUser({
      ...user,
      name: user.name ?? "", // ensure string, not null
    });
    // setForm(user);
    setIpModalOpen(true);
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setViewModalOpen(true);
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // New column, default to ascending
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
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
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Total Users: {users.length} | Filtered: {filteredUsers.length}
          </p>
        </div>
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

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 border border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-white/70 text-xs mb-1 block">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full bg-white text-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400"
            >
              <option value="all" className="bg-white text-gray-900">All Roles</option>
              <option value="2" className="bg-white text-gray-900">Admin</option>
              <option value="3" className="bg-white text-gray-900">Agent</option>
            </select>
          </div>
          <div>
            <label className="text-white/70 text-xs mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-white text-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400"
            >
              <option value="all" className="bg-white text-gray-900">All Status</option>
              <option value="active" className="bg-white text-gray-900">Active</option>
              <option value="inactive" className="bg-white text-gray-900">Inactive</option>
              <option value="blocked" className="bg-white text-gray-900">Blocked</option>
            </select>
          </div>
          <div>
            <label className="text-white/70 text-xs mb-1 block">IP Assignment</label>
            <select
              value={filters.hasIp}
              onChange={(e) => setFilters({ ...filters, hasIp: e.target.value })}
              className="w-full bg-white text-gray-900 border border-white/20 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-sky-400"
            >
              <option value="all" className="bg-white text-gray-900">All Users</option>
              <option value="assigned" className="bg-white text-gray-900">IP Assigned</option>
              <option value="unassigned" className="bg-white text-gray-900">No IP</option>
            </select>
          </div>
          <div>
            <label className="text-white/70 text-xs mb-1 block">Actions</label>
            <button
              onClick={() => {
                setSearch("");
                setFilters({ role: "all", status: "all", location: "all", hasIp: "all" });
              }}
              className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm hover:bg-white/20 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
        <table className="min-w-full text-left divide-y divide-white/30">
          <thead className="bg-white/10">
            <tr>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("name")}
              >
                Name<SortIcon column="name" />
              </th>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("username")}
              >
                Username<SortIcon column="username" />
              </th>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("email")}
              >
                Email<SortIcon column="email" />
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Phone
              </th>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("role_name")}
              >
                Role<SortIcon column="role_name" />
              </th>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("account_status")}
              >
                Account Status<SortIcon column="account_status" />
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Presence
              </th>
              <th
                className="px-4 py-2 text-sm font-semibold text-white/80 cursor-pointer hover:text-white"
                onClick={() => handleSort("office_location")}
              >
                Location<SortIcon column="office_location" />
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                IP Address
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
                <td className="px-4 py-1 text-white/90">
                  {user.office_location}
                </td>
                <td className="px-4 py-1 text-white/90 text-xs">
                  {user.ip_address || "-"}
                </td>
                <td className="px-4 py-1">
                  <div className="flex justify-end items-center gap-2 h-full">
                    <button
                      className={`p-1 transition rounded ${isAdmin
                        ? user.office_location
                          ? "text-yellow-400 hover:text-yellow-300"
                          : "text-white/80 hover:text-sky-300"
                        : "text-gray-500 cursor-not-allowed opacity-50"
                        }`}
                      onClick={() => {
                        if (isAdmin) {
                          openIpUserModal(user);
                        }
                      }}
                      title={
                        user.office_location
                          ? `Reassign IP (Current: ${user.office_location})`
                          : isAdmin
                            ? "Assign IP to user"
                            : "Only Super Admin can assign IP to users"
                      }
                      disabled={!isAdmin}
                    >
                      {user.office_location ? (
                        <Shield size={16} /> // 🛡️ Assigned
                      ) : (
                        <ShieldOff size={16} /> // 🚫 Not assigned
                      )}
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
                    <button
                      className="text-red-400 hover:text-red-500 p-1 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={true} // e.g. user.role_id !== 1
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                      Disabled — only admins can delete users
                    </span>
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
            className={`px-3 py-1 rounded-xl text-white transition ${currentPage === i + 1
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
      // form={form}
      // handleInputChange={handleInputChange}
      // handleSubmit={handleSubmit}
      />

      <UserIpModal
        ipModalOpen={ipModalOpen}
        setIpModalOpen={setIpModalOpen}
        editingUser={editingUser}
        onIpAssigned={fetchUsers} // 👈 call refresh here
      />
    </div>
  );
}
