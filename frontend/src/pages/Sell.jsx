import { UserPlus, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { heroImg } from "../assets";
import { Container } from "../components";

function Sell() {
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

    return (
        <section ref={ref} className="relative overflow-hidden pt-24 md:pt-32 pb-14">
            {/* Background decorative elements (same as About) */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[#D19F3E]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#072342]/5 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-60 h-60 border border-[#D19F3E]/10 rounded-full" />
            </div>

            <Container className="container mx-auto max-w-7xl">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-center">

                    {/* LEFT COLUMN - Visual (similar to About) */}
                    <div className={`lg:col-span-2 transition-all duration-700 delay-200 order-2 lg:order-1 ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"
                        }`}>
                        <div className="relative">
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#072342]/10">
                                <img
                                    src={heroImg}
                                    alt="Sell your equipment on RexBid"
                                    className="w-full h-[480px] lg:h-[560px] object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#072342]/60 via-transparent to-transparent" />

                                {/* Floating badge */}
                                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-2xl px-5 py-3 shadow-xl flex items-center gap-3">
                                    <div className="p-2 bg-[#D19F3E]/10 rounded-xl">
                                        <Phone className="w-5 h-5 text-[#D19F3E]" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-[#072342]">2 Ways</p>
                                        <p className="text-xs text-gray-500">to advertise</p>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative ring */}
                            <div className="absolute -top-6 -left-6 w-24 h-24 border-2 border-[#D19F3E]/30 rounded-full animate-pulse" />
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Content */}
                    <div className={`lg:col-span-3 space-y-5 order-1 lg:order-2 ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"
                        } transition-all duration-700`}>
                        {/* Section label */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20">
                            <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">Sell with RexBid</span>
                        </div>

                        <h2 className="text-4xl font-bold text-[#072342] leading-tight">
                            Advertise Your
                            <span className="relative ml-2 inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                    Equipment
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 120 10" fill="none">
                                    <path d="M2 7.5C30 3.5 60 1.5 118 7.5" stroke="#D19F3E" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                                </svg>
                            </span>
                        </h2>

                        <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                            Choose the method that suits you best – take full control with your own account, or let us handle the listing for you.
                        </p>

                        {/* Two options as cards */}
                        <div className="space-y-4 pt-4">
                            {/* Option 1 */}
                            <div className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#D19F3E]/20 transition-all duration-300">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#D19F3E]/20 to-[#D19F3E]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <UserPlus className="w-5 h-5 text-[#D19F3E]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#072342] text-lg">Option 1 – Self‑manage</h4>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                        Register an account in minutes and create your own ads. Set your reserve, manage your auction, and connect directly with buyers.
                                    </p>
                                    <button
                                        onClick={() => navigate('/register')}
                                        className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#D19F3E] hover:underline"
                                    >
                                        Register now <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Option 2 */}
                            <div className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-[#D19F3E]/20 transition-all duration-300">
                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#D19F3E]/20 to-[#D19F3E]/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-5 h-5 text-[#D19F3E]" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-[#072342] text-lg">Option 2 – Send us the details</h4>
                                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                                        Send pictures, information, reserve price, and your contact details via WhatsApp to:
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-3">
                                        <a
                                            href="https://wa.me/353872039257"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-medium text-[#072342] bg-gray-100 px-3 py-1 rounded-full hover:bg-[#D19F3E]/10 transition-colors"
                                        >
                                            Darren – 087 203 9257
                                        </a>
                                        <a
                                            href="https://wa.me/353857628834"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-medium text-[#072342] bg-gray-100 px-3 py-1 rounded-full hover:bg-[#D19F3E]/10 transition-colors"
                                        >
                                            Shane – 085 762 8834
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Optional bottom CTA (can be omitted) */}
                        <div className="pt-2">
                            <p className="text-xs text-gray-400">
                                * All listings are subject to review and approval.
                            </p>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Pulse animation (same as About) */}
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

export default Sell;