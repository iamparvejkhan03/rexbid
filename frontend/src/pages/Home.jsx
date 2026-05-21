import { lazy, Suspense } from "react";
import { Hero, Container, Testimonial, HowItWorksCard, LoadingSpinner, AuctionCard, AuctionListItem, CategoryCarousel, HowItWorks } from "../components";
import Marquee from "react-fast-marquee";
import { BadgeCheck, Gavel, Grid, List, Tag, Upload, Filter, UserCog2, LucideVerified, UserPlus, Clock, PhoneCall, Target, Users, ArrowRight, User, CarFront, Hand } from "lucide-react";
import {
    CaseIH,
    Claas,
    Cummins,
    Fendt,
    Freightliner,
    Hitachi,
    JCB,
    JohnDeere,
    Komatsu,
    Kubota,
    Liebherr,
    MasseyFerguson,
    Mercedes,
    NewHolland,
    NokianTyres,
    Peterbilt,
    Scag,
    Skania,
    Stiga,
    Timberjack,
    Toro,
    Toyota,
    Volvo,
} from "../assets";
import { useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const CTA = lazy(() => import('../components/CTA'));
const CategoryIconsSection = lazy(() => import('../components/CategoryIconsSection'));
const TestimonialSection = lazy(() => import('../components/TestimonialSection'));
const About = lazy(() => import('../components/About'));

const trustedBrands = [
    { src: CaseIH, alt: 'Case IH' },
    { src: Claas, alt: 'Claas' },
    { src: Cummins, alt: 'Cummins' },
    { src: Fendt, alt: 'Fendt' },
    { src: Freightliner, alt: 'Freightliner' },
    { src: Hitachi, alt: 'Hitachi' },
    { src: JCB, alt: 'JCB' },
    { src: JohnDeere, alt: 'John Deere' },
    { src: Komatsu, alt: 'Komatsu' },
    { src: Kubota, alt: 'Kubota' },
    { src: Liebherr, alt: 'Liebherr' },
    { src: MasseyFerguson, alt: 'Massey Ferguson' },
    { src: Mercedes, alt: 'Mercedes' },
    { src: NewHolland, alt: 'New Holland' },
    { src: NokianTyres, alt: 'Nokian Tyres' },
    { src: Peterbilt, alt: 'Peterbilt' },
    { src: Scag, alt: 'Scag' },
    { src: Skania, alt: 'Skania' },
    { src: Stiga, alt: 'Stiga' },
    { src: Timberjack, alt: 'Timberjack' },
    { src: Toro, alt: 'Toro' },
    { src: Toyota, alt: 'Toyota' },
    { src: Volvo, alt: 'Volvo' },
];

function Home() {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active'); // 'sold', 'active', 'approved'
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

    // Map tab values to API status values
    const tabStatusMap = {
        'sold': 'sold',
        'active': 'active',
        'approved': 'approved'
    };

    const tabTitles = {
        'active': 'Live Auctions',
        'sold': 'Closed Auctions',
        'approved': 'Upcoming Auctions'
    };

    const tabDescriptions = {
        'active': 'Handpicked heavy equipment. Clear bidding. Verified listings. — find your perfect machine today.',
        'sold': 'Learn from past auctions — browse sold and reserve-not-met listings to bid smarter on your next machine.',
        'approved': 'Plan your next move — browse upcoming heavy equipment auctions and build your bidding strategy in advance.'
    };

    const fetchAuctions = async (tab = activeTab, category = null, limit = 4, sortBy = 'highestBid') => {
        setLoading(true);
        try {
            const status = tabStatusMap[tab];
            const params = new URLSearchParams();
            params.append('status', status);
            params.append('limit', limit.toString());
            params.append('sortBy', sortBy);
            if (category && category !== 'all') {
                params.append('category', category);
            }

            const { data } = await axiosInstance.get(`/api/v1/auctions/top?${params}`);
            if (data.success) {
                setAuctions(data.data.auctions);
            }
        } catch (err) {
            console.error('Fetch auctions error:', err);
            toast.error("Failed to load auctions");
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        fetchAuctions(tab);
    };

    useEffect(() => {
        fetchAuctions('active'); // Load sold auctions by default
    }, []);

    const handleLoadByStatus = () => {
        const status = tabStatusMap[activeTab];
        const params = new URLSearchParams();
        params.append('status', status);
        navigate(`/auctions?${params.toString()}`);
    };

    const handleSearchByTitle = (title) => {
        const params = new URLSearchParams();
        if (title === 'Explore') {
            navigate(`/auctions`);
        } else {
            params.append('search', title);
            navigate(`/auctions?${(params.toString()).toLocaleLowerCase()}`);
        }
    }

    return (
        <>
            <Hero />

            {/* Marquee section */}
            <Container>
                <Marquee speed={50} gradient={false}>
                    <div className="flex gap-8 w-full my-14 mr-8">
                        {
                            trustedBrands.map(brand => (
                                <div key={brand.alt} className="flex items-center justify-center border rounded-lg shadow hover:shadow-lg transition-all border-slate-200 p-4 md:p-5 bg-white">
                                    <img
                                        src={brand.src}
                                        alt={brand.alt}
                                        className="h-6 sm:h-6 md:h-7 lg:h-8 xl:h-9 mix-blend-multiply"
                                    />
                                </div>
                            ))
                        }
                    </div>
                </Marquee>
            </Container>

            {/* Category section */}
            <Suspense fallback={<LoadingSpinner />}>
                <CategoryIconsSection />
            </Suspense>

            {/* Dynamic Auctions section */}
            <Container className="mb-14 flex flex-col">
                <div className="gap-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-y-3">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary order-1">{tabTitles[activeTab]}</h2>
                        <div className="flex items-center  flex-wrap gap-5 order-2 mb-3">
                            <div className="flex space-x-2 bg-white p-1 border border-gray-500/50 rounded-md text-sm">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="options"
                                        id="active"
                                        className="hidden peer"
                                        checked={activeTab === 'active'}
                                        onChange={() => handleTabChange('active')}
                                    />
                                    <label htmlFor="active" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-[#1e2d3b] transition-colors duration-200 peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:via-amber-500 peer-checked:to-amber-600 peer-checked:text-white">
                                        Live
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="options"
                                        id="sold"
                                        className="hidden peer"
                                        checked={activeTab === 'sold'}
                                        onChange={() => handleTabChange('sold')}
                                    />
                                    <label htmlFor="sold" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:via-amber-500 peer-checked:to-amber-600 peer-checked:text-white">
                                        Closed
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="options"
                                        id="approved"
                                        className="hidden peer"
                                        checked={activeTab === 'approved'}
                                        onChange={() => handleTabChange('approved')}
                                    />
                                    <label htmlFor="approved" className="cursor-pointer rounded py-2 px-4 sm:px-8 text-gray-500 transition-colors duration-200 peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:via-amber-500 peer-checked:to-amber-600 peer-checked:text-white">
                                        Upcoming
                                    </label>
                                </div>
                            </div>

                            {/* Add this view mode toggle */}
                            <div className="hidden md:flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
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
                            </div>
                        </div>
                    </div>
                    <p className="text-sm md:text-base text-gray-500 order-2 md:order-3">
                        {tabDescriptions[activeTab]}
                    </p>
                </div>

                {loading ? (
                    // Loading Skeleton based on view mode
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7 mt-8">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
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
                    ) : (
                        // List View Loading Skeleton
                        <div className="space-y-2 mt-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                                    <div className="flex flex-col lg:flex-row gap-5">
                                        <div className="lg:w-64">
                                            <div className="h-48 bg-gray-200 rounded-lg"></div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                {Array.from({ length: 4 }).map((_, i) => (
                                                    <div key={i} className="space-y-2">
                                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    <>
                        {auctions.length > 0 ? (
                            viewMode === "grid" ? (
                                // Grid View
                                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-7 gap-y-10 mt-8">
                                    {auctions.map((auction) => (
                                        <AuctionCard
                                            key={auction._id}
                                            auction={auction}
                                        />
                                    ))}
                                </section>
                            ) : (
                                // List View using AuctionListItem component
                                <div className="space-y-2 mt-8">
                                    {auctions.map((auction) => (
                                        <AuctionListItem
                                            key={auction._id}
                                            auction={auction}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="text-center py-16 text-gray-500">
                                <Filter size={48} className="mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No auctions found</p>
                                <p className="text-sm">Try adjusting your filters or search terms</p>
                            </div>
                        )}

                        {/* Add this View More button section */}
                        {auctions.length > 0 && (
                            <button
                                onClick={handleLoadByStatus}
                                className="px-8 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white font-medium rounded-lg hover:bg-gradient-to-r hover:from-amber-500 hover:via-amber-600 hover:to-amber-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 mt-10 mx-auto"
                            >
                                View More
                            </button>
                        )}
                    </>
                )}
            </Container>

            {/* Who we are section */}
            <Container className="mb-8 md:mb-0">
                <Suspense fallback={<LoadingSpinner />}>
                    <About />
                </Suspense>
            </Container>

            <Container className="">
                <HowItWorks />
            </Container>

            {/* Testimonials */}
            <Container>
                <Suspense fallback={<LoadingSpinner />}>
                    <TestimonialSection />
                </Suspense>
            </Container>

            <CTA />
        </>
    )
}

export default Home;