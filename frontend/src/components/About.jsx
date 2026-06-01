import { ChartColumnIncreasing, Gavel, ShieldCheck, Clock, Users, Award, ArrowRight } from "lucide-react";
import { whoWeAre, about, aboutCar, aboutTractor } from "../assets";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function About() {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.2 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    // Feature data for cleaner mapping
    const features = [
        {
            icon: Gavel,
            title: "Industry Focused",
            description: "Built for tractors, machinery, commercials, trailers, and more.",
            color: "#D19F3E"
        },
        {
            icon: ShieldCheck,
            title: "Trusted Transactions",
            description: "Verified listings and secure, transparent bidding.",
            color: "#D19F3E"
        },
        {
            icon: ChartColumnIncreasing,
            title: "The RexBid Advantage",
            description: "Simple selling, wider reach, and competitive bidding.",
            color: "#D19F3E"
        }
    ];

    return (
        <section ref={ref} className="relative mb-14 overflow-hidden bg-white">
            {/* Background decorative elements with brand colors */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#D19F3E]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#072342]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-60 h-60 border border-[#D19F3E]/10 rounded-full" />
            </div>

            <div className="container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">
                    
                    {/* LEFT COLUMN - Visual Showcase (Redesigned) */}
                    <div className={`lg:col-span-3 transition-all duration-700 delay-200 ${
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                    }`}>
                        <div className="relative">
                            {/* Main image card with modern styling */}
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#072342]/10">
                                <img
                                    src={aboutTractor}
                                    alt="Heavy machinery auction hall"
                                    className="w-full h-[480px] lg:h-[560px] object-cover transition-transform duration-700 hover:scale-105"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#072342]/60 via-transparent to-transparent" />
                                
                                {/* Floating badge - New design */}
                                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
                                    <div className="p-2 bg-[#D19F3E]/10 rounded-xl">
                                        <Users className="w-5 h-5 text-[#D19F3E]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#072342]">4,500+</p>
                                        <p className="text-xs text-gray-500">Active Members</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating second image - New position and styling */}
                            <div className="absolute -bottom-8 -right-8 lg:-bottom-12 lg:-right-12 w-48 lg:w-64 rounded-2xl border-4 border-white shadow-2xl rotate-3 transition-all duration-500 hover:rotate-0 hover:scale-105">
                                <img
                                    src={aboutCar}
                                    alt="Equipment inspection"
                                    className="w-full h-36 lg:h-48 object-cover rounded-xl"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#D19F3E]/30 to-transparent rounded-xl pointer-events-none" />
                            </div>

                            {/* Decorative ring */}
                            <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-[#D19F3E]/30 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Content (Redesigned layout) */}
                    <div className={`lg:col-span-2 space-y-5 ${
                        visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                    } transition-all duration-700`}>
                        {/* Section label */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20">
                            <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">Our Story</span>
                        </div>

                        {/* Headline */}
                        <h2 className="text-4xl md:text-5xl font-bold text-[#072342] leading-tight">
                            Who We 
                            <span className="relative ml-2 inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                    Are
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 120 10" fill="none">
                                    <path d="M2 7.5C30 3.5 60 1.5 118 7.5" stroke="#D19F3E" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                                </svg>
                            </span>
                        </h2>

                        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                            RexBid is an online marketplace built for Ireland’s machinery, commercial vehicle, and agricultural trade. We connect private sellers with serious buyers across Ireland through a simple, transparent, and trusted bidding platform.
                        </p>

                        {/* Features grid - New card design */}
                        <div className="space-y-4 pt-4">
                            {features.map((feature, idx) => (
                                <div 
                                    key={idx}
                                    className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#D19F3E]/20 transition-all duration-300"
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#D19F3E]/20 to-[#D19F3E]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <feature.icon className="w-5 h-5 text-[#D19F3E]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#072342] text-lg">
                                            {feature.title}
                                        </h4>
                                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button - new addition */}
                        <button onClick={() => navigate('/about')} className="group inline-flex items-center gap-2 px-6 py-3 bg-[#072342] text-white rounded-full font-semibold shadow-md hover:bg-[#072342]/90 hover:shadow-lg transition-all">
                            Learn More About Us
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Custom styles for pulse animation */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                .animate-pulse {
                    animation: pulse 3s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}

export default About;