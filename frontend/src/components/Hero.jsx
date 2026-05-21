import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
    Tractor,
    Search,
    ArrowRight,
    Truck,
    Cog,
    Mountain,
    Waves,
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
    const [activeEquipment, setActiveEquipment] = useState(0);

    // Equipment showcase rotation
    const equipmentTypes = [
        { icon: Tractor, name: "Tractors", desc: "Agricultural" },
        { icon: Mountain, name: "Excavators", desc: "Heavy Duty" },
        { icon: Truck, name: "Dump Trucks", desc: "Articulated" },
        { icon: Cog, name: "Dozers", desc: "Crawler" },
        { icon: Waves, name: "Cranes", desc: "Mobile" },
    ];

    const handleSearch = (data) => {
        const params = new URLSearchParams();
        if (data.search) params.append('search', data.search);
        if (data.category) params.append('category', data.category);
        navigate(`/auctions?${params.toString()}`);
    };

    return (
        <section className="relative min-h-screen bg-slate-900 overflow-hidden">
            {/* <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"> */}
            {/* Industrial Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>

            {/* Dynamic Gradient Orbs */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-orange-600/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Industrial Mesh Lines */}
            <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>

            <Container>
                <div className="relative z-10 pt-28 pb-16 lg:pt-36 lg:pb-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Main Content */}
                        <div className="space-y-5 md:space-y-8">
                            {/* Premium Badge */}
                            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
                                <div className="flex -space-x-2">
                                    {[Tractor, Truck].map((Icon, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                                            <Icon size={14} className="text-amber-400" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-white/90">
                                    The Marketplace for Heavy Machinery
                                </span>
                            </div>

                            {/* Dynamic Headline */}
                            <div className="space-y-4">
                                <h1 className="text-[40px] lg:text-6xl font-bold text-white leading-tight">
                                    <span className="block">Your Next</span>
                                    <span className="relative inline-block mt-2">
                                        <span className="relative z-10 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-transparent bg-clip-text">
                                            Heavy Machine
                                        </span>
                                        <span className="absolute -bottom-2 left-0 w-full h-3 bg-amber-500/30 blur-md" />
                                    </span>
                                    <span className="block mt-2">Is Here</span>
                                </h1>

                                {/* Description */}
                                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                                    Bid on verified equipment from one of the world's best digital auction house. From excavators to cranes, find machinery from leading manufacturers—all in one place.
                                </p>
                            </div>

                            {/* Advanced Search Form */}
                            <form onSubmit={searchForm.handleSubmit(handleSearch)} className="space-y-4">
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                                    <div className="flex flex-col lg:flex-row gap-2">
                                        {/* Search Input */}
                                        <div className="flex-1 relative group">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5 group-focus-within:text-amber-400 transition-colors" />
                                            <input
                                                type="text"
                                                placeholder="Search by make, model, or keyword..."
                                                className="w-full bg-white/5 text-white placeholder-white/40 py-4 pl-12 pr-4 rounded-xl border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                                                {...searchForm.register('search')}
                                            />
                                        </div>

                                        {/* Search Button */}
                                        <button
                                            type="submit"
                                            className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                                        >
                                            <span className="relative z-10 flex items-center gap-2 justify-center">
                                                Search
                                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Filters */}
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-white/60 text-sm">Popular:</span>
                                    {['Excavators', 'Wheel Loaders', 'Dump Trucks', 'Cranes'].map((filter) => (
                                        <button
                                            key={filter}
                                            onClick={() => navigate(`/auctions?category=${filter.toLowerCase()}`)}
                                            className="text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-amber-500/20 hover:border-amber-500/30 hover:text-white transition-all"
                                        >
                                            {filter}
                                        </button>
                                    ))}
                                </div>
                            </form>

                        </div>

                        {/* Right Column - Visual Showcase */}
                        <div className="relative hidden lg:block">
                            {/* Main Equipment Image Placeholder */}
                            <div className="relative w-full max-w-xl mx-auto aspect-square rounded-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src={heroImg}
                                        className="w-full h-full object-cover brightness-75"
                                        alt=""
                                    />
                                </div>

                                {/* Floating Stats Cards */}
                                <div className="absolute top-10 left-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 animate-float">
                                    <div className="text-white font-bold">99%</div>
                                    <div className="text-white/70 text-sm">User Satisfaction</div>
                                </div>

                                <div className="absolute bottom-10 right-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 animate-float-delayed">
                                    <div className="text-white font-bold">24/7</div>
                                    <div className="text-white/70 text-sm">Online Bidding</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
      `}</style>
        </section>
    );
}

export default Hero;