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
        <div className="container mx-auto max-w-full relative z-10 mt-8">
            {/* Lightweight Glassmorphism Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">

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