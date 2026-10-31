import { useEffect, useState } from "react";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
} from "../../components";
import {
    User,
    Trash2,
    Star,
    Mail,
    Phone,
    MapPin,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Filter,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

const PREVIEW_LENGTH = 140;

const TABS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
];

const STATUS_STYLES = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
};

const USER_TYPE_LABEL = {
    buyer: "Buyer",
    seller: "Seller",
    "delivery-partner": "Delivery Partner",
    other: "Other",
};

function Stars({ rating }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={14}
                    className={
                        n <= rating
                            ? "fill-[#D19F3E] text-[#D19F3E]"
                            : "text-gray-300"
                    }
                />
            ))}
        </div>
    );
}

function WebsiteReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [expanded, setExpanded] = useState({});
    const [busyId, setBusyId] = useState(null);

    const fetchReviews = async (status = "all") => {
        try {
            setLoading(true);
            const q = status === "all" ? "" : `&status=${status}`;
            const { data } = await axiosInstance.get(
                `/api/v1/website-review?limit=200${q}`
            );
            if (data.success) setReviews(data.data.reviews);
        } catch (error) {
            console.error("Fetch reviews error:", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(activeTab);
    }, [activeTab]);

    const updateStatus = async (id, status) => {
        setBusyId(id);
        try {
            const { data } = await axiosInstance.patch(
                `/api/v1/website-review/${id}/status`,
                { status }
            );
            if (data.success) {
                setReviews((prev) =>
                    prev.map((r) => (r._id === id ? { ...r, status } : r))
                );
                toast.success(
                    status === "approved"
                        ? "Review approved — now visible publicly"
                        : "Review rejected"
                );
            }
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update review");
        } finally {
            setBusyId(null);
        }
    };

    const deleteReview = async (id) => {
        if (
            !window.confirm(
                "Delete this review permanently? This cannot be undone."
            )
        )
            return;
        try {
            const { data } = await axiosInstance.delete(
                `/api/v1/website-review/${id}`
            );
            if (data.success) {
                setReviews((prev) => prev.filter((r) => r._id !== id));
                toast.success("Review deleted");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete review");
        }
    };

    const toggleExpanded = (id) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">
                                Website Reviews
                            </h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium w-fit">
                                {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => setActiveTab(t.key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${activeTab === t.key
                                            ? "bg-[#072342] text-white"
                                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <LoadingSpinner />
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                                Reviewer
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                                Rating
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                                Feedback
                                            </th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reviews.map((r) => {
                                            const isLong =
                                                (r.feedback?.length || 0) >
                                                PREVIEW_LENGTH;
                                            const isExpanded = !!expanded[r._id];
                                            const display =
                                                !isLong || isExpanded
                                                    ? r.feedback
                                                    : `${r.feedback.slice(
                                                        0,
                                                        PREVIEW_LENGTH
                                                    )}…`;
                                            return (
                                                <tr
                                                    key={r._id}
                                                    className="hover:bg-gray-50 align-top"
                                                >
                                                    {/* Reviewer */}
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-[#D19F3E]/15 flex items-center justify-center flex-shrink-0">
                                                                <User
                                                                    size={16}
                                                                    className="text-[#D19F3E]"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium text-gray-900 whitespace-nowrap">
                                                                    {r.name}
                                                                </p>
                                                                <a
                                                                    href={`mailto:${r.email}`}
                                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                                >
                                                                    <Mail size={10} />
                                                                    {r.email}
                                                                </a>
                                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                                    <MapPin size={10} />
                                                                    {r.location}
                                                                </p>
                                                                {r.phone && (
                                                                    <a
                                                                        href={`tel:${r.phone.replace(
                                                                            /\D/g,
                                                                            ""
                                                                        )}`}
                                                                        className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                                                                    >
                                                                        <Phone size={10} />
                                                                        {r.phone}
                                                                    </a>
                                                                )}
                                                                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#072342]/70 bg-[#072342]/5 px-1.5 py-0.5 rounded">
                                                                    {USER_TYPE_LABEL[
                                                                        r.userType
                                                                    ] || "Other"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Rating */}
                                                    <td className="py-4 px-4">
                                                        <Stars rating={r.rating} />
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {r.rating}/5
                                                        </p>
                                                    </td>

                                                    {/* Feedback */}
                                                    <td className="py-4 px-4 min-w-[260px] max-w-[480px]">
                                                        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                            {display}
                                                        </p>
                                                        {isLong && (
                                                            <button
                                                                onClick={() =>
                                                                    toggleExpanded(r._id)
                                                                }
                                                                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                            >
                                                                {isExpanded ? (
                                                                    <>
                                                                        Show less{" "}
                                                                        <ChevronUp size={12} />
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        Show more{" "}
                                                                        <ChevronDown size={12} />
                                                                    </>
                                                                )}
                                                            </button>
                                                        )}
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-4 px-4">
                                                        <span
                                                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[r.status]
                                                                }`}
                                                        >
                                                            {r.status}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            {r.status !== "approved" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            r._id,
                                                                            "approved"
                                                                        )
                                                                    }
                                                                    disabled={busyId === r._id}
                                                                    className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-40"
                                                                    title="Approve"
                                                                >
                                                                    <Check size={16} />
                                                                </button>
                                                            )}
                                                            {r.status !== "rejected" && (
                                                                <button
                                                                    onClick={() =>
                                                                        updateStatus(
                                                                            r._id,
                                                                            "rejected"
                                                                        )
                                                                    }
                                                                    disabled={busyId === r._id}
                                                                    className="p-2 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 disabled:opacity-40"
                                                                    title="Reject"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() =>
                                                                    deleteReview(r._id)
                                                                }
                                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {reviews.length === 0 && (
                                    <div className="text-center py-12">
                                        <Star
                                            size={48}
                                            className="mx-auto text-gray-300 mb-3"
                                        />
                                        <p className="text-gray-500">
                                            No reviews in this category
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default WebsiteReviews;