import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Grid, List, Star } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import AuctionCard from "./AuctionCard";
import AuctionListItem from "./AuctionListItem";
import Container from "./Container";
import { useAuth } from "../contexts/AuthContext";

const FeaturedListings = () => {
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState("grid"); // grid or list
    const [sortBy, setSortBy] = useState("highestBid");
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 8 });
    const [category, setCategory] = useState("all");

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

    const handleLoadMore = () => {
        if (pagination.page < pagination.pages) {
            fetchFeaturedListings(pagination.page + 1, false);
        }
    };

    const handleViewAll = () => {
        navigate("/auctions?featured=true");
    };

    if (loading && listings.length === 0) {
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

    if (!loading && listings.length === 0) {
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
                    <p className="text-gray-500 mt-1">
                        Premium machinery and vehicles handpicked by RexBid
                    </p>
                <div className="text-center py-16 text-gray-500">
                    <Star size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No featured listings available</p>
                    <p className="text-sm">Check back soon for premium items</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className="pb-14">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    {/* <h2 className="text-3xl md:text-4xl font-bold text-primary flex items-center gap-2">
                        <Star className="text-[#D19F3E]" size={28} />
                        Featured Listings
                    </h2> */}
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
                    <p className="text-gray-500 mt-1">
                        Premium machinery and vehicles handpicked by RexBid
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort dropdown */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-[#D19F3E] focus:border-[#D19F3E]"
                    >
                        <option value="highestBid">Highest Price</option>
                        <option value="mostBids">Most Bids</option>
                        <option value="endingSoon">Ending Soon</option>
                        <option value="newest">Newly Listed</option>
                    </select>
                </div>
            </div>

            {/* Listings grid/list */}
            {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10">
                    {listings.map((listing) => (
                        <AuctionCard key={listing._id} auction={listing} />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <AuctionListItem key={listing._id} auction={listing} />
                    ))}
                </div>
            )}

            {/* Load More / View All buttons */}
            <div className="flex justify-center gap-4 mt-10">
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
                    className="px-8 py-3 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-white font-medium rounded-lg hover:bg-gradient-to-r hover:from-[#D19F3E]/90 hover:to-[#E8B86B]/90 focus:outline-none focus:ring-2 focus:ring-[#E8B86B] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                    View More
                </button>
            </div>
        </Container>
    );
};

export default FeaturedListings;