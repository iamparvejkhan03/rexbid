import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, Star, ChevronLeft, ChevronRight, Clock, MessageSquare, Eye, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { dummyUserImg } from "../../assets";

const Reviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // NEW: details modal state
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    const [filters, setFilters] = useState({ status: "all", sortBy: "recent" });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalReviews: 0,
        reviewsPerPage: 10,
    });

    const fetchReviews = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                limit: pagination.reviewsPerPage,
                ...filters,
            });
            const { data } = await axiosInstance.get(`/api/v1/reviews/admin?${params}`);
            if (data.success) {
                setReviews(data.data.reviews);
                setPagination(data.data.pagination);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { data } = await axiosInstance.get("/api/v1/reviews/admin/stats");
            if (data.success) setStats(data.data);
        } catch (err) {
            console.error("Fetch stats error:", err);
        }
    };

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [filters]);

    const handleApprove = async (reviewId) => {
        try {
            setProcessingId(reviewId);
            const { data } = await axiosInstance.patch(`/api/v1/reviews/admin/${reviewId}/approve`);
            if (data.success) {
                toast.success("Review approved — now visible to the public");
                if (filters.status === "pending") {
                    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                } else {
                    setReviews((prev) =>
                        prev.map((r) => (r._id === reviewId ? { ...r, status: "approved" } : r))
                    );
                }
                fetchStats();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to approve");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (reviewId) => {
        try {
            setProcessingId(reviewId);
            const { data } = await axiosInstance.patch(`/api/v1/reviews/admin/${reviewId}/reject`);
            if (data.success) {
                toast.success("Review rejected");
                if (filters.status === "pending") {
                    setReviews((prev) => prev.filter((r) => r._id !== reviewId));
                } else {
                    setReviews((prev) =>
                        prev.map((r) => (r._id === reviewId ? { ...r, status: "rejected" } : r))
                    );
                }
                fetchStats();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject");
        } finally {
            setProcessingId(null);
        }
    };

    const handleDelete = async (review) => {
        if (!window.confirm("Permanently delete this review? This cannot be undone.")) return;
        try {
            setProcessingId(review._id);
            const { data } = await axiosInstance.delete(`/api/v1/reviews/admin/${review._id}`);
            if (data.success) {
                toast.success("Review deleted");
                setReviews((prev) => prev.filter((r) => r._id !== review._id));
                if (selectedReview?._id === review._id) {
                    setShowDetailsModal(false);
                    setSelectedReview(null);
                }
                fetchStats();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
        } finally {
            setProcessingId(null);
        }
    };

    // NEW: action handler shared between table + modal
    const handleActionFromModal = async (action, reviewId) => {
        if (action === "approve") await handleApprove(reviewId);
        if (action === "reject") await handleReject(reviewId);
        if (action === "delete") {
            const target = reviews.find((r) => r._id === reviewId);
            if (target) await handleDelete(target);
            return;
        }
        // Keep the modal in sync with the new status
        setSelectedReview((prev) => (prev && prev._id === reviewId ? { ...prev, status: action === "approve" ? "approved" : "rejected" } : prev));
    };

    const getUserName = (user) => {
        if (!user) return "Unknown User";
        return (
            user.companyName ||
            `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
            user.username ||
            "Unknown User"
        );
    };

    const renderStars = (rating, size = 14) => (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={size}
                    fill={rating >= s ? "#f97316" : "none"}
                    stroke="#f97316"
                />
            ))}
            <span className="text-xs text-gray-500 ml-1">({rating})</span>
        </div>
    );

    const statusBadge = (status) => {
        const map = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    return (
        <section className="flex min-h-screen">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Review Moderation</h2>
                        <p className="text-secondary">
                            Approve reviews to make them public, or reject/delete ones that violate guidelines.
                        </p>
                    </div>

                    {/* Stats cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-blue-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Total Reviews</p>
                                        <h3 className="text-2xl font-bold">{stats.totalReviews?.toLocaleString("en-IE")}</h3>
                                    </div>
                                    <MessageSquare className="text-blue-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-yellow-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Pending Approval</p>
                                        <h3 className="text-2xl font-bold text-yellow-600">
                                            {stats.pendingReviews?.toLocaleString("en-IE")}
                                        </h3>
                                    </div>
                                    <Clock className="text-yellow-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-green-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Approved</p>
                                        <h3 className="text-2xl font-bold text-green-600">
                                            {stats.approvedReviews?.toLocaleString("en-IE")}
                                        </h3>
                                    </div>
                                    <CheckCircle className="text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 border-l-4 border-l-red-500">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-medium text-secondary">Rejected</p>
                                        <h3 className="text-2xl font-bold text-red-600">
                                            {stats.rejectedReviews?.toLocaleString("en-IE")}
                                        </h3>
                                    </div>
                                    <XCircle className="text-red-500" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-secondary mb-2">Sort By</label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                >
                                    <option value="recent">Recent</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="highestRating">Highest Rating</option>
                                    <option value="lowestRating">Lowest Rating</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Reviews table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold">Review Management</h3>
                        </div>

                        <div className="p-6">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <LoadingSpinner />
                                </div>
                            ) : reviews.length === 0 ? (
                                <div className="text-center py-12 text-secondary">
                                    <Star className="mx-auto mb-3" />
                                    <p>No reviews found with the current filters.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Reviewer</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Reviewee</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Rating</th>
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Comment</th>
                                                    {/* <th className="text-left py-3 px-4 font-medium text-secondary">Auction</th> */}
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Status</th>
                                                    {/* <th className="text-left py-3 px-4 font-medium text-secondary">Date</th> */}
                                                    <th className="text-left py-3 px-4 font-medium text-secondary">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reviews.map((review) => (
                                                    <tr key={review._id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                <img
                                                                    src={review.reviewer.image || dummyUserImg}
                                                                    alt=""
                                                                    className="w-8 h-8 rounded-full object-cover"
                                                                />
                                                                <span className="text-sm font-medium">
                                                                    {getUserName(review.reviewer)}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className="text-sm text-secondary">
                                                                {getUserName(review.reviewee)}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">{renderStars(review.rating)}</td>
                                                        <td className="py-3 px-4">
                                                            <p className="text-sm text-secondary max-w-xs line-clamp-2">
                                                                {review.comment || <em className="text-gray-400">No comment</em>}
                                                            </p>
                                                        </td>
                                                        {/* <td className="py-3 px-4">
                                                            <p className="text-sm text-secondary max-w-[180px] truncate" title={review.auction?.title}>
                                                                {review.auction?.title || "N/A"}
                                                            </p>
                                                        </td> */}
                                                        <td className="py-3 px-4">{statusBadge(review.status)}</td>
                                                        {/* <td className="py-3 px-4">
                                                            <p className="text-sm text-secondary whitespace-nowrap">
                                                                {new Date(review.createdAt).toLocaleDateString("en-IE", {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                    year: "numeric",
                                                                })}
                                                            </p>
                                                        </td> */}
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center gap-2">
                                                                {/* NEW: View button */}
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedReview(review);
                                                                        setShowDetailsModal(true);
                                                                    }}
                                                                    title="View details"
                                                                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    <Eye size={18} />
                                                                </button>
                                                                {review.status !== "approved" && (
                                                                    <button
                                                                        onClick={() => handleApprove(review._id)}
                                                                        disabled={processingId === review._id}
                                                                        title="Approve"
                                                                        className="p-1.5 rounded-md text-green-600 hover:bg-green-50 disabled:opacity-50"
                                                                    >
                                                                        <CheckCircle size={18} />
                                                                    </button>
                                                                )}
                                                                {review.status !== "rejected" && (
                                                                    <button
                                                                        onClick={() => handleReject(review._id)}
                                                                        disabled={processingId === review._id}
                                                                        title="Reject"
                                                                        className="p-1.5 rounded-md text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                                                                    >
                                                                        <XCircle size={18} />
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => handleDelete(review)}
                                                                    disabled={processingId === review._id}
                                                                    title="Delete"
                                                                    className="p-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {pagination.totalPages > 1 && (
                                        <div className="flex justify-center items-center gap-2 mt-6">
                                            <button
                                                onClick={() => fetchReviews(pagination.currentPage - 1)}
                                                disabled={pagination.currentPage === 1}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <ChevronLeft />
                                                Previous
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(pagination.totalPages)].map((_, index) => (
                                                    <button
                                                        key={index + 1}
                                                        onClick={() => fetchReviews(index + 1)}
                                                        className={`w-8 h-8 rounded-lg text-sm ${index + 1 === pagination.currentPage
                                                            ? "bg-black text-white"
                                                            : "border border-gray-300 hover:bg-gray-50"
                                                            }`}
                                                    >
                                                        {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => fetchReviews(pagination.currentPage + 1)}
                                                disabled={pagination.currentPage === pagination.totalPages}
                                                className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                                <ChevronRight />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>

            {/* NEW: Review Details Modal */}
            {showDetailsModal && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Review Details</h3>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Rating */}
                            <div>
                                <h4 className="font-medium text-secondary mb-2">Rating</h4>
                                {renderStars(selectedReview.rating, 20)}
                            </div>

                            {/* Comment */}
                            <div>
                                <h4 className="font-medium text-secondary mb-2">Comment</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-secondary whitespace-pre-wrap break-words">
                                        {selectedReview.comment || <em className="text-gray-400">No comment provided</em>}
                                    </p>
                                </div>
                            </div>

                            {/* Participants */}
                            <div>
                                <h4 className="font-medium text-secondary mb-3">Participants</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs uppercase text-gray-500 mb-1">Reviewer</p>
                                        <div className="flex items-center gap-3">
                                            {selectedReview.reviewer?.image && (
                                                <img
                                                    src={selectedReview.reviewer.image}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            )}
                                            <div>
                                                <p className="font-medium">{getUserName(selectedReview.reviewer)}</p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedReview.reviewer?.email || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-xs uppercase text-gray-500 mb-1">Reviewee</p>
                                        <div className="flex items-center gap-3">
                                            <div>
                                                <p className="font-medium">{getUserName(selectedReview.reviewee)}</p>
                                                <p className="text-xs text-gray-500">
                                                    {selectedReview.reviewee?.email || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Auction */}
                            <div>
                                <h4 className="font-medium text-secondary mb-3">Auction</h4>
                                <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
                                    {selectedReview.auction?.photos?.[0] && (
                                        <img
                                            src={selectedReview.auction.photos[0]?.url}
                                            alt=""
                                            className="w-14 h-14 rounded-md object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <p className="font-medium break-words">
                                            {selectedReview.auction?.title || "N/A"}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Auction ID: {selectedReview.auction?._id || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Metadata */}
                            <div>
                                <h4 className="font-medium text-secondary mb-3">Metadata</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="font-medium mb-1">Status</p>
                                        {statusBadge(selectedReview.status)}
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Review ID</p>
                                        <p className="text-xs text-secondary break-all">{selectedReview._id}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Created At</p>
                                        <p className="text-secondary">
                                            {new Date(selectedReview.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-medium mb-1">Updated At</p>
                                        <p className="text-secondary">
                                            {new Date(selectedReview.updatedAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal actions */}
                        <div className="p-6 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                            {selectedReview.status !== "approved" && (
                                <button
                                    onClick={() => handleActionFromModal("approve", selectedReview._id)}
                                    disabled={processingId === selectedReview._id}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                >
                                    <CheckCircle size={18} />
                                    Approve
                                </button>
                            )}
                            {selectedReview.status !== "rejected" && (
                                <button
                                    onClick={() => handleActionFromModal("reject", selectedReview._id)}
                                    disabled={processingId === selectedReview._id}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                            )}
                            <button
                                onClick={() => handleActionFromModal("delete", selectedReview._id)}
                                disabled={processingId === selectedReview._id}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Reviews;