import { useEffect, useState } from "react";
import { Container, LoadingSpinner } from "../components";
import { Star, MapPin, Quote, Users, Sparkles, Loader2 } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";

const USER_TYPE_LABEL = {
    bidder: "Bidder",
    seller: "Seller",
    other: "Client",
};

// Deterministic pastel color from name
const AVATAR_COLORS = [
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-emerald-100 text-emerald-700",
    "bg-purple-100 text-purple-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
];

function initialsOf(name = "") {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase() || "?";
}

function avatarColor(name = "") {
    const idx = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

function Stars({ rating, size = 16 }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
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

function WhatOurClientsSay() {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ average: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);

    const fetchReviews = async (pageNum = 1) => {
        try {
            if (pageNum === 1) setLoading(true);
            else setLoadingMore(true);

            const { data } = await axiosInstance.get(
                `/api/v1/website-review/approved?page=${pageNum}&limit=12`
            );

            if (data.success) {
                setReviews((prev) =>
                    pageNum === 1 ? data.data.reviews : [...prev, ...data.data.reviews]
                );
                setSummary(data.data.summary);
                setPages(data.data.pagination.pages);
                setPage(pageNum);
            }
        } catch (error) {
            console.error("Fetch reviews error:", error);
            toast.error("Failed to load reviews");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchReviews(1);
    }, []);

    return (
        <section className="bg-[#FAFAFA] min-h-screen pt-16 md:pt-20 pb-16">
            {/* Hero */}
            <div className="bg-[#072342] text-white py-14 md:py-16">
                <Container>
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D19F3E]/20 backdrop-blur-sm border border-[#D19F3E]/40 mb-4">
                            <Sparkles size={12} className="text-[#D19F3E]" />
                            <span className="text-[10px] font-semibold tracking-wider text-[#D19F3E] uppercase">
                                Trusted by Our Community
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                            What Our Clients Say
                        </h1>
                        <p className="text-white/70 mt-4 text-sm md:text-base">
                            Real feedback from buyers and sellers who use RexBid.
                        </p>

                        {/* Summary */}
                        {summary.total > 0 && (
                            <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-x-8 gap-y-4 bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-bold text-[#D19F3E]">
                                        {summary.average.toFixed(1)}
                                    </span>
                                    <div>
                                        <Stars rating={Math.round(summary.average)} size={18} />
                                        <p className="text-white/60 text-xs mt-1">
                                            out of 5
                                        </p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-white/10 hidden sm:block" />
                                <div className="text-center sm:text-left">
                                    <p className="text-2xl font-bold">
                                        {summary.total}
                                    </p>
                                    <p className="text-white/60 text-xs">
                                        verified review{summary.total !== 1 ? "s" : ""}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </Container>
            </div>

            {/* Grid */}
            <Container className="pt-10 md:pt-14">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-16">
                        <Users size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">
                            No reviews yet. Be the first to{" "}
                            <a href="/rate-us" className="text-[#D19F3E] underline">
                                rate us
                            </a>
                            .
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((r) => (
                                <div
                                    key={r._id}
                                    className="relative bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow"
                                >
                                    <Quote
                                        size={32}
                                        className="absolute top-4 right-4 text-[#D19F3E]/15"
                                    />
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${avatarColor(
                                                r.name
                                            )}`}
                                        >
                                            {initialsOf(r.name)}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-[#072342] truncate">
                                                {r.name}
                                            </p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin size={11} />
                                                {r.location}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <Stars rating={r.rating} />
                                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D19F3E] bg-[#D19F3E]/10 px-2 py-1 rounded">
                                            {USER_TYPE_LABEL[r.userType] || "Client"}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                        {r.feedback}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {page < pages && (
                            <div className="flex justify-center mt-10">
                                <button
                                    onClick={() => fetchReviews(page + 1)}
                                    disabled={loadingMore}
                                    className="bg-[#072342] hover:bg-[#051a30] text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-60"
                                >
                                    {loadingMore && (
                                        <Loader2 size={16} className="animate-spin" />
                                    )}
                                    {loadingMore ? "Loading..." : "Load More Reviews"}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </Container>
        </section>
    );
}

export default WhatOurClientsSay;