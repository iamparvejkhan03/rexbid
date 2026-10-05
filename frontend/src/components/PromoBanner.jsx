import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PromoBanner = ({
    logoUrl,
    title,
    description,
    buttonText = "Learn More",
    buttonLink = "/",
}) => {
    const navigate = useNavigate();

    return (
        <div className="mx-auto max-w-full rounded-2xl relative z-10 mb-8 md:mb-10 bg-gradient-to-br from-[#072342] to-[#0a2a4a]">
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

            {/* Lightweight Glassmorphism Card */}
            <div className="bg-white/5  border border-white/10 rounded-2xl p-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">

                {/* 1. Logo (Standalone) */}
                <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="bg-white p-1.5 rounded-xl border border-white/20">
                        <img
                            src={logoUrl}
                            alt="Logo"
                            className="h-10 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* 2. Text (Flexible middle) */}
                <div className="flex-1 text-center md:text-left px-2">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed max-w-xl">
                        {description}
                    </p>
                </div>

                {/* 3. Button (Standalone right) */}
                <div className="flex-shrink-0 w-full md:w-auto">
                    <button
                        onClick={() => navigate(buttonLink)}
                        className="group w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] text-[#072342] font-bold rounded-full shadow-lg hover:shadow-xl hover:shadow-[#D19F3E]/25 transition-all duration-300 hover:scale-105"
                    >
                        <span>{buttonText}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PromoBanner;