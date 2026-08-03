import { UserCheck, Tractor, DollarSign, Rocket, ArrowRight, Sparkles, Euro } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function HowItWorksForBuyers() {
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

    const steps = [
        {
            icon: UserCheck,
            title: "Create Your Account",
            description: "Sign up in minutes to start buying, selling, and managing listings.",
            stepNumber: "01",
        },
        {
            icon: Tractor,
            title: "Browse Listings",
            description: "Explore machinery, tractors, vehicles, trailers, and more across Ireland.",
            stepNumber: "02",
        },
        {
            icon: Euro,
            title: "Place Your Bid",
            description: "Bid with confidence and connect directly with trusted sellers.",
            stepNumber: "03",
        },
    ];

    return (
        <section ref={ref} className="relative px-5 py-8 md:px-16 md:py-10 lg:px-24 lg:py-12 xl:px-28 xl:py-14 bg-gradient-to-br from-[#072342] to-[#0a2a4a] overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#D19F3E]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#D19F3E]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#D19F3E]/10 rounded-full" />
                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
                {/* Header */}
                <div className={`text-center max-w-2xl mx-auto mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/20 backdrop-blur-sm border border-[#D19F3E]/30 mb-6">
                        <Sparkles size={14} className="text-[#D19F3E]" />
                        <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">Simple Process</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl lg:text-4xl font-bold text-white leading-tight">
                        How It{" "}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                Works
                            </span>
                            <svg className="absolute -bottom-3 left-0 w-full" height="12" viewBox="0 0 200 12" fill="none">
                                <path d="M2 9.5C50 4.5 130 2.5 198 9.5" stroke="#D19F3E" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 6" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-gray-300 text-lg mt-6">
                        Get started in a few simple steps and start buying or selling with confidence.
                    </p>
                </div>

                {/* Steps - Horizontal timeline style */}
                <div className="relative">
                    {/* Connecting line (desktop) */}
                    <div className="hidden lg:block absolute top-1/3 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-[#D19F3E]/40 to-transparent" />

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isEven = index % 2 === 0;

                            return (
                                <div
                                    key={index}
                                    className={`group relative transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                                        }`}
                                    style={{ transitionDelay: `${index * 150}ms` }}
                                >
                                    {/* Card */}
                                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8 h-full hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#D19F3E]/5">
                                        {/* Step Number Badge */}
                                        <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#D19F3E] to-[#E8B86B] text-[#072342] font-bold text-xl flex items-center justify-center shadow-lg">
                                            {step.stepNumber}
                                        </div>

                                        {/* Icon Container */}
                                        <div className="flex justify-center mb-6 mt-4">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-[#D19F3E]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                                <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D19F3E]/20 to-[#D19F3E]/5 border border-[#D19F3E]/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                    <Icon size={34} className="text-[#D19F3E]" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-3">
                                            {step.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-gray-300 text-center leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Decorative arrow on hover */}
                                        <div className="flex justify-center mt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight size={20} className="text-[#D19F3E]" />
                                        </div>
                                    </div>

                                    {/* Connector arrow between cards (desktop) */}
                                    {index < steps.length - 1 && (
                                        <div className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 z-10">
                                            <div className="w-8 h-8 rounded-full bg-[#072342] border border-[#D19F3E]/40 flex items-center justify-center">
                                                <ArrowRight size={14} className="text-[#D19F3E]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom CTA */}
                <div className={`text-center mt-16 transition-all duration-700 delay-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}>
                    <button onClick={() => navigate('/register')} className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-[#072342] font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#D19F3E]/25 transition-all duration-300 hover:scale-105">
                        <Rocket size={20} />
                        Start Today
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    {/* <p className="text-gray-400 text-sm mt-4">No credit card required • Free registration</p> */}
                </div>
            </div>

            {/* Custom keyframes for dash animation if needed */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 0.8; }
                }
            `}</style>
        </section>
    );
}

export default HowItWorksForBuyers;