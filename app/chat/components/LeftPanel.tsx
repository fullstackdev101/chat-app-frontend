"use client";
import { User, Group } from "../types";

interface LeftPanelProps {
  users: User[];
  groups: Group[];
  currentUser: User;
  selectedUser: User | null;
  selectedGroup: Group | null;
  unread: Record<string, boolean>;
  onSelectUser: (user: User) => void;
  onSelectGroup: (group: Group) => void;
  onOpenGroupModal: () => void;
}

export default function LeftPanel({
  users,
  groups,
  currentUser,
  selectedUser,
  selectedGroup,
  unread,
  onSelectUser,
  onSelectGroup,
  onOpenGroupModal,
}: LeftPanelProps) {
  return (
    <div className="flex-1 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Contacts */}
      <div>
        <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          Contacts
        </h3>
        {users
          .filter((u) => u.id !== currentUser.id)
          .map((user) => {
            const isSelected = selectedUser?.id === user.id;
            const hasUnread = !!unread[`user-${user.id}`];

            return (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className={`flex items-center px-4 py-2 cursor-pointer transition-colors duration-150 ${
                  isSelected
                    ? "bg-blue-100 dark:bg-blue-900"
                    : hasUnread
                    ? "bg-indigo-50 dark:bg-indigo-900"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {" "}
                <span
                  className={`truncate ${
                    hasUnread
                      ? "font-bold text-blue-600 dark:text-blue-400"
                      : ""
                  }`}
                >
                  {user.name}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  {unread[user.id] && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  <span
                    className={`text-sm ${
                      user.presence === "online"
                        ? "text-green-500"
                        : user.presence === "busy"
                        ? "text-red-500"
                        : user.presence === "away"
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
                  >
                    ●
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* Groups */}
      <div className="mt-4">
        <div className="flex justify-between items-center px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
            Groups
          </h3>
          <button
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            onClick={onOpenGroupModal}
          >
            + New
          </button>
        </div>
        {groups.map((group) => {
          const isSelected = selectedGroup?.id === group.id;
          const hasUnread = !!unread[`group-${group.id}`];

          return (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group)}
              className={`flex items-center px-4 py-2 cursor-pointer transition-colors duration-150 ${
                isSelected
                  ? "bg-blue-100 dark:bg-blue-900"
                  : hasUnread
                  ? "bg-indigo-50 dark:bg-indigo-900"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <span className="mr-2 text-sm text-gray-400">●</span>
              <span
                className={`truncate ${
                  hasUnread
                    ? "font-semibold text-indigo-600 dark:text-indigo-300"
                    : ""
                }`}
              >
                {group.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
