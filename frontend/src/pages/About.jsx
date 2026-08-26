import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    ShieldCheck,
    Gavel,
    Globe2,
    BarChart3,
    Users,
    CheckCircle2,
    PackageCheck,
    TrendingUp,
    Upload,
    UserCog2,
    BadgeCheck,
    UserPlus,
    Clock,
    FolderEdit,
    Handshake,
    ListChecks,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Container, HowItWorksCard } from "../components";
import { aboutDigger, aboutExcavator, aboutHandle } from "../assets";
import HowItWorksForSellers from "../components/HowItWorksForSellers";

const HowItWorksSelling = [
    {
        icon: <Upload />,
        title: 'Create Your Listing',
        description: 'Upload your item details, photos and videos. Set your auction preferences and choose when bidding ends.'
    },
    {
        icon: <FolderEdit />,
        title: 'Manage Your Auction',
        description: `Your item is advertised to potential buyers, who can place bids and offers throughout the auction period.`
    },
    {
        icon: <Handshake />,
        title: 'Complete the Sale',
        description: `When the auction closes, the highest bidder wins. You are paid instantly when collection / delivery is confirmed.`
    },
];

const HowItWorksBuying = [
    {
        icon: <ListChecks />,
        title: 'Browse Listings',
        description: 'Explore available vehicles, machinery and equipment from private sellers and businesses.'
    },
    {
        icon: <Gavel />,
        title: 'Bid With Confidence',
        description: 'Review detailed listings and place your bids easily through the RexBid platform.'
    },
    {
        icon: <ShieldCheck />,
        title: 'Secure Your Purchase',
        description: `If you have the winning bid, complete the purchase through RexBid and arrange collection with the seller.`
    },
];

// Intersection Observer hook for fade-in animations
const useFadeIn = () => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return { ref, isVisible };
};

const features = [
    {
        icon: ShieldCheck,
        title: "Trusted Listings",
        desc: "Verified sellers and transparent listing details.",
    },
    {
        icon: Gavel,
        title: "Competitive Bidding",
        desc: "Simple and secure bidding for machinery and vehicles.",
    },
    {
        icon: Globe2,
        title: "Across Ireland",
        desc: "Connecting buyers and sellers across Ireland.",
    },
    {
        icon: BarChart3,
        title: "Better Selling",
        desc: "Helping sellers reach serious buyers faster.",
    },
];

const stats = [
    { icon: Users, value: "1.2K+", label: "Trusted Members" },
    { icon: PackageCheck, value: "450+", label: "Equipment Listings" },
    { icon: TrendingUp, value: "900+", label: "Successful Deals" },
];

function About() {
    const heroRef = useRef(null);
    const introRef = useRef(null);
    const featuresRef = useRef(null);
    const expertiseRef = useRef(null);
    const statsRef = useRef(null);
    const ctaRef = useRef(null);

    const [heroVisible, setHeroVisible] = useState(false);
    const [introVisible, setIntroVisible] = useState(false);
    const [featuresVisible, setFeaturesVisible] = useState(false);
    const [expertiseVisible, setExpertiseVisible] = useState(false);
    const [statsVisible, setStatsVisible] = useState(false);
    const [ctaVisible, setCtaVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const target = entry.target.getAttribute("data-section");
                        if (target === "hero") setHeroVisible(true);
                        if (target === "intro") setIntroVisible(true);
                        if (target === "features") setFeaturesVisible(true);
                        if (target === "expertise") setExpertiseVisible(true);
                        if (target === "stats") setStatsVisible(true);
                        if (target === "cta") setCtaVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
        );

        if (heroRef.current) observer.observe(heroRef.current);
        if (introRef.current) observer.observe(introRef.current);
        if (featuresRef.current) observer.observe(featuresRef.current);
        if (expertiseRef.current) observer.observe(expertiseRef.current);
        if (statsRef.current) observer.observe(statsRef.current);
        if (ctaRef.current) observer.observe(ctaRef.current);

        return () => observer.disconnect();
    }, []);

    return (
        <section className="bg-[#FAFAFA] text-[#072342] overflow-hidden pt-16 md:pt-20">
            {/* HERO SECTION with overlay animation */}
            <div
                ref={heroRef}
                data-section="hero"
                className={`relative h-[360px] md:h-[450px] overflow-hidden transition-all duration-700 ${heroVisible ? "opacity-100 scale-100" : "opacity-0 scale-105"
                    }`}
            >
                <img
                    src={aboutExcavator}
                    alt="About RexBid"
                    className="absolute inset-0 w-full h-full object-cover bg-center transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-[#072342]/75"></div>
                <Container>
                    <div className="relative z-10 h-full flex flex-col justify-center">
                        <p className="text-[#D19F3E] uppercase tracking-[3px] text-sm font-semibold animate-fade-up pt-20">
                            About RexBid
                        </p>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mt-4 leading-tight">
                            Built on Trust &<br />
                            Transparent Bidding
                        </h1>
                        <div className="flex items-center gap-2 mt-6 text-white/70 text-sm">
                            <Link to="/" className="hover:text-white transition">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-[#D19F3E]">About Us</span>
                        </div>
                    </div>
                </Container>
            </div>

            <div
                ref={expertiseRef}
                data-section="expertise"
                className={`pt-14 md:pt-14 transition-all duration-700 delay-300 ${expertiseVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <Container>
                    <h2 className="text-3xl md:text-4xl font-bold text-primary">
                        How <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                RexBid
                            </span>
                            <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                            </svg>
                        </span> Works
                    </h2>
                    <p className="text-sm md:text-base text-gray-500 mt-3 mb-6">
                        RexBid makes buying and selling simple through online auctions. Whether you’re selling machinery, vehicles or other assets, RexBid gives you the tools to reach more buyers and run your own auction.
                    </p>
                    {/* Two columns on medium screens and up */}
                    <div className="flex flex-col md:flex-col gap-8 md:gap-12">
                        {/* Left column – Selling */}
                        <div className="flex-1">
                            <h2 className="text-2xl text-center md:text-2xl font-bold text-primary mb-10">
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                        For Sellers
                                    </span>
                                    <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                    </svg>
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-10">
                                {HowItWorksSelling.map((howItWork, i) => (
                                    <HowItWorksCard
                                        key={howItWork.title}
                                        index={i}
                                        icon={howItWork.icon}
                                        title={howItWork.title}
                                        description={howItWork.description}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right column – Buying */}
                        <div className="flex-1">
                            <h2 className="text-2xl text-center md:text-2xl font-bold text-primary mb-10">
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                        For Buyers
                                    </span>
                                    <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                    </svg>
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-5 gap-y-10">
                                {HowItWorksBuying.map((howItWork, i) => (
                                    <HowItWorksCard
                                        key={howItWork.title}
                                        index={i}
                                        icon={howItWork.icon}
                                        title={howItWork.title}
                                        description={howItWork.description}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* COMPANY INTRO */}
            <div
                ref={introRef}
                data-section="intro"
                className={`py-14 md:py-14 transition-all duration-700 delay-100 ${introVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <Container>
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* LEFT */}
                        <div>
                            <span className="text-[#D19F3E] uppercase tracking-[3px] text-sm font-semibold">
                                Who We Are
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight mt-2">
                                Modern Machinery & Vehicle Trading{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                        Built for Ireland
                                    </span>
                                    <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                    </svg>
                                </span>
                            </h2>
                            <p className="mt-6 text-[#072342]/70 leading-relaxed text-base md:text-lg">
                                RexBid is a trusted marketplace connecting buyers and sellers across Ireland through transparent, secure, and easy-to-use bidding experiences.
                            </p>
                            <p className="mt-4 text-[#072342]/65 leading-relaxed">
                                We make machinery and vehicle trading simpler with verified listings, competitive bidding, and a professional platform designed for modern businesses, dealers, and private sellers.
                            </p>
                            <div className="mt-8 space-y-3">
                                {[
                                    "Verified listings",
                                    "Transparent bidding",
                                    "Secure transactions",
                                    "Trusted marketplace support",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 size={18} className="text-[#D19F3E]" />
                                        <span className="text-[#072342]/80">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/auctions"
                                className="inline-flex items-center gap-2 mt-8 bg-[#D19F3E] hover:bg-[#bc8f35] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                            >
                                Explore Auctions
                                <ArrowRight size={16} />
                            </Link>
                        </div>

                        {/* RIGHT with floating card */}
                        <div className="relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-xl">
                                <img
                                    src={aboutHandle}
                                    alt="Industrial Marketplace"
                                    className="w-full h-[400px] md:h-[520px] object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-6 left-4 md:-bottom-8 md:left-8 bg-white rounded-xl shadow-xl p-4 md:p-5 border border-gray-100">
                                <h3 className="text-3xl md:text-4xl font-bold text-[#072342]">5/5</h3>
                                <p className="text-[#072342]/60 text-sm md:text-base mt-1">
                                    Secure & Verified Marketplace
                                </p>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            {/* EXPERTISE SECTION */}
            {/* <div
                ref={expertiseRef}
                data-section="expertise"
                className={`py-14 md:py-14 transition-all duration-700 delay-300 ${expertiseVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <Container>
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="rounded-xl overflow-hidden shadow-xl order-2 lg:order-1">
                            <img
                                src={aboutDigger}
                                alt="Industry Expertise"
                                className="w-full h-[380px] md:h-[460px] object-cover"
                            />
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-[#D19F3E] uppercase tracking-[3px] text-sm font-semibold">
                                Our Expertise
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight mt-2">
                                Built for Machinery &{" "}
                                <span className="relative inline-block">
                                    <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                        Vehicle Trading
                                    </span>
                                    <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                        <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                    </svg>
                                </span>
                            </h2>
                            <p className="mt-5 text-[#072342]/70 leading-relaxed">
                                Our platform combines modern technology with industry experience to create a smooth, secure, and transparent marketplace for buyers and sellers across Ireland.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4 mt-8">
                                {[
                                    "Machinery & Vehicle Listings",
                                    "Secure Transactions",
                                    "Verified Listings",
                                    "Professional Support",
                                    "Real-Time Bidding",
                                    "Marketplace Transparency",
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-[#D19F3E]" />
                                        <span className="text-[#072342]/75 text-sm">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2 mt-8 bg-[#072342] hover:bg-[#051a30] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                            >
                                Contact Us
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </Container>
            </div> */}

            {/* FEATURES SECTION */}
            <div
                ref={featuresRef}
                data-section="features"
                className={`bg-white pb-14 transition-all duration-700 delay-200 ${featuresVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <Container>
                    <div className="text-center max-w-2xl mx-auto">
                        <span className="text-[#D19F3E] uppercase tracking-[3px] text-sm font-semibold">
                            Why Choose Us
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-[#072342] leading-tight mt-2">
                            A Simpler Way to{" "}
                            <span className="relative inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                    Buy & Sell Across Ireland
                                </span>
                                <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                    <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                                </svg>
                            </span>
                        </h2>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7 mt-12 md:mt-16">
                        {features.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div
                                    key={i}
                                    className="bg-[#FAFAFA] hover:bg-[#072342] border border-gray-200 hover:border-[#072342] rounded-xl p-6 transition-all duration-300 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[#D19F3E]/10 flex items-center justify-center">
                                        <Icon size={24} className="text-[#D19F3E]" />
                                    </div>
                                    <h3 className="text-lg font-semibold mt-5 group-hover:text-white transition">
                                        {item.title}
                                    </h3>
                                    <p className="text-[#072342]/65 group-hover:text-white/70 mt-2 leading-relaxed text-sm transition">
                                        {item.desc}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </Container>
            </div>

            {/* CTA SECTION with brand blue background */}
            <div
                ref={ctaRef}
                data-section="cta"
                className={`py-14 md:py-14 bg-[#072342] transition-all duration-700 delay-500 ${ctaVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                    }`}
            >
                <Container>
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 text-center">
                        <span className="text-[#D19F3E] uppercase tracking-[3px] text-sm font-semibold">
                            Get Started
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold mt-4 leading-tight text-white">
                            Built for Modern Machinery
                            <br />
                            & Vehicle Trading
                        </h2>
                        <p className="max-w-2xl mx-auto mt-5 text-gray-300 leading-relaxed">
                            Explore verified listings and connect with buyers and sellers across Ireland through a simple, transparent, and secure bidding platform.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            <Link
                                to="/register"
                                className="bg-[#D19F3E] hover:bg-[#bc8f35] text-[#072342] font-semibold px-6 py-3 rounded-lg transition-all duration-300"
                            >
                                Create Account
                            </Link>
                            <Link
                                to="/auctions"
                                className="border border-white/30 hover:border-[#D19F3E] text-white hover:text-[#D19F3E] px-6 py-3 rounded-lg font-medium transition-all duration-300"
                            >
                                Browse Auctions
                            </Link>
                        </div>
                    </div>
                </Container>
            </div>

            {/* Global animation styles */}
            <style>{`
                @keyframes fadeUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-up {
                    animation: fadeUp 0.6s ease-out forwards;
                }
            `}</style>
        </section>
    );
}

export default About;