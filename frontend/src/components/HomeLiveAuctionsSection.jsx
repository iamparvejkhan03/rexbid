import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, ArrowRight, Gavel } from "lucide-react";
import { Container, AuctionCard, LoadingSpinner } from "./index";
import axiosInstance from "../utils/axiosInstance";
import { useLiveAuctionTicks } from "../hooks/useLiveAuctionTicks";

function HomeAuctionsSection() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState("active");

    const sectionRef = useRef(null);
    const navigate = useNavigate();

    const [liveAuctions, setLiveAuctions] = useState([]);
    useEffect(() => { setLiveAuctions(auctions); }, [auctions]);
    useLiveAuctionTicks(setLiveAuctions);

    // Map tab values to API status values
    const tabStatusMap = {
        'sold': 'sold',
        'active': 'active',
        'approved': 'upcoming',
        'ending_soon': 'ending_soon',
    };

    const tabTitles = {
        'ending_soon': 'Ending Soon',
        'active': 'Live Listings',
        'sold': 'Sold Listings',
        'approved': 'Upcoming Listings'
    };

    const tabDescriptions = {
        'ending_soon': 'These listings are ending within the next 24 hours. Don’t miss your chance to bid.',
        'active': 'Live listings from Irish sellers. Heavy machinery, plant equipment, and commercial vehicles – ready to inspect, ready to deal.',
        'sold': 'See what sold and what didn’t. Real closing prices from real Irish sellers. Sharpen your bid for the next live listing.',
        'approved': 'Coming soon to RexBid. Get early access to listings before they go live. Build your shortlist and move fast when the timer starts.'
    };

    // ============================================================
    // FETCH AUCTIONS
    // ============================================================

    const fetchAuctions = async (
        tab = activeTab,
        category = null,
        limit = 4,
        sortBy = "highestBid"
    ) => {
        setLoading(true);
        try {
            const status = tabStatusMap[tab];
            const params = new URLSearchParams();
            params.append("status", status);
            params.append("limit", limit.toString());
            params.append("sortBy", sortBy);
            if (category && category !== "all") {
                params.append("category", category);
            }

            const { data } = await axiosInstance.get(
                `/api/v1/auctions/top?${params}`
            );
            if (data.success) {
                setAuctions(data.data.auctions);
            } else {
                setAuctions([]);
            }
        } catch (err) {
            console.error("Fetch auctions error:", err);
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions("active");
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchAuctions(tab);
    };

    const handleLoadByStatus = () => {
        const status = tabStatusMap[activeTab];
        const params = new URLSearchParams();
        params.append("status", status);
        navigate(`/auctions?${params.toString()}`);
    };

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
    }, [loading]);

    // ============================================================
    // LOADING SKELETON
    // ============================================================

    if (loading && liveAuctions.length === 0) {
        return (
            <Container className="my-14">
                <div className="mb-8">
                    <div className="h-10 w-72 animate-pulse rounded bg-gray-200" />
                    <div className="mt-3 h-4 w-96 animate-pulse rounded bg-gray-200" />
                </div>

                <div className="grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {[...Array(4)].map((_, index) => (
                        <div
                            key={index}
                            className="flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white p-3 shadow-sm"
                        >
                            <div className="h-64 animate-pulse rounded-[18px] bg-gray-100" />
                            <div className="space-y-3 p-2 pt-5">
                                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                    <div className="h-16 animate-pulse rounded-xl bg-gray-100" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    // ============================================================
    // MAIN SECTION
    // ============================================================

    return (
        <section ref={sectionRef} className="relative overflow-hidden">
            {/* Background accent */}
            <div className="pointer-events-none absolute -right-40 top-20 h-[450px] w-[450px] rounded-full bg-[#C59D55]/[0.045] blur-[100px]" />

            <Container className="">
                {/* =================================================
                    HEADER
                ================================================== */}

                <div
                    className={`transition-all duration-1000 ease-out ${visible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0"
                        }`}
                >
                    <div className="flex items-center justify-between flex-wrap gap-y-3">
                        <h2 className="max-w-2xl text-4xl font-black leading-[1.05] tracking-[-0.035em] text-[#111315] sm:text-5xl lg:text-[48px]">
                            {tabTitles[activeTab]}
                            <span className="ml-2 font-medium italic text-gray-400">
                                Auctions
                            </span>
                        </h2>

                        {/* Tab Switcher */}
                        <div className="flex items-center  flex-wrap gap-5 order-2 mb-3">
                            <div className="flex rounded-full border border-gray-200 p-1 bg-gray-50/50">
                                <button
                                    onClick={() => handleTabChange('active')}
                                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${activeTab === 'active'
                                        ? 'bg-[#D19F3E] text-white shadow-sm'
                                        : 'text-gray-600 hover:text-[#D19F3E]'
                                        }`}
                                >
                                    Live
                                </button>
                                <button
                                    onClick={() => handleTabChange('sold')}
                                    className={`px-5 py-2 text-sm font-medium rounded-full transition-all ${activeTab === 'sold'
                                        ? 'bg-[#D19F3E] text-white shadow-sm'
                                        : 'text-gray-600 hover:text-[#D19F3E]'
                                        }`}
                                >
                                    Sold
                                </button>
                            </div>

                            {/* Add this view mode toggle */}
                            {/* <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-2 rounded transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                    title="Grid View"
                                >
                                    <Grid size={18} className={viewMode === "grid" ? "text-orange-600" : "text-gray-500"} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-2 rounded transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
                                    title="List View"
                                >
                                    <List size={18} className={viewMode === "list" ? "text-orange-600" : "text-gray-500"} />
                                </button>
                            </div> */}
                        </div>
                    </div>

                    {/* Description */}
                    <p
                        className={`mt-3 max-w-2xl text-sm leading-7 text-gray-500 transition-all delay-150 duration-1000 ease-out md:text-base ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-5 opacity-0"
                            }`}
                    >
                        {tabDescriptions[activeTab]}
                    </p>
                </div>

                {/* =================================================
                    AUCTION GRID
                ================================================== */}

                {liveAuctions.length > 0 ? (
                    <>
                        <section className="mt-10 grid grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {liveAuctions.map((auction, index) => (
                                <div
                                    key={auction._id}
                                    className={`transition-all duration-1000 ease-out ${visible
                                        ? "translate-y-0 opacity-100"
                                        : "translate-y-10 opacity-0"
                                        }`}
                                    style={{
                                        transitionDelay: `${300 + index * 150}ms`,
                                    }}
                                >
                                    <AuctionCard auction={auction} />
                                </div>
                            ))}
                        </section>

                        {/* =================================================
                            VIEW MORE
                        ================================================== */}

                        <div
                            className={`my-12 flex justify-center transition-all delay-[900ms] duration-1000 ease-out ${visible
                                ? "translate-y-0 opacity-100"
                                : "translate-y-6 opacity-0"
                                }`}
                        >
                            <button
                                onClick={handleLoadByStatus}
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
                    </>
                ) : (
                    <div
                        className={`mt-10 text-center py-16 text-gray-500 transition-all duration-1000 ease-out ${visible
                            ? "translate-y-0 opacity-100"
                            : "translate-y-8 opacity-0"
                            }`}
                    >
                        <Filter
                            size={48}
                            className="mx-auto mb-4 text-gray-300"
                        />
                        <p className="text-lg font-medium">
                            No auctions found
                        </p>
                        <p className="text-sm">
                            Try adjusting your filters or search terms
                        </p>
                    </div>
                )}
            </Container>
        </section>
    );
}

export default HomeAuctionsSection;