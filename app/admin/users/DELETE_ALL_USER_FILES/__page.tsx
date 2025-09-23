"use client";

import { useState } from "react";
import { Pencil, Eye, Plus, Users, Network, X, Trash2 } from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  allowedIps: string[];
}

interface Group {
  id: number;
  name: string;
  members: number[];
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Faisal Qureshi",
    username: "faisal",
    email: "faisal@example.com",
    phone: "03001234567",
    role: "Admin",
    status: "Active",
    allowedIps: ["192.168.1.1"],
  },
  {
    id: 2,
    name: "Ali Khan",
    username: "ali",
    email: "ali@example.com",
    phone: "03331234567",
    role: "User",
    status: "Inactive",
    allowedIps: ["10.0.0.1", "10.0.0.2"],
  },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [groups, setGroups] = useState<Group[]>([]);

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showIpModal, setShowIpModal] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    id: 0,
    name: "",
    username: "",
    email: "",
    phone: "",
    role: "User",
    status: "Active",
    allowedIps: [],
  });

  const [newGroupName, setNewGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newIp, setNewIp] = useState("");

  // --- Users ---
  const handleSaveUser = () => {
    if (!newUser.name.trim()) return;
    if (editingUser) {
      setUsers(users.map((u) => (u.id === editingUser.id ? newUser : u)));
    } else {
      setUsers([...users, { ...newUser, id: users.length + 1 }]);
    }
    setNewUser({
      id: 0,
      name: "",
      username: "",
      email: "",
      phone: "",
      role: "User",
      status: "Active",
      allowedIps: [],
    });
    setEditingUser(null);
    setShowUserModal(false);
  };

  // --- Groups ---
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: Group = {
      id: groups.length + 1,
      name: newGroupName,
      members: selectedMembers,
    };
    setGroups([...groups, newGroup]);
    setNewGroupName("");
    setSelectedMembers([]);
    setShowGroupModal(false);
  };

  // --- IPs ---
  const handleAddIp = () => {
    if (!newIp.trim() || !selectedUser) return;
    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, allowedIps: [...u.allowedIps, newIp] }
        : u
    );
    setUsers(updatedUsers);
    setNewIp("");
  };

  const handleDeleteIp = (ip: string) => {
    if (!selectedUser) return;
    const updatedUsers = users.map((u) =>
      u.id === selectedUser.id
        ? { ...u, allowedIps: u.allowedIps.filter((i) => i !== ip) }
        : u
    );
    setUsers(updatedUsers);
  };

  return (
    <div className="p-6 space-y-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {/* USERS */}
      <section className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Manage Users
          </h2>
          <button
            onClick={() => {
              setEditingUser(null);
              setNewUser({
                id: 0,
                name: "",
                username: "",
                email: "",
                phone: "",
                role: "User",
                status: "Active",
                allowedIps: [],
              });
              setShowUserModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>

        <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Phone</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.username}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.phone}</td>
                <td className="px-4 py-2">{u.role}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      u.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center flex space-x-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setShowIpModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <Network className="w-5 h-5" />
                  </button>
                  <button className="text-blue-600 hover:text-blue-800">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setNewUser(u);
                      setShowUserModal(true);
                    }}
                    className="text-green-600 hover:text-green-800"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* GROUPS */}
      <section className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Manage Groups
          </h2>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
          >
            <Users className="w-4 h-4 mr-2" /> Create Group
          </button>
        </div>

        <ul className="space-y-2">
          {groups.map((g) => (
            <li
              key={g.id}
              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border dark:border-gray-700"
            >
              <strong>{g.name}</strong> —{" "}
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {g.members.length} members
              </span>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {g.members
                  .map((id) => users.find((u) => u.id === id)?.name)
                  .join(", ")}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* --- MODALS --- */}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-lg relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              {editingUser ? "Edit User" : "Add User"}
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <input
                type="text"
                placeholder="Phone"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option>Admin</option>
                <option>User</option>
              </select>
              <select
                value={newUser.status}
                onChange={(e) =>
                  setNewUser({ ...newUser, status: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
              <button
                onClick={handleSaveUser}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingUser ? "Update User" : "Add User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-lg relative">
            <button
              onClick={() => setShowGroupModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Create Group
            </h3>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full px-3 py-2 mb-3 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
            <select
              multiple
              value={selectedMembers.map(String)}
              onChange={(e) =>
                setSelectedMembers(
                  Array.from(e.target.selectedOptions, (opt) =>
                    parseInt(opt.value)
                  )
                )
              }
              className="w-full px-3 py-2 h-32 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            <button
              onClick={handleAddGroup}
              className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create Group
            </button>
          </div>
        </div>
      )}

      {/* IP Modal */}
      {showIpModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl w-96 shadow-lg relative">
            <button
              onClick={() => setShowIpModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Manage IPs for {selectedUser.name}
            </h3>
            <div className="space-y-2 mb-4">
              {selectedUser.allowedIps.map((ip, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg text-sm"
                >
                  <span>{ip}</span>
                  <button
                    onClick={() => handleDeleteIp(ip)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter IP"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
              />
              <button
                onClick={handleAddIp}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
