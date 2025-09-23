// components/admin/Groups.tsx
"use client";

import { useState } from "react";
import { ToggleLeft, ToggleRight, Plus } from "lucide-react";

export default function Groups() {
  const [groups, setGroups] = useState([
    { id: 1, name: "Developers", active: true },
    { id: 2, name: "Designers", active: false },
    { id: 3, name: "Managers", active: true },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Manage Chat Groups</h3>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Plus className="h-4 w-4" /> Add Group
        </button>
      </div>
      <table className="w-full text-sm border-collapse border border-slate-300 dark:border-slate-700">
        <thead className="bg-slate-200 dark:bg-slate-700">
          <tr>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr
              key={g.id}
              className="hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <td className="p-2 border">{g.name}</td>
              <td className="p-2 border">{g.active ? "Active" : "Inactive"}</td>
              <td className="p-2 border text-center">
                <button
                  className="text-blue-500"
                  onClick={() =>
                    setGroups((prev) =>
                      prev.map((x) =>
                        x.id === g.id ? { ...x, active: !x.active } : x
                      )
                    )
                  }
                >
                  {g.active ? <ToggleRight /> : <ToggleLeft />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
