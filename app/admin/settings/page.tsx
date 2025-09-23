"use client";

import { useState } from "react";
import {
  Cog,
  Lock,
  Bell,
  Shield,
  Key,
  Database,
  Globe,
  Save,
} from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Cog },
  { id: "auth", label: "Authentication", icon: Lock },
  { id: "roles", label: "Roles & Permissions", icon: Key },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Globe },
  { id: "backup", label: "Backup & Data", icon: Database },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-6 text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 p-4 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold">System Settings</h1>
        <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition">
          <Save size={16} /> Save All
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-4 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition font-medium ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white shadow-md"
                    : "text-gray-200 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <main className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg p-6">
          {activeTab === "general" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">General Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-lg">
                  <label className="block text-sm mb-2">System Name</label>
                  <input
                    type="text"
                    placeholder="ChatSphere"
                    className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white placeholder-gray-400"
                  />
                </div>
                <div className="bg-white/5 p-4 rounded-lg">
                  <label className="block text-sm mb-2">Timezone</label>
                  <select className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white">
                    <option value="UTC">UTC</option>
                    <option value="Asia/Karachi">Asia/Karachi</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "auth" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Authentication</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                  <span>Password must contain at least 8 characters</span>
                  <input type="checkbox" className="accent-sky-500 w-5 h-5" />
                </div>
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                  <span>Enable Two-Factor Authentication</span>
                  <input type="checkbox" className="accent-sky-500 w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "roles" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Roles & Permissions
              </h2>
              <p className="text-gray-300">
                Here you can configure roles and assign permissions.
              </p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notifications</h2>
              <div className="bg-white/5 p-4 rounded-lg mb-4">
                <label className="block text-sm mb-2">Email Sender</label>
                <input
                  type="email"
                  placeholder="noreply@system.com"
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                <span>Enable Email Notifications</span>
                <input type="checkbox" className="accent-sky-500 w-5 h-5" />
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Security</h2>
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg mb-4">
                <span>Force HTTPS (SSL)</span>
                <input type="checkbox" className="accent-sky-500 w-5 h-5" />
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <label className="block text-sm mb-2">
                  Log Retention (days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white"
                />
              </div>
            </div>
          )}

          {activeTab === "integrations" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Integrations</h2>
              <div className="bg-white/5 p-4 rounded-lg mb-4">
                <label className="block text-sm mb-2">SMTP Server</label>
                <input
                  type="text"
                  placeholder="smtp.mail.com"
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white placeholder-gray-400"
                />
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <label className="block text-sm mb-2">API Key</label>
                <input
                  type="text"
                  placeholder="***********"
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white"
                />
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Backup & Data</h2>
              <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg mb-4">
                <span>Enable Daily Backups</span>
                <input type="checkbox" className="accent-sky-500 w-5 h-5" />
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <label className="block text-sm mb-2">Retention (days)</label>
                <input
                  type="number"
                  placeholder="7"
                  className="w-full p-2 rounded-md bg-white/10 border border-white/20 focus:ring-1 focus:ring-sky-400 text-white"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
