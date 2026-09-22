import { useEffect, useState } from "react";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
} from "../../components";
import {
    Search,
    Mail,
    User,
    Bell,
    Trash2,
    Eye,
    X,
    RefreshCw,
    CheckCircle,
    Clock,
    XCircle,
    Gavel,
    Calendar,
    MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { Link } from "react-router-dom";

const VISIBLE_AUCTIONS = 2;

function AdminReminders() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [viewAllUser, setViewAllUser] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });

    const fetchReminders = async (
        page = 1,
        search = searchTerm,
        status = statusFilter
    ) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(
                `/api/v1/reminders/admin/grouped`,
                {
                    params: {
                        page,
                        limit: 10,
                        search: search || undefined,
                        status: status !== "all" ? status : undefined,
                    },
                }
            );

            if (data.success) {
                setUsers(data.data.users);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error("Fetch reminders error:", err);
            toast.error("Failed to load reminders");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteGroup = async (email, name) => {
        if (
            !window.confirm(
                `Delete ${name || email}? This cannot be undone.`
            )
        ) {
            return;
        }

        try {
            const { data } = await axiosInstance.delete(
                `/api/v1/reminders/admin/email/${encodeURIComponent(email)}`
            );
            if (data.success) {
                toast.success(data.message);
                setViewAllUser(null);
                fetchReminders(pagination.currentPage);
            }
        } catch (err) {
            console.error("Delete reminders error:", err);
            toast.error(
                err.response?.data?.message || "Failed to delete reminders"
            );
        }
    };

    const handleDeleteSingle = async (reminderId) => {
        if (!window.confirm("Delete this reminder?")) return;

        try {
            const { data } = await axiosInstance.delete(
                `/api/v1/reminders/admin/${reminderId}`
            );
            if (data.success) {
                toast.success("Reminder deleted");

                // Keep the open modal in sync without refetching
                if (viewAllUser) {
                    const remaining = viewAllUser.auctions.filter(
                        (a) => a.reminderId !== reminderId
                    );
                    if (remaining.length === 0) {
                        setViewAllUser(null);
                    } else {
                        setViewAllUser({
                            ...viewAllUser,
                            auctions: remaining,
                            remindersCount: Math.max(
                                0,
                                viewAllUser.remindersCount - 1
                            ),
                        });
                    }
                }

                fetchReminders(pagination.currentPage);
            }
        } catch (err) {
            console.error("Delete reminder error:", err);
            toast.error(
                err.response?.data?.message || "Failed to delete reminder"
            );
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchReminders(1, searchTerm, statusFilter);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (!event.target.closest(".relative")) {
                setActiveDropdown(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleString("en-IE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-IE", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (sent, unsubscribed) => {
        if (unsubscribed) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <XCircle size={12} />
                    Unsubscribed
                </span>
            );
        }
        if (sent) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={12} />
                    Sent
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock size={12} />
                Pending
            </span>
        );
    };

    const getDotColor = (sent, unsubscribed) => {
        if (unsubscribed) return "bg-gray-400";
        if (sent) return "bg-green-500";
        return "bg-yellow-500";
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold my-5">
                                    Guest Interests
                                </h2>
                                <p className="text-gray-600 -mt-3">
                                    Unregistered visitors who asked to be
                                    reminded before an auction ends.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">
                                Interest List
                            </h3>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Auctions
                                            </th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Latest Activity
                                            </th>
                                            <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {users.map((u) => {
                                            const visibleAuctions =
                                                u.auctions.slice(
                                                    0,
                                                    VISIBLE_AUCTIONS
                                                );
                                            const hiddenCount =
                                                u.auctions.length -
                                                VISIBLE_AUCTIONS;

                                            return (
                                                <tr
                                                    key={u.email}
                                                    className="hover:bg-gray-50 align-top"
                                                >
                                                    {/* Name */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                <User
                                                                    size={16}
                                                                    className="text-blue-600"
                                                                />
                                                            </div>
                                                            <span className="font-medium text-gray-900">
                                                                {u.name || "—"}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Email */}
                                                    <td className="py-4 px-6">
                                                        <a
                                                            href={`mailto:${u.email}`}
                                                            className="text-sm text-gray-900 hover:text-blue-600 hover:underline"
                                                        >
                                                            {u.email}
                                                        </a>
                                                    </td>

                                                    {/* Auctions (chips) */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex flex-wrap items-center gap-1.5">
                                                            {visibleAuctions.map(
                                                                (a) => (
                                                                    <span
                                                                        key={
                                                                            a.reminderId
                                                                        }
                                                                        title={
                                                                            a.title
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs max-w-[180px]"
                                                                    >
                                                                        <span className="truncate text-gray-700">
                                                                            {
                                                                                a.title
                                                                            }
                                                                        </span>
                                                                    </span>
                                                                )
                                                            )}

                                                            {hiddenCount > 0 && (
                                                                <button
                                                                    onClick={() =>
                                                                        setViewAllUser(
                                                                            u
                                                                        )
                                                                    }
                                                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                                                                >
                                                                    +
                                                                    {hiddenCount}{" "}
                                                                    more
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Latest Activity */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Calendar
                                                                size={14}
                                                                className="text-gray-400"
                                                            />
                                                            {formatDateTime(
                                                                u.latestAt
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() =>
                                                                    setViewAllUser(
                                                                        u
                                                                    )
                                                                }
                                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                                title="View all auctions"
                                                            >
                                                                <Eye size={18} />
                                                            </button>

                                                            <a
                                                                href={`mailto:${u.email}`}
                                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                                                title="Email user"
                                                            >
                                                                <Mail
                                                                    size={18}
                                                                />
                                                            </a>

                                                            <div className="relative">
                                                                <button
                                                                    onClick={() =>
                                                                        setActiveDropdown(
                                                                            activeDropdown ===
                                                                                u.email
                                                                                ? null
                                                                                : u.email
                                                                        )
                                                                    }
                                                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                                >
                                                                    <MoreVertical
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                                {activeDropdown ===
                                                                    u.email && (
                                                                        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setViewAllUser(
                                                                                        u
                                                                                    );
                                                                                    setActiveDropdown(
                                                                                        null
                                                                                    );
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                                            >
                                                                                <Eye
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    View
                                                                                    all
                                                                                    auctions
                                                                                </span>
                                                                            </button>

                                                                            <button
                                                                                onClick={() => {
                                                                                    setActiveDropdown(
                                                                                        null
                                                                                    );
                                                                                    handleDeleteGroup(
                                                                                        u.email,
                                                                                        u.name
                                                                                    );
                                                                                }}
                                                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Trash2
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />
                                                                                <span>
                                                                                    Delete
                                                                                    this
                                                                                    user
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Empty state */}
                                {users.length === 0 && (
                                    <div className="text-center py-12">
                                        <Bell
                                            size={48}
                                            className="mx-auto text-gray-300 mb-3"
                                        />
                                        <p className="text-gray-500">
                                            No reminders found matching your
                                            criteria
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSearchTerm("");
                                                setStatusFilter("all");
                                            }}
                                            className="text-blue-600 hover:text-blue-800 mt-2"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                                        <div className="text-sm text-gray-700">
                                            Page {pagination.currentPage} of{" "}
                                            {pagination.totalPages} (
                                            {pagination.totalItems} email
                                            {pagination.totalItems !== 1
                                                ? "s"
                                                : ""}
                                            )
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    fetchReminders(
                                                        pagination.currentPage -
                                                        1
                                                    )
                                                }
                                                disabled={
                                                    pagination.currentPage === 1
                                                }
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() =>
                                                    fetchReminders(
                                                        pagination.currentPage +
                                                        1
                                                    )
                                                }
                                                disabled={
                                                    pagination.currentPage ===
                                                    pagination.totalPages
                                                }
                                                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* View All Auctions Modal */}
                    {viewAllUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {viewAllUser.name ||
                                                "Reminders"}{" "}
                                            — All Auctions
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-0.5">
                                            {viewAllUser.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setViewAllUser(null)}
                                        className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                                        aria-label="Close"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Modal Table */}
                                <div className="overflow-y-auto flex-1">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 sticky top-0">
                                            <tr>
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Auction
                                                </th>
                                                {/* <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Ends
                                                </th> */}
                                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Set On
                                                </th>
                                                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {viewAllUser.auctions.map((a) => (
                                                <tr
                                                    key={a.reminderId}
                                                    className="hover:bg-gray-50"
                                                >
                                                    <td className="py-3 px-6">
                                                        {a.auctionId ? (
                                                            <Link
                                                                to={`/auction/${a.auctionId}`}
                                                                target="_blank"
                                                                className="text-sm text-gray-900 hover:text-blue-600 hover:underline inline-flex items-center gap-2"
                                                            >
                                                                <Gavel
                                                                    size={14}
                                                                    className="text-gray-400 flex-shrink-0"
                                                                />
                                                                {a.title}
                                                            </Link>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic inline-flex items-center gap-2">
                                                                <Gavel
                                                                    size={14}
                                                                    className="flex-shrink-0"
                                                                />
                                                                {a.title}
                                                            </span>
                                                        )}
                                                    </td>
                                                    {/* <td className="py-3 px-6 text-sm text-gray-600">
                                                        {formatDate(a.endDate)}
                                                    </td> */}
                                                    <td className="py-3 px-6 text-sm text-gray-600">
                                                        {formatDate(
                                                            a.remindedAt
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-6 text-right">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteSingle(
                                                                    a.reminderId
                                                                )
                                                            }
                                                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                            title="Delete reminder"
                                                        >
                                                            <Trash2
                                                                size={16}
                                                            />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                                    <button
                                        onClick={() =>
                                            handleDeleteGroup(
                                                viewAllUser.email,
                                                viewAllUser.name
                                            )
                                        }
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                        Delete this user
                                    </button>
                                    <button
                                        onClick={() => setViewAllUser(null)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default AdminReminders;