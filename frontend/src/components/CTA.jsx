import { useNavigate } from "react-router";
import { ArrowRight, Gavel } from "lucide-react";
import Container from "./Container";

function CTA() {
    const navigate = useNavigate();

    return (
        <section className="relative py-10 bg-slate-900 overflow-hidden border-b border-b-white">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-5" style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                backgroundSize: '32px 32px'
            }} />

            {/* Simple geometric accents */}
            {/* <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl" /> */}

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
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                    {/* Minimal badge */}
                    <span className="inline-block px-4 py-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full mb-8 uppercase tracking-wider">
                        Heavy equipment auction
                    </span>

                    {/* Heading */}
                    <h2 className="text-4xl md:text-5xl font-light text-white mb-4 leading-tight">
                        Ready to bid on
                        <span className="relative z-10 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-transparent bg-clip-text block">
                            industrial machinery
                        </span>
                    </h2>

                    {/* Subtext */}
                    <p className="text-lg text-white/60 mb-10 max-w-xl mx-auto">
                        Join verified traders bidding on excavators, dozers, cranes and more.
                    </p>

                    {/* Button */}

                    <button
                        onClick={() => navigate("/register")}
                        className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2 justify-center">
                            Start bidding now
                            <Gavel size={20} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>

                    {/* Simple stats */}
                    <div className="flex justify-center gap-8 mt-12 text-sm">
                        <div>
                            <span className="font-semibold text-white">500+</span>
                            <span className="text-white/40 ml-2">traders</span>
                        </div>
                        <div>
                            <span className="font-semibold text-white">50+</span>
                            <span className="text-white/40 ml-2">daily lots</span>
                        </div>
                        <div>
                            <span className="font-semibold text-white">24/7</span>
                            <span className="text-white/40 ml-2">online bidding</span>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    );
}

export default CTA;