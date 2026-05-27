import { Tractor, Truck, Car, Wrench, Package, Leaf, Cog, Warehouse, Building2, Trees, Gavel } from "lucide-react";

// Map category names to brand-colored icons (same as before)
const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('farming') || name.includes('tractor')) return Tractor;
    if (name.includes('plant') || name.includes('machinery')) return Truck;
    if (name.includes('cars') || name.includes('commercials')) return Car;
    if (name.includes('transport') || name.includes('truck')) return Truck;
    if (name.includes('ground') || name.includes('lawn')) return Wrench;
    if (name.includes('material') || name.includes('handling')) return Package;
    if (name.includes('spray') || name.includes('irrigation')) return Leaf;
    if (name.includes('spare') || name.includes('parts')) return Cog;
    if (name.includes('storage') || name.includes('silo')) return Warehouse;
    return Gavel;
};

function CategoryGrid({ categories = [], onCategoryClick }) {
    if (!categories || categories.length === 0) {
        return (
            <div className="text-center py-16 bg-gray-100 rounded-2xl">
                <Package size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No categories available</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 md:gap-7">
            {categories.map((category) => {
                const Icon = getCategoryIcon(category.name);
                const auctionCount = category.auctionCount || 0;

                return (
                    <button
                        key={category.slug || category._id}
                        onClick={() => onCategoryClick(category.slug)}
                        className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 focus:outline-none overflow-hidden border border-gray-100 hover:border-[#D19F3E]/30"
                    >
                        {/* Top accent bar on hover */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D19F3E] to-[#E8B86B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                        <div className="p-6 text-center">
                            {/* Icon container with brand color background */}
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D19F3E]/15 to-[#D19F3E]/5 group-hover:from-[#D19F3E]/25 group-hover:to-[#D19F3E]/10 transition-colors mb-4">
                                <Icon size={32} className="text-[#D19F3E] group-hover:scale-110 transition-transform duration-300" />
                            </div>

                            {/* Category name */}
                            <h3 className="font-semibold text-[#072342] text-lg mb-2">
                                {category.name}
                            </h3>

                            {/* Auction count badge */}
                            {auctionCount > 0 && (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-700">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#D19F3E]" />
                                    {auctionCount.toLocaleString()} auctions
                                </div>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default CategoryGrid;