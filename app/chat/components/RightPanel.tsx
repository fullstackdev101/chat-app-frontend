"use client";
import { User, Group } from "../types";

interface RightPanelProps {
  selectedUser: User | null;
  selectedGroup: Group | null;
  users: User[];
}

export default function RightPanel({
  selectedUser,
  selectedGroup,
  users,
}: RightPanelProps) {
  return (
    <div className="w-72 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
      {selectedUser && (
        <div>
          <div className="text-xl font-bold">{selectedUser.name}</div>
          <div className="text-sm text-gray-500">Private Chat</div>
        </div>
      )}
      {selectedGroup && (
        <div>
          <div className="text-xl font-bold">{selectedGroup.name}</div>
          <div className="text-sm text-gray-500">Group Chat</div>
          <div className="mt-2 text-xs text-gray-400">
            Members:{" "}
            {selectedGroup.members
              .map((id) => users.find((u) => u.id === id)?.name)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
