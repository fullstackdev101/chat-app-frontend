"use client";

import { useState } from "react";
import { Plus, Users, UserPlus, Edit3, Trash2 } from "lucide-react";

// Dummy users (from users table)
const dummyUsers = [
  { id: 1, name: "Faisal Qureshi", username: "faisal" },
  { id: 2, name: "Ali Khan", username: "alikhan" },
  { id: 3, name: "Sara Malik", username: "saram" },
  { id: 4, name: "John Doe", username: "jdoe" },
  { id: 5, name: "Maryam Ahmed", username: "maryama" },
];

// Dummy groups (with members)
const initialGroups = [
  {
    id: 1,
    name: "Tech Team",
    status: "active",
    members: [1, 2, 3],
    created_by: 1,
  },
  {
    id: 2,
    name: "Support Staff",
    status: "inactive",
    members: [4, 5],
    created_by: 2,
  },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState(initialGroups);
  const [showModal, setShowModal] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    status: "active",
    members: [] as number[],
  });

  // Toggle member selection
  const toggleMember = (userId: number) => {
    setNewGroup((prev) => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter((id) => id !== userId)
        : [...prev.members, userId],
    }));
  };

  // Create new group
  const handleCreateGroup = () => {
    if (!newGroup.name.trim()) return;

    setGroups((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: newGroup.name,
        status: newGroup.status,
        members: newGroup.members,
        created_by: 1, // admin user
      },
    ]);

    setNewGroup({ name: "", status: "active", members: [] });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-100 to-blue-200 dark:from-slate-900 dark:via-slate-950 dark:to-blue-950 p-8 transition-colors">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
            Chat Groups Management
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-xl shadow-lg hover:from-sky-600 hover:to-indigo-700 transition"
          >
            <Plus className="h-5 w-5" /> Create Group
          </button>
        </div>

        {/* Groups Table */}
        <div className="bg-white dark:bg-slate-900 shadow-xl rounded-xl overflow-hidden border border-blue-200 dark:border-blue-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-sky-100 dark:bg-slate-800 text-blue-900 dark:text-blue-200 uppercase">
              <tr>
                <th className="px-6 py-3">Group Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Members</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr
                  key={group.id}
                  className="border-t border-blue-100 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-slate-800/50 transition"
                >
                  <td className="px-6 py-4 font-medium">{group.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        group.status === "active"
                          ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200"
                          : "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200"
                      }`}
                    >
                      {group.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex -space-x-2">
                    {group.members.map((id) => {
                      const user = dummyUsers.find((u) => u.id === id);
                      return (
                        <div
                          key={id}
                          title={user?.name}
                          className="h-8 w-8 flex items-center justify-center rounded-full bg-sky-500 text-white text-xs font-bold ring-2 ring-white dark:ring-slate-900"
                        >
                          {user?.name[0]}
                        </div>
                      );
                    })}
                  </td>
                  <td className="px-6 py-4 flex gap-3">
                    <button className="text-sky-600 hover:text-sky-800 dark:text-sky-400 dark:hover:text-sky-200">
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Creating Group */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-4">
              Create New Group
            </h2>

            {/* Group Name */}
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) =>
                setNewGroup({ ...newGroup, name: e.target.value })
              }
              className="w-full p-3 mb-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            />

            {/* Status */}
            <select
              value={newGroup.status}
              onChange={(e) =>
                setNewGroup({ ...newGroup, status: e.target.value })
              }
              className="w-full p-3 mb-4 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Members */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Members
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {dummyUsers.map((user) => (
                  <label
                    key={user.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${
                      newGroup.members.includes(user.id)
                        ? "bg-sky-100 dark:bg-sky-800 border-sky-400"
                        : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newGroup.members.includes(user.id)}
                      onChange={() => toggleMember(user.id)}
                    />
                    {user.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
