"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, Plus, X } from "lucide-react";

interface User {
  id: number;
  name: string;
}

interface Group {
  id: number;
  name: string;
  created_by: string;
  status: "active" | "inactive";
  members: User[];
  created_at: string;
}

// Dummy users (replace with actual API data)
const dummyUsers: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
}));

// Dummy groups
const dummyGroups: Group[] = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  name: `Group ${i + 1}`,
  created_by: `Admin`,
  status: i % 2 === 0 ? "active" : "inactive",
  members: dummyUsers.slice(0, (i % 5) + 1),
  created_at: new Date().toISOString(),
}));

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(dummyGroups);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [viewingGroup, setViewingGroup] = useState<Group | null>(null);
  const [search, setSearch] = useState("");
  const recordsPerPage = 8;

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / recordsPerPage);
  const currentGroups = filteredGroups.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  const [form, setForm] = useState<Partial<Group>>({ members: [] });

  const toggleStatus = (id: number) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === id
          ? { ...g, status: g.status === "active" ? "inactive" : "active" }
          : g
      )
    );
  };

  const handleInputChange = (field: keyof Group, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.created_by) {
      alert("Name and Created By are required");
      return;
    }
    if (editingGroup) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === editingGroup.id ? ({ ...g, ...form } as Group) : g
        )
      );
    } else {
      setGroups((prev) => [
        ...prev,
        {
          ...(form as Group),
          id: prev.length + 1,
          status: form.status || "active",
          members: form.members || [],
          created_at: new Date().toISOString(),
        },
      ]);
    }
    setModalOpen(false);
    setEditingGroup(null);
    setForm({ members: [] });
  };

  const openEditModal = (group: Group) => {
    setEditingGroup(group);
    setForm(group);
    setModalOpen(true);
  };

  const openViewModal = (group: Group) => {
    setViewingGroup(group);
    setViewModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-950 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
          Groups Management
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded-xl w-full sm:w-64 bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={() => {
              setModalOpen(true);
              setEditingGroup(null);
              setForm({ members: [] });
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition"
          >
            <Plus size={16} /> Add New Group
          </button>
        </div>
      </div>

      {/* Groups Table */}
      <div className="overflow-x-auto bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/10">
        <table className="min-w-full text-left divide-y divide-white/30">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Name
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Created By
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Members
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Status
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80">
                Created At
              </th>
              <th className="px-4 py-2 text-sm font-semibold text-white/80 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {currentGroups.map((group) => (
              <tr
                key={group.id}
                className="hover:bg-white/30 transition h-12 rounded-md"
              >
                <td className="px-4 py-1 text-white">{group.name}</td>
                <td className="px-4 py-1 text-white/90">{group.created_by}</td>
                <td className="px-4 py-1 text-white/90">
                  {group.members.length}
                </td>
                <td className="px-4 py-1">
                  <span
                    onClick={() => toggleStatus(group.id)}
                    className={`cursor-pointer px-3 py-1 rounded-full text-xs font-semibold transition shadow-sm ${
                      group.status === "active"
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-500 hover:via-green-600 hover:to-green-700"
                        : "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:from-red-500 hover:via-red-600 hover:to-red-700"
                    }`}
                  >
                    {group.status}
                  </span>
                </td>
                <td className="px-4 py-1 text-white/90">
                  {new Date(group.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-1 flex justify-end gap-2">
                  <button
                    className="text-white/80 hover:text-sky-300 p-1 transition"
                    onClick={() => openViewModal(group)}
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="text-yellow-300 hover:text-yellow-400 p-1 transition"
                    onClick={() => openEditModal(group)}
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

      {/* Add/Edit Group Modal */}
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
              {editingGroup ? "Edit Group" : "Add New Group"}
            </h2>
            <form
              className="grid grid-cols-1 gap-3 text-sm"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                placeholder="Group Name *"
                value={form.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />
              <input
                type="text"
                placeholder="Created By *"
                value={form.created_by || ""}
                onChange={(e) =>
                  handleInputChange("created_by", e.target.value)
                }
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 placeholder-white/50 focus:ring-1 focus:ring-sky-400"
              />
              <select
                multiple
                value={form.members?.map((m) => m.id.toString()) || []}
                onChange={(e) =>
                  handleInputChange(
                    "members",
                    Array.from(e.target.selectedOptions).map(
                      (o) =>
                        dummyUsers.find((u) => u.id.toString() === o.value)!
                    )
                  )
                }
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                {dummyUsers.map((u) => (
                  <option key={u.id} value={u.id.toString()}>
                    {u.name}
                  </option>
                ))}
              </select>
              <select
                value={form.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="p-2 rounded-md bg-white/20 text-white border border-white/20 focus:ring-1 focus:ring-sky-400"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button
                type="submit"
                className="mt-3 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 py-2 rounded-xl text-white font-semibold hover:from-sky-500 hover:via-blue-600 hover:to-indigo-700 transition"
              >
                {editingGroup ? "Update Group" : "Add Group"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Group Modal */}
      {viewModalOpen && viewingGroup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md relative text-white">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4">Group Details</h2>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <p>
                <strong>Name:</strong> {viewingGroup.name}
              </p>
              <p>
                <strong>Created By:</strong> {viewingGroup.created_by}
              </p>
              <p>
                <strong>Status:</strong> {viewingGroup.status}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(viewingGroup.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Members:</strong>
              </p>
              <ul className="list-disc ml-5">
                {viewingGroup.members.map((m) => (
                  <li key={m.id}>{m.name}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
