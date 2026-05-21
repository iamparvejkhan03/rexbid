import { useState, useEffect } from "react";
import { ArrowUp, X } from "lucide-react";
import { CategoryImg, Container } from "./";
import { endingSoonAuctions, liveAuctions, soldAuctions, upcomingAuctions } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

function CategoryImagesSection({ closePopup }) {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            // Use the public endpoint for parent categories with images
            const response = await axiosInstance.get('/api/v1/categories/public/parents/with-images');

            if (response.data.success) {
                // Format categories from API
                const apiCategories = response.data.data.map(cat => ({
                    title: cat.name,
                    image: cat.image,
                    slug: cat.slug,
                    auctionCount: cat.auctionCount
                }));
                setCategories(apiCategories);
            } else {
                setCategories([]);
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories');
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchByCategory = (title, slug) => {
        // Use slug if available, otherwise use title
        const categoryParam = slug || title;
        navigate(`/auctions?category=${encodeURIComponent(categoryParam)}`);
        closePopup('category');
    };

    const handleSearchByStatus = (status) => {
        navigate(`/auctions?status=${status}`);
        closePopup('category');
    };

    const statusImages = [
        {
            title: 'active',
            label: 'Live Auctions',
            image: liveAuctions,
        },
        {
            title: 'sold',
            label: 'Sold',
            image: soldAuctions,
        },
        {
            title: 'approved',
            label: 'Upcoming',
            image: upcomingAuctions,
        }
    ];

    // Loading state
    if (loading) {
        return (
            <Container className="w-full min-h-screen h-full fixed inset-0 bg-black/70 z-50 overflow-y-scroll">
                <section className="max-h-[95%] overflow-y-scroll lg:overflow-y-auto w-[90%] self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 md:p-10 sm:rounded-2xl">
                    <div className="flex w-full justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-7 text-primary">Explore By Categories</h2>
                        <X onClick={() => closePopup('category')} size={30} className="cursor-pointer" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className="h-44 rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
                        ))}
                    </div>

                    <h2 className="text-2xl font-semibold my-7 text-primary">Explore By Status</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="h-44 rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
                        ))}
                        <div className="h-44 rounded-xl overflow-hidden bg-gray-200 animate-pulse"></div>
                    </div>
                </section>
            </Container>
        );
    }

    return (
        <Container className="w-full min-h-screen h-full fixed inset-0 bg-black/70 z-50 overflow-y-scroll">
            <section className="max-h-[95%] overflow-y-scroll lg:overflow-y-auto w-[90%] self-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-5 md:p-10 sm:rounded-2xl">
                <div className="flex w-full justify-between items-center">
                    <h2 className="text-2xl font-semibold mb-7 text-primary">Explore By Categories</h2>
                    <X onClick={() => closePopup('category')} size={30} className="cursor-pointer" />
                </div>

                {/* Categories Grid */}
                {categories && categories.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {categories.map(category => (
                            <CategoryImg
                                key={category.slug || category.title}
                                title={category.title}
                                image={category.image}
                                onClick={() => handleSearchByCategory(category.title, category.slug)}
                                subtitle={category.auctionCount ? `${category.auctionCount} auctions` : ''}
                            />
                        ))}
                        {/* Explore All Card */}
                        <div 
                            onClick={() => { navigate('/auctions'); closePopup('category'); }} 
                            className="group hover:scale-[101%] transition-all duration-200 relative h-44 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 cursor-pointer"
                        >
                            <p className="absolute bottom-5 left-5 text-primary font-medium">Explore All Auctions</p>
                            <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-primary rotate-45" strokeWidth={1.5} size={30} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg mb-6">
                        <p className="text-gray-500">No categories available</p>
                    </div>
                )}

                {/* Status section */}
                <h2 className="text-2xl font-semibold my-7 text-primary">Explore By Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statusImages.map(item => (
                        <CategoryImg 
                            key={item.title} 
                            title={item.label || item.title} 
                            image={item.image} 
                            onClick={() => handleSearchByStatus(item.title)} 
                        />
                    ))}
                    <div 
                        onClick={() => { navigate('/auctions'); closePopup('category'); }} 
                        className="group hover:scale-[101%] transition-all duration-200 relative h-44 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 cursor-pointer"
                    >
                        <p className="absolute bottom-5 left-5 text-primary font-medium">Explore All Auctions</p>
                        <ArrowUp className="absolute group-hover:top-4 group-hover:right-4 transition-all duration-200 top-5 right-5 text-primary rotate-45" strokeWidth={1.5} size={30} />
                    </div>
                </div>
            </section>
        </Container>
    );
}

export default CategoryImagesSection;