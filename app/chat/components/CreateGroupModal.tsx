"use client";
import { useState } from "react";
import { User } from "../../types/user";

interface Props {
  users: User[];
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, members: number[]) => void;
}

export default function CreateGroupModal({
  users,
  currentUser,
  isOpen,
  onClose,
  onCreateGroup,
}: Props) {
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<number[]>([]);

  if (!isOpen) return null;

  const handleCreate = () => {
    onCreateGroup(groupName, [currentUser.id, ...groupMembers]);
    setGroupName("");
    setGroupMembers([]);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-96 shadow-lg">
        <h3 className="text-lg font-bold mb-4">Create Group</h3>
        <input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full mb-2 border px-3 py-2 rounded"
        />
        <div className="mb-2 max-h-40 overflow-y-auto border rounded p-2">
          {users
            .filter((u) => u.id !== currentUser.id)
            .map((user) => (
              <label
                key={user.id}
                className="flex items-center gap-2 py-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={groupMembers.includes(user.id)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setGroupMembers((prev) => [...prev, user.id]);
                    else
                      setGroupMembers((prev) =>
                        prev.filter((id) => id !== user.id)
                      );
                  }}
                />
                {user.name}
              </label>
            ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
