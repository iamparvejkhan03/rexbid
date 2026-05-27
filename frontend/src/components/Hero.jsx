import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Truck,
  Search,
  ArrowRight,
  Gauge,
  ShieldCheck,
  Hammer,
  Wrench,
  Clock,
  MapPin,
  TrendingUp,
  Star,
  Play,
  X,
  Timer,
  Gavel,
  Eye,
  CheckCircle,
  Store,
  Loader2,
} from "lucide-react";
import { Container } from "../components";
import axiosInstance from "../utils/axiosInstance";
import { heroImg } from "../assets";
import { extractYouTubeId } from "./YouTubeEmbed";

function Hero() {
  const navigate = useNavigate();
  const searchForm = useForm({
    defaultValues: {
      search: '',
    }
  });
  const [categories, setCategories] = useState([]);
  const [hotListing, setHotListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const videoId = hotListing?.videoLink ? extractYouTubeId(hotListing?.videoLink) : null;

  const formatPrice = (price) => {
    return `kr ${price.toLocaleString()}`;
  };

  // Helper: calculate remaining time from endDate
  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (3600000));
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Fetch hot listing on mount
  useEffect(() => {
    const fetchHotListing = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/v1/auctions/hot');
        if (response.data.success) {
          setHotListing(response.data.data.auction);
          setError(null);
        } else {
          setError('No featured listing available');
        }
      } catch (err) {
        console.error('Failed to fetch hot listing:', err);
        setError('Unable to load featured item');
      } finally {
        setLoading(false);
      }
    };
    fetchHotListing();
  }, []);

  // Stats data with updated icons
  const stats = [
    { value: 1250, label: "Active Listings", suffix: "+", icon: Hammer },
    { value: 98, label: "Sell-Through Rate", suffix: "%", icon: TrendingUp },
    { value: 24, label: "Hour Bidding", suffix: "/7", icon: Clock },
    { value: 4500, label: "Happy Customers", suffix: "+", icon: Star },
  ];

  const handleSearch = (data) => {
    const params = new URLSearchParams();
    if (data.search) params.append("search", data.search);
    if (data.category && data.category !== "all") params.append("category", data.category);
    navigate(`/auctions?${params.toString()}`);
  };

  // Sample categories for the dropdown
  const auctionCategories = [
    { value: "all", label: "All Categories" },
    { value: "excavators", label: "Excavators" },
    { value: "wheel-loaders", label: "Wheel Loaders" },
    { value: "dump-trucks", label: "Dump Trucks" },
    { value: "cranes", label: "Cranes" },
    { value: "bulldozers", label: "Bulldozers" },
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#072342]">
      {/* Modern geometric background pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#D19F3E" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="glow" cx="30%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#D19F3E" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#072342" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          <rect width="100%" height="100%" fill="url(#glow)" />
        </svg>
      </div>

      {/* Floating accent blobs */}
      <div className="absolute top-20 -left-32 w-80 h-80 bg-[#D19F3E] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-20 -right-32 w-96 h-96 bg-[#D19F3E] rounded-full mix-blend-overlay filter blur-3xl opacity-10 animate-pulse delay-1000" />

      <Container>
        <div className="relative z-10 pt-28 pb-12 lg:pt-40 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column - Main Content */}
            <div className="space-y-5 md:space-y-8">
              {/* Trust Badge - Redesigned with brand colors */}
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-5 py-1">
                <div className="w-7 h-7 rounded-full bg-[#D19F3E]/20 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-[#D19F3E]" />
                </div>
                <span className="text-sm font-light text-gray-200">
                  Trusted by Thousands Across Ireland
                </span>
              </div>

              {/* Headline - Bold and dynamic */}
              <div className="space-y-5">
                <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight tracking-tight">
                  Ireland’s{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                      Marketplace
                    </span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="14"
                      viewBox="0 0 300 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 10.5C60 4.5 150 2.5 299 10.5"
                        stroke="#D19F3E"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray="6 6"
                      />
                    </svg>
                  </span>{" "}
                  <span className="text-gray-300">for Machinery & Commercials</span>
                </h1>
                <p className="md:text-lg text-base text-gray-300 leading-relaxed max-w-lg">
                  Browse quality machinery, commercials, tractors, and vehicles from trusted sellers throughout Ireland with secure bidding and straightforward transactions.
                </p>
              </div>

              {/* Enhanced Search Form with Category Dropdown */}
              <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-5">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-2">
                  <div className="flex flex-col lg:flex-row gap-2">
                    <div className="flex-1 relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D19F3E] transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by make, model, or keyword..."
                        className="w-full bg-gray-900/50 text-white placeholder-gray-400 py-4 pl-12 pr-4 rounded-xl border-0 focus:ring-2 focus:ring-[#D19F3E]/50 transition-all"
                        {...searchForm.register("search")}
                      />
                    </div>
                    {/* <div className="relative">
                      <select
                        className="appearance-none bg-gray-900/50 text-white py-4 px-5 pr-10 rounded-xl border-0 focus:ring-2 focus:ring-[#D19F3E]/50 transition-all cursor-pointer"
                        {...searchForm.register("category")}
                      >
                        {auctionCategories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    </div> */}
                    <button
                      type="submit"
                      className="group bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-[#072342] px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-[#D19F3E]/30 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Search
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Trending filters - Modern chip design */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-400 text-sm font-medium">🔥 Popular:</span>
                  {["Cars", "Tractors", "Telehandlers", "Dumpers", "Diggers", "Trailers", "Vans"].map(
                    (filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => searchForm.setValue('search', filter)}
                        className="text-sm px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-[#D19F3E] hover:text-[#072342] hover:border-[#D19F3E] transition-all font-medium"
                      >
                        {filter}
                      </button>
                    )
                  )}
                </div>
              </form>

              {/* Stats - Elegant dark theme */}
              {/* <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-6 border-t border-white/10">
                {stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1 group">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#D19F3E]/10 group-hover:bg-[#D19F3E]/20 transition-colors">
                        <stat.icon size={16} className="text-[#D19F3E]" />
                      </div>
                      <span className="text-xl font-bold text-white">
                        {stat.value.toLocaleString()}
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div> */}
            </div>

            {/* Right Column - Dynamic Hot Listing Card */}
            <div className="relative hidden lg:block">
              <div className="relative w-full max-w-xl mx-auto">
                {loading ? (
                  // Loading state
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center">
                    <Loader2 size={48} className="text-[#D19F3E] animate-spin mb-4" />
                    <p className="text-gray-300">Loading featured listing...</p>
                  </div>
                ) : error || !hotListing ? (
                  // Error / no listing state
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center">
                    <p className="text-gray-300 mb-4">{error || 'No hot listing available'}</p>
                    <button
                      onClick={() => navigate('/auctions')}
                      className="bg-[#D19F3E] text-[#072342] px-6 py-2 rounded-lg font-medium"
                    >
                      Browse all listings
                    </button>
                  </div>
                ) : (
                  // Actual hot listing card
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[#D19F3E]/10 hover:shadow-xl">
                    {/* Image Container */}
                    <div className="relative aspect-[5/3] overflow-hidden">
                      <img
                        src={hotListing.photos?.[0]?.url || heroImg}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        alt={hotListing.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#072342] via-transparent to-transparent" />

                      {/* Hot Item Badge */}
                      <div className="absolute top-4 left-4 bg-[#D19F3E] text-[#072342] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                        <Gavel size={12} />
                        <span>HOT ITEM</span>
                      </div>

                      {/* Video Play Button (if videoLink exists) */}
                      {hotListing.videoLink && (
                        <button
                          onClick={() => setVideoModalOpen(true)}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group"
                        >
                          <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 group-hover:bg-[#D19F3E]">
                            <Play size={28} className="text-[#072342] ml-1 group-hover:text-white transition-colors" />
                          </div>
                        </button>
                      )}
                    </div>

                    {/* Auction Details */}
                    <div className="p-6 space-y-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">
                            {hotListing.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <MapPin size={14} />
                            <span>{hotListing.location || 'Ireland'}</span>
                            {hotListing._id && (
                              <>
                                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle size={12} />
                          <span>Verified</span>
                        </div>
                      </div>

                      {/* Bid Information */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-gray-400 text-xs mb-1">Current Bid</p>
                          <p className="text-xl font-bold text-white">
                            {formatPrice(hotListing.currentPrice)}
                          </p>
                          <p className="text-[#D19F3E] text-xs mt-1">
                            {hotListing.bidCount} {hotListing.bidCount === 1 ? 'bid' : 'bids'}
                          </p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-3">
                          <p className="text-gray-400 text-xs mb-1">Time Left</p>
                          <div className="flex items-center gap-2">
                            <Timer size={18} className="text-[#D19F3E]" />
                            <p className="text-xl font-bold text-white">
                              {getTimeRemaining(hotListing.endDate)}
                            </p>
                          </div>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(hotListing.endDate) > new Date() ? 'Ends in' : 'Ended'} {getTimeRemaining(hotListing.endDate)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate(`/auction/${hotListing._id}`)}
                          className="flex-1 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-[#072342] py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-[#D19F3E]/30 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <Gavel size={18} />
                          Place Bid
                        </button>
                        <button
                          onClick={() => setVideoModalOpen(true)}
                          className="px-5 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                          <Eye size={18} />
                          Preview
                        </button>
                      </div>

                      {/* Seller / Commission Note */}
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
                        <ShieldCheck size={14} className="text-[#D19F3E]" />
                        <span>3% seller commission • No buyer fees</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Trust Indicators - unchanged */}
                <div className="absolute -top-6 -right-6 bg-[#072342] border border-white/20 rounded-2xl shadow-xl p-3 w-44 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D19F3E]/20 rounded-xl flex items-center justify-center">
                      <Store size={20} className="text-[#D19F3E]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Inspection</p>
                      <p className="font-semibold text-white text-sm">Verified Seller</p>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-6 -left-6 bg-[#072342] border border-white/20 rounded-2xl shadow-xl p-3 w-44 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D19F3E]/20 rounded-xl flex items-center justify-center">
                      <Wrench size={20} className="text-[#D19F3E]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Support</p>
                      <p className="font-semibold text-white text-sm">24/7 Expert</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Video Modal - unchanged except dynamic src */}
      {videoModalOpen && hotListing?.videoLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-[#D19F3E]/30">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-[#D19F3E]/20 rounded-full flex items-center justify-center text-white hover:bg-[#D19F3E]/40 transition-colors backdrop-blur"
            >
              <X size={20} />
            </button>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="Listing Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 5s ease-in-out infinite;
          animation-delay: 2.5s;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </section>
  );
}

export default Hero;