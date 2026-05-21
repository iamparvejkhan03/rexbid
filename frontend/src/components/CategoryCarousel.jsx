import { useState, useEffect } from "react";
import { useKeenSlider } from "keen-slider/react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Tractor, Building2, Trees, Truck, Wrench, Package, Leaf, Warehouse, Cog } from "lucide-react";
import "keen-slider/keen-slider.min.css";

// Map category names to icons (fallback)
const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('agriculture') || name.includes('tractor')) return Tractor;
    if (name.includes('construction') || name.includes('building')) return Building2;
    if (name.includes('forestry') || name.includes('tree')) return Trees;
    if (name.includes('transport') || name.includes('truck')) return Truck;
    if (name.includes('ground') || name.includes('lawn')) return Wrench;
    if (name.includes('material') || name.includes('handling')) return Package;
    if (name.includes('spray') || name.includes('irrigation')) return Leaf;
    if (name.includes('spare') || name.includes('parts')) return Cog;
    if (name.includes('storage') || name.includes('silo')) return Warehouse;
    return Package; // default icon
};

function CategoryCarousel({ categories = [], onCategoryClick }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loaded, setLoaded] = useState(false);

    const [sliderRef, instanceRef] = useKeenSlider({
        slideChanged(slider) {
            setCurrentSlide(slider.track.details.rel);
        },
        created() {
            setLoaded(true);
        },
        slides: { perView: 1, spacing: 16 },
        breakpoints: {
            "(min-width: 640px)": { slides: { perView: 2, spacing: 16 } },
            "(min-width: 768px)": { slides: { perView: 3, spacing: 16 } },
            "(min-width: 1024px)": { slides: { perView: 4, spacing: 20 } },
            "(min-width: 1280px)": { slides: { perView: 5, spacing: 20 } },
        },
        loop: categories.length > 5,
    });

    // autoplay
    useEffect(() => {
        if (!instanceRef.current || categories.length <= 5) return;
        const interval = setInterval(() => instanceRef.current?.next(), 4500);
        return () => clearInterval(interval);
    }, [instanceRef, categories.length]);

    // Don't render if no categories
    if (!categories || categories.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Package size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No categories available</h3>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* arrows - only show if more than 5 categories */}
            {loaded && instanceRef.current && categories.length > 5 && (
                <>
                    <button
                        onClick={() => instanceRef.current?.prev()}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-4 bg-white shadow-md rounded-full p-2 hover:scale-105 transition z-10"
                        aria-label="Previous"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => instanceRef.current?.next()}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-4 bg-white shadow-md rounded-full p-2 hover:scale-105 transition z-10"
                        aria-label="Next"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* slider */}
            <div ref={sliderRef} className="keen-slider">
                {categories.map((category) => {
                    const Icon = getCategoryIcon(category.name);
                    // Use the image from API if available, otherwise fallback to placeholder
                    const imageUrl = category.image || `https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=800&auto=format&fit=crop`;

                    return (
                        <div key={category.slug || category._id} className="keen-slider__slide">
                            <button
                                onClick={() => onCategoryClick(category.slug)}
                                className="w-full focus:outline-none"
                            >
                                <div className="relative h-52 rounded-xl overflow-hidden group cursor-pointer will-change-transform">
                                    {/* Background Image */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-110"
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />

                                    {/* Dark overlay */}
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition duration-300 pointer-events-none" />

                                    {/* Hover Icon */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-orange-500 rounded-full p-4 shadow-lg
                                            opacity-0 scale-75
                                            group-hover:opacity-100 group-hover:scale-100
                                            transition duration-300 ease-out">
                                            <Icon size={28} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Bottom Label */}
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none w-full px-4">
                                        <h3 className="font-semibold text-white text-center text-lg drop-shadow-lg">
                                            {category.name}
                                        </h3>
                                        {category.auctionCount > 0 && (
                                            <p className="text-xs text-white/90 text-center mt-1">
                                                {category.auctionCount.toLocaleString()} auctions
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Dots Navigation */}
            {loaded && instanceRef.current && categories.length > 5 && (
                <div className="flex justify-center mt-6 gap-2">
                    {[
                        ...Array(instanceRef.current.track.details.slides.length).keys(),
                    ].map((idx) => (
                        <button
                            key={idx}
                            onClick={() => instanceRef.current?.moveToIdx(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                currentSlide === idx 
                                    ? 'bg-orange-500 w-6' 
                                    : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CategoryCarousel;