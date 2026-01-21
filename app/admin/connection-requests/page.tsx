"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, RotateCcw, Users } from "lucide-react";
import apiClient from "@/services/apiClient";
import io from "socket.io-client";

interface ConnectionRequest {
    id: number;
    from_user_id: number;
    to_user_id: number;
    status: string;
    admin_approval_status: string;
    admin_approved_by: number | null;
    admin_approved_at: string | null;
    created_at: string;
    updated_at: string;
    sender_name: string;
    sender_email: string;
    sender_avatar: string | null;
    receiver_name: string;
    receiver_email: string;
    receiver_avatar: string | null;
    admin_name: string | null;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface Stats {
    pending: number;
    approved: number;
    rejected: number;
    fully_accepted: number;
}

export default function ConnectionRequestsPage() {
    const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
    const [requests, setRequests] = useState<ConnectionRequest[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    // Initialize Socket.IO connection
    useEffect(() => {
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000");

        // Listen for new connection requests
        socketInstance.on("admin_new_connection_request", (data: unknown) => {
            console.log("New connection request received:", data);
            // Refresh stats and requests if on pending tab
            fetchStats();
            if (activeTab === "pending") {
                fetchRequests(pagination?.page || 1);
            }
        });

        // Listen for approval events (to update stats)
        socketInstance.on("connection_request_approved", (data: unknown) => {
            console.log("Request approved:", data);
            fetchStats();
            fetchRequests(pagination?.page || 1);
        });

        // Listen for rejection events
        socketInstance.on("connection_request_rejected", (data: unknown) => {
            console.log("Request rejected:", data);
            fetchStats();
            fetchRequests(pagination?.page || 1);
        });

        return () => {
            socketInstance.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch statistics
    const fetchStats = async () => {
        try {
            const response = await apiClient.get("/admin/connection-requests/stats");
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    // Fetch requests
    const fetchRequests = async (page: number = 1) => {
        try {
            setLoading(true);
            const response = await apiClient.get(
                `/admin/connection-requests?tab=${activeTab}&page=${page}&limit=10`
            );

            setRequests(response.data.requests || []);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error("Error fetching requests:", error);
            setRequests([]); // Set empty array on error
            setPagination(null);
        } finally {
            setLoading(false);
        }
    };

    // Approve request
    const handleApprove = async (requestId: number) => {
        if (!confirm("Are you sure you want to approve this connection request?")) {
            return;
        }

        try {
            setActionLoading(requestId);
            const response = await apiClient.post(
                `/admin/connection-requests/${requestId}/approve`
            );

            const data = response.data;

            if (data.success) {
                alert(data.message);
                fetchRequests(pagination?.page);
                fetchStats();
            } else {
                alert("Failed to approve request");
            }
        } catch (error) {
            console.error("Error approving request:", error);
            alert("Error approving request");
        } finally {
            setActionLoading(null);
        }
    };

    // Reject request
    const handleReject = async (requestId: number) => {
        if (!confirm("Are you sure you want to reject this connection request?")) {
            return;
        }

        try {
            setActionLoading(requestId);
            const response = await apiClient.post(
                `/admin/connection-requests/${requestId}/reject`
            );
            const data = response.data;

            if (data.success) {
                alert(data.message);
                fetchRequests(pagination?.page);
                fetchStats();
            } else {
                alert("Failed to reject request");
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
            alert("Error rejecting request");
        } finally {
            setActionLoading(null);
        }
    };

    // Initial load
    useEffect(() => {
        fetchRequests();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-blue-950 p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                    📋 Connection Requests Management
                </h1>
                <p className="text-gray-300">
                    Review and manage user connection requests
                </p>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-sm">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
                            </div>
                            <Users className="text-yellow-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-sm">Approved</p>
                                <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
                            </div>
                            <CheckCircle className="text-green-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-sm">Rejected</p>
                                <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
                            </div>
                            <XCircle className="text-red-400" size={32} />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/70 text-sm">Fully Connected</p>
                                <p className="text-3xl font-bold text-blue-400">{stats.fully_accepted}</p>
                            </div>
                            <Users className="text-blue-400" size={32} />
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-6 py-3 rounded-xl font-medium transition ${activeTab === "pending"
                        ? "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                >
                    ⏳ Pending ({stats?.pending || 0})
                </button>
                <button
                    onClick={() => setActiveTab("approved")}
                    className={`px-6 py-3 rounded-xl font-medium transition ${activeTab === "approved"
                        ? "bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                >
                    ✅ Approved ({stats?.approved || 0})
                </button>
                <button
                    onClick={() => setActiveTab("rejected")}
                    className={`px-6 py-3 rounded-xl font-medium transition ${activeTab === "rejected"
                        ? "bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white shadow-lg"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                        }`}
                >
                    ❌ Rejected ({stats?.rejected || 0})
                </button>
            </div>

            {/* Requests List */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="animate-spin text-white" size={32} />
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center p-12 text-white/70">
                        No {activeTab} requests found
                    </div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {requests.map((request) => (
                            <div key={request.id} className="p-6 hover:bg-white/5 transition">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <div>
                                                <p className="text-white font-medium text-lg">
                                                    {request.sender_name} → {request.receiver_name}
                                                </p>
                                                <p className="text-white/60 text-sm">
                                                    {request.sender_email} → {request.receiver_email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-white/70">
                                            <span>🕐 {formatDate(request.created_at)}</span>
                                            {request.admin_name && (
                                                <span>👤 By: {request.admin_name}</span>
                                            )}
                                            {request.admin_approved_at && (
                                                <span>📅 {formatDate(request.admin_approved_at)}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        {activeTab === "pending" && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-lg hover:from-green-500 hover:via-green-600 hover:to-green-700 transition disabled:opacity-50"
                                                >
                                                    {actionLoading === request.id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <CheckCircle size={16} />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.id)}
                                                    disabled={actionLoading === request.id}
                                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white rounded-lg hover:from-red-500 hover:via-red-600 hover:to-red-700 transition disabled:opacity-50"
                                                >
                                                    {actionLoading === request.id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <XCircle size={16} />
                                                    )}
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {activeTab === "approved" && (
                                            <button
                                                onClick={() => handleReject(request.id)}
                                                disabled={actionLoading === request.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white rounded-lg hover:from-red-500 hover:via-red-600 hover:to-red-700 transition disabled:opacity-50"
                                                title="Reverse decision and reject"
                                            >
                                                {actionLoading === request.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <RotateCcw size={16} />
                                                )}
                                                Reverse Decision
                                            </button>
                                        )}

                                        {activeTab === "rejected" && (
                                            <button
                                                onClick={() => handleApprove(request.id)}
                                                disabled={actionLoading === request.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-lg hover:from-green-500 hover:via-green-600 hover:to-green-700 transition disabled:opacity-50"
                                                title="Reverse decision and approve"
                                            >
                                                {actionLoading === request.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <RotateCcw size={16} />
                                                )}
                                                Reverse Decision
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-white/10 flex items-center justify-center gap-2">
                        <button
                            onClick={() => fetchRequests(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Previous
                        </button>
                        <span className="text-white px-4">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchRequests(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
