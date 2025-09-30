import { useState } from "react";

type Request = { id: number; name: string };

interface RightPanelProps {
  requestsReceived: Request[];
  requestsSent: Request[];
  contacts: Request[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onDeleteSent: (id: number) => void;
  onSendRequest: (id: number) => void;
}

export default function RightPanel({
  requestsReceived,
  requestsSent,
  contacts,
  onAccept,
  onReject,
  onDeleteSent,
  onSendRequest,
}: RightPanelProps) {
  const [search, setSearch] = useState("");
  // console.log("---------RIGHT PANEL ---------");
  // console.log(search);
  // console.log(contacts);
  // filter contacts only if search is typed
  const filteredContacts =
    search.trim().length > 0
      ? contacts.filter(
          (c) => c?.name && c.name.toLowerCase().includes(search.toLowerCase())
        )
      : [];

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 space-y-6">
      {/* Requests Received Section */}
      <div>
        <div className="text-lg font-semibold mb-3">
          Requests Received ({requestsReceived.length})
        </div>
        {requestsReceived.length > 0 ? (
          <div className="space-y-3">
            {requestsReceived.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between border p-2 rounded-lg dark:border-gray-700"
              >
                <span className="text-sm font-medium">{req.name}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onAccept(req.id)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(req.id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No requests received</p>
        )}
      </div>

      {/* Requests Sent Section */}
      <div>
        <div className="text-lg font-semibold mb-3">
          Requests Sent ({requestsSent.length})
        </div>
        {requestsSent.length > 0 ? (
          <div className="space-y-3">
            {requestsSent.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between border p-2 rounded-lg dark:border-gray-700"
              >
                <span className="text-sm font-medium">{req.name}</span>
                <button
                  onClick={() => onDeleteSent(req.id)}
                  className="px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400">No requests sent</p>
        )}
      </div>

      {/* Contact Search Section */}
      <div>
        <div className="text-lg font-semibold mb-3">Search Contacts</div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search contact..."
          className="w-full px-3 py-2 mb-3 text-sm border rounded dark:bg-gray-800 dark:border-gray-700"
        />

        {/* Only show results if something is typed */}
        {search.trim().length > 0 && (
          <>
            {filteredContacts.length > 0 ? (
              <div className="space-y-3">
                {filteredContacts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between border p-2 rounded-lg dark:border-gray-700"
                  >
                    <span className="text-sm font-medium">{c.name}</span>
                    <button
                      onClick={() => onSendRequest(c.id)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Send Request
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No contacts found</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
