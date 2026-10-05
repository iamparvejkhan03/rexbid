import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Filter, Gavel, Grid, List, Star } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import AuctionCard from "./AuctionCard";
import AuctionListItem from "./AuctionListItem";
import Container from "./Container";
import { useAuth } from "../contexts/AuthContext";
import { useLiveAuctionTicks } from "../hooks/useLiveAuctionTicks";

const FeaturedListings = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [sortBy, setSortBy] = useState("highestBid");
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 8 });
    const [category, setCategory] = useState("all");
    const [visible, setVisible] = useState(false);

    const [liveAuctions, setLiveAuctions] = useState([]);
    useEffect(() => { setLiveAuctions(listings); }, [listings]);
    useLiveAuctionTicks(setLiveAuctions);

    const sectionRef = useRef(null);

    const { user } = useAuth();
    const userCurrency = user?.currency || 'EUR';

    const fetchFeaturedListings = async (page = 1, reset = true) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append("limit", pagination.limit.toString());
            params.append("page", page.toString());
            params.append("sortBy", sortBy);
            params.append("currency", userCurrency);
            if (category !== "all") params.append("category", category);

            const { data } = await axiosInstance.get(`/api/v1/auctions/featured?${params}`);
            if (data.success) {
                if (reset) {
                    setListings(data.data.listings);
                } else {
                    setListings((prev) => [...prev, ...data.data.listings]);
                }
                setPagination((prev) => ({
                    ...prev,
                    page,
                    total: data.data.pagination.total,
                    pages: data.data.pagination.pages,
                }));
            }
        } catch (error) {
            console.error("Fetch featured listings error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeaturedListings(1, true);
    }, [sortBy, category]);

    // ============================================================
    // INTERSECTION OBSERVER
    //
    // Only start observing AFTER loading has finished.
    // ============================================================

    useEffect(() => {
        if (loading) return;

        const element = sectionRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [loading, liveAuctions.length]);

    const handleLoadMore = () => {
        if (pagination.page < pagination.pages) {
            fetchFeaturedListings(pagination.page + 1, false);
        }
    };

    const handleViewAll = () => {
        navigate("/auctions?featured=true");
    };

    if (loading && liveAuctions.length === 0) {
        return (
            <Container className="my-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded mb-4"></div>
                            <div className="flex justify-between">
                                <div className="h-6 bg-gray-200 rounded w-20"></div>
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    if (!loading && liveAuctions.length === 0) {
        return (
            <Container className="pt-14">
                <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight my-2 flex items-center gap-2">
                    <Star className="text-[#D19F3E]" size={28} />
                    Featured{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                            Listings
                        </span>
                        <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                            <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                        </svg>
                    </span>
                </h2>
                {/* <p className="text-gray-500 mt-1">
                        Premium machinery and vehicles handpicked by RexBid
                    </p> */}
                <div className="text-center py-16 text-gray-500">
                    <Star size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No featured listings available</p>
                    <p className="text-sm">Check back soon for premium items</p>
                </div>
            </Container>
        );
    }

    return (
        <section ref={sectionRef} className="relative [overflow:clip]">
            {/* Background accent */}
            {/* <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" /> */}

            <Container className="pt-5 pb-8 md:py-10">
                <div
                    className={`transition-all duration-1000 ease-out ${visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            {/* <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center gap-2">
                                <Star className="text-[#D19F3E]" size={28} />
                                Featured Listings
                            </h2> */}
                            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight md:my-2 flex items-center gap-2">
                                <Star className="text-[#D19F3E]" size={28} />
                                Featured{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                        Listings
                                    </span>
                                    <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                    </svg>
                                </span>
                            </h2>
                            {/* <p className="text-gray-500 mt-1">
                                Premium machinery and vehicles handpicked by RexBid
                            </p> */}
                        </div>
                    </div>
                </div>

                {/* Listings grid/list */}
                {viewMode === "grid" ? (
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10">
                        {liveAuctions.map((listing, index) => (
                            <div
                                key={listing._id}
                                className={`transition-all duration-1000 ease-out ${visible
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                                    }`}
                                style={{
                                    transitionDelay: `${300 + index * 150}ms`,
                                }}
                            >
                                <AuctionCard auction={listing} />
                            </div>
                        ))}
                    </section>
                ) : (
                    <div className="space-y-4">
                        {liveAuctions.map((listing, index) => (
                            <div
                                key={listing._id}
                                className={`transition-all duration-1000 ease-out ${visible
                                    ? "translate-y-0 opacity-100"
                                    : "translate-y-10 opacity-0"
                                    }`}
                                style={{
                                    transitionDelay: `${300 + index * 150}ms`,
                                }}
                            >
                                <AuctionListItem auction={listing} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Load More / View All buttons */}
                <div
                    className={`flex justify-center gap-4 mt-10 transition-all delay-[900ms] duration-1000 ease-out ${visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-6 opacity-0"
                        }`}
                >
                    {pagination.page < pagination.pages && (
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                        >
                            {loading ? "Loading..." : "Load More"}
                        </button>
                    )}
                    <button
                        onClick={handleViewAll}
                        className="group flex items-center gap-2 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white font-medium rounded-lg hover:bg-gradient-to-r hover:from-[#D19F3E]/90 hover:to-[#E8B86B]/90 px-8 py-3 transition-all duration-300 hover:bg-[#e4a000] hover:shadow-[0_0_35px_rgba(197,157,85,0.25)] focus:outline-none focus:ring-2 focus:ring-[#F5B51B] focus:ring-offset-2"
                    >
                        <Gavel size={17} />
                        <span>View More</span>
                        <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        />
                    </button>
                </div>
            </Container>
        </section>
    );
};

export default FeaturedListings;