import { useCallback, useEffect, useState } from "react";
import {
    X,
    Search,
    ChevronLeft,
    ChevronRight,
    Check,
    Loader,
    User as UserIcon,
    AlertCircle,
    Banknote,
    Wallet,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const ManualSellModal = ({ isOpen, onClose, auction, onSuccess }) => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        hasNext: false,
        hasPrev: false,
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [finalPrice, setFinalPrice] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("pending");
    const [submitting, setSubmitting] = useState(false);

    useBodyScrollLock(isOpen);

    // Reset every time the modal opens
    useEffect(() => {
        if (!isOpen) return;
        setQuery("");
        setDebouncedQuery("");
        setPage(1);
        setUsers([]);
        setSelectedUser(null);
        setFinalPrice("");
        setPaymentStatus("pending");
        setPagination({
            currentPage: 1,
            totalPages: 1,
            totalUsers: 0,
            hasNext: false,
            hasPrev: false,
        });
    }, [isOpen]);

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(query);
            setPage(1);
        }, 400);
        return () => clearTimeout(t);
    }, [query]);

    const fetchUsers = useCallback(async () => {
        if (!isOpen || !auction?._id) return;
        setLoading(true);
        try {
            const { data } = await axiosInstance.get(
                `/api/v1/admin/auctions/${auction._id}/manual-sell/users`,
                { params: { q: debouncedQuery, page, limit: 10 } }
            );
            if (data.success) {
                setUsers(data.data.users);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            console.error("Fetch users error:", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, [auction?._id, debouncedQuery, page, isOpen]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (!isOpen || !auction) return null;

    const handleSubmit = async () => {
        if (!selectedUser) {
            toast.error("Please select a buyer first");
            return;
        }
        const price = parseFloat(finalPrice);
        if (!finalPrice || isNaN(price) || price <= 0) {
            toast.error("Please enter a valid final price");
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await axiosInstance.post(
                `/api/v1/admin/auctions/${auction._id}/manual-sell`,
                {
                    buyerId: selectedUser._id,
                    finalPrice: price,
                    paymentStatus,
                }
            );
            if (data.success) {
                toast.success(data.message || "Auction sold successfully");
                onSuccess?.();
                onClose();
            }
        } catch (err) {
            console.error("Manual sell error:", err);
            toast.error(
                err.response?.data?.message || "Failed to complete manual sale"
            );
        } finally {
            setSubmitting(false);
        }
    };

    const displayName = (u) => {
        if (!u) return "";
        if (u.firstName || u.lastName)
            return `${u.firstName || ""} ${u.lastName || ""}`.trim();
        return u.companyName || u.username || "Unnamed";
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start p-5 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Manually Sell Auction
                        </h3>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                            {auction.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 overflow-y-auto space-y-5">
                    {/* Selected buyer chip */}
                    {selectedUser && (
                        <div className="flex items-center justify-between gap-3 bg-[#D19F3E]/10 border border-[#D19F3E]/40 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <Check size={16} className="text-[#D19F3E] flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {displayName(selectedUser)}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {selectedUser.email}
                                        {selectedUser.phone ? ` · ${selectedUser.phone}` : ""}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="text-gray-400 hover:text-red-500"
                                title="Clear selection"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Search */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Buyer
                        </label>
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search by name, username, email, phone, company..."
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D19F3E] focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    {/* User list */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                            {loading ? (
                                <div className="flex justify-center items-center py-10 text-gray-400">
                                    <Loader size={20} className="animate-spin mr-2" />
                                    <span className="text-sm">Loading users...</span>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    <UserIcon
                                        size={40}
                                        className="mx-auto text-gray-300 mb-2"
                                    />
                                    <p className="text-sm">No matching users found</p>
                                </div>
                            ) : (
                                users.map((u) => {
                                    const isSelected = selectedUser?._id === u._id;
                                    return (
                                        <button
                                            key={u._id}
                                            type="button"
                                            onClick={() => setSelectedUser(u)}
                                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${isSelected ? "bg-[#D19F3E]/10" : ""
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {displayName(u)}
                                                        <span className="ml-2 text-xs font-normal text-gray-500 capitalize">
                                                            ({u.userType})
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {u.email}
                                                        {u.phone ? ` · ${u.phone}` : ""}
                                                    </p>
                                                </div>
                                                {isSelected && (
                                                    <Check
                                                        size={18}
                                                        className="text-[#D19F3E] flex-shrink-0"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50">
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrev || loading}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:text-gray-900"
                                >
                                    <ChevronLeft size={14} /> Prev
                                </button>
                                <span className="text-xs text-gray-500">
                                    Page {pagination.currentPage} of {pagination.totalPages} ·{" "}
                                    {pagination.totalUsers} users
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!pagination.hasNext || loading}
                                    className="flex items-center gap-1 text-xs font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:text-gray-900"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Final price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Final Sale Price ({auction.baseCurrency || "EUR"})
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value)}
                            placeholder="e.g. 2500"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D19F3E] focus:border-transparent text-sm"
                        />
                    </div>

                    {/* Payment status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Status
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentStatus("pending")}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${paymentStatus === "pending"
                                        ? "border-[#D19F3E] bg-[#D19F3E]/5"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <AlertCircle
                                    size={18}
                                    className={`mt-0.5 flex-shrink-0 ${paymentStatus === "pending"
                                            ? "text-[#D19F3E]"
                                            : "text-gray-400"
                                        }`}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        Pending
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Buyer will pay online from their account
                                    </p>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPaymentStatus("completed")}
                                className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${paymentStatus === "completed"
                                        ? "border-[#D19F3E] bg-[#D19F3E]/5"
                                        : "border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                <Wallet
                                    size={18}
                                    className={`mt-0.5 flex-shrink-0 ${paymentStatus === "completed"
                                            ? "text-[#D19F3E]"
                                            : "text-gray-400"
                                        }`}
                                />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Paid</p>
                                    <p className="text-xs text-gray-500">
                                        Collected offline — recorded as bank transfer
                                    </p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex flex-col sm:flex-row gap-3 p-5 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting || !selectedUser || !finalPrice}
                        className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>
                                <Loader size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Banknote size={16} />
                                Confirm Sale
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualSellModal;