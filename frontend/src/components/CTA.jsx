import { useNavigate } from "react-router";
import { ArrowRight } from "lucide-react";
import Container from "./Container";

function CTA() {
    const navigate = useNavigate();

    return (
        <>
            {/* Gold separator line – breaks visual continuity from previous section */}
            <div className="w-full h-px bg-gradient-to-r from-transparent via-[#D19F3E] to-transparent" />

            <section className="py-14 bg-gradient-to-br from-[#072342] to-[#0a2a4a] relative overflow-hidden">
                {/* Industrial Background Pattern - EXACT same as footer (opacity 0.1) */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>
                
                {/* Industrial Mesh Lines - EXACT same as footer (opacity 0.2, 40x40 grid) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#cta-grid)" />
                    </svg>
                </div>

                {/* Gradient Orbs - using same amber/orange as footer */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-[#D19F3E]/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#D19F3E]/5 rounded-full blur-3xl pointer-events-none" />

                <Container>
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        {/* Brand badge - light version */}
                        <div className="inline-flex items-center justify-center mb-6">
                            <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase bg-[#D19F3E]/20 backdrop-blur-sm px-4 py-2 rounded-full border border-[#D19F3E]/30">
                                Start today
                            </span>
                        </div>

                        {/* Heading - white for contrast */}

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#fff] mb-4 leading-tight">
                            Buy & Sell With 
                            <span className="relative ml-2 inline-block">
                                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                    Confidence
                                </span>
                                <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 120 10" fill="none">
                                    <path d="M2 7.5C30 3.5 60 1.5 118 7.5" stroke="#D19F3E" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
                                </svg>
                            </span>
                        </h2>

                        {/* Subheading - light gray */}
                        <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Join Ireland’s trusted marketplace for machinery, vehicles, and agricultural equipment.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button
                                onClick={() => navigate("/register")}
                                className="px-8 py-3 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-[#072342] font-bold rounded-full shadow-md hover:shadow-lg hover:shadow-[#D19F3E]/25 transition-all duration-300"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => navigate("/auctions")}
                                className="group inline-flex items-center gap-2 px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-full hover:bg-[#D19F3E]/20 hover:border-[#D19F3E]/40 transition-all duration-300"
                            >
                                Browse Listings
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                        {/* Footnote */}
                        <p className="text-gray-400 text-xs mt-8">
                            Verified sellers • Competitive bidding • Simple process
                        </p>
                    </div>
                </Container>
            </section>
        </>
    );
}

export default CTA;