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
} from "lucide-react";
import { Container } from "../components";
import axiosInstance from "../utils/axiosInstance";
import { heroImg } from "../assets";

function Hero() {
  const navigate = useNavigate();
  const searchForm = useForm();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Stats data for the counter animation
  const stats = [
    { value: 1250, label: "Active Listings", suffix: "+", icon: Hammer },
    { value: 98, label: "Sell-Through Rate", suffix: "%", icon: TrendingUp },
    { value: 24, label: "Hour Bidding", suffix: "/7", icon: Clock },
    { value: 4500, label: "Happy Customers", suffix: "+", icon: Star },
  ];

  const handleSearch = (data) => {
    const params = new URLSearchParams();
    if (data.search) params.append("search", data.search);
    if (data.category) params.append("category", data.category);
    navigate(`/auctions?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Background pattern - Subtle industrial grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_70%,transparent_100%)]" />

      {/* Accent gradient blobs */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl" />

      <Container>
        <div className="relative z-10 pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Main Content */}
            <div className="space-y-8">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-3 bg-white shadow-sm border border-gray-100 rounded-full px-4 py-2">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <ShieldCheck size={14} className="text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Trusted by 4,500+ Equipment Dealers
                </span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight">
                  Where{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                      Industry
                    </span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      height="12"
                      viewBox="0 0 300 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9.5C60 3.5 150 1.5 299 9.5"
                        stroke="url(#gradient)"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>{" "}
                  Meets Opportunity
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  The definitive online auction platform for heavy machinery.
                  Bid with confidence on verified equipment from top global
                  manufacturers.
                </p>
              </div>

              {/* Search Form */}
              <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg shadow-gray-100 p-1.5">
                  <div className="flex flex-col lg:flex-row gap-2">
                    <div className="flex-1 relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by make, model, or keyword..."
                        className="w-full bg-gray-50 text-gray-900 placeholder-gray-400 py-4 pl-12 pr-4 rounded-xl border-0 focus:ring-2 focus:ring-orange-500/20 transition-all"
                        {...searchForm.register("search")}
                      />
                    </div>
                    <button
                      type="submit"
                      className="group bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Search Auctions
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Quick filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-gray-500 text-sm">Trending:</span>
                  {["Excavators", "Wheel Loaders", "Dump Trucks", "Cranes"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() =>
                          navigate(`/auctions?category=${filter.toLowerCase()}`)
                        }
                        className="text-sm px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700 transition-all font-medium"
                      >
                        {filter}
                      </button>
                    )
                  )}
                </div>
              </form>

              {/* Stats with counter animation */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                {stats.map((stat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <stat.icon size={16} className="text-orange-500" />
                      <span className="text-2xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Visual Showcase */}
            <div className="relative hidden lg:block">
              <div className="relative w-full max-w-xl mx-auto">
                {/* Main image card with floating elements */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-[4/3]">
                    <img
                      src={heroImg}
                      className="w-full h-full object-cover"
                      alt="Heavy machinery auction showcase"
                    />
                    {/* Gradient overlay to make text readable if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>

                  {/* Floating video button */}
                  <button
                    onClick={() => setVideoModalOpen(true)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                      <Play size={32} className="text-orange-500 ml-1" />
                    </div>
                  </button>

                  {/* Bottom banner */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge size={20} />
                        <span className="font-semibold">Live Demo</span>
                      </div>
                      <span className="text-sm opacity-90">
                        See how bidding works →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating info cards */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-4 w-48 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Truck size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Inspection</p>
                      <p className="font-semibold text-gray-900">Verified Gear</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 w-48 animate-float-delayed">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Wrench size={20} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Support</p>
                      <p className="font-semibold text-gray-900">24/7 Expert</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden">
            <button
              onClick={() => setVideoModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="aspect-video">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Hero Video"
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
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 5s ease-in-out infinite;
          animation-delay: 2.5s;
        }
      `}</style>
    </section>
  );
}

export default Hero;