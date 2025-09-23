"use client";

import { useState } from "react";
import { Plus, Trash } from "lucide-react";

export default function IPControl() {
  const [ips, setIps] = useState(["192.168.1.100", "10.0.0.15"]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">Allowed IPs</h3>
        <button className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
          <Plus className="h-4 w-4" /> Add IP
        </button>
      </div>
      <ul className="space-y-2">
        {ips.map((ip, i) => (
          <li
            key={i}
            className="flex justify-between items-center p-3 rounded-lg bg-slate-200 dark:bg-slate-700"
          >
            <span>{ip}</span>
            <button
              className="text-red-500"
              onClick={() => setIps((prev) => prev.filter((x) => x !== ip))}
            >
              <Trash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
