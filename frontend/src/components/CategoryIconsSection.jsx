import { useState, useEffect } from 'react';
import { Container } from '../components';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import CategoryGrid from '../components/CategoryCarousel';

const CategoryIconsSection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleCategoryClick = (categorySlug) => {
        navigate(`/auctions?category=${categorySlug}`);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get('/api/v1/categories/public/parents/with-images');
                if (data.success) {
                    setCategories(data.data);
                } else {
                    setCategories([]);
                }
            } catch (err) {
                console.error('Error fetching categories:', err);
                setCategories([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-100 py-16">
                <Container>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse shadow-md h-32" />
                        ))}
                    </div>
                </Container>
            </div>
        );
    }

    return (
        // Full-width colored background that clearly separates from the rest of the page
        <div className="bg-gradient-to-br from-[#F8F6F2] to-[#FFF]">
            <Container className="py-14">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D19F3E]/10 border border-[#D19F3E]/20 mb-4">
                        <span className="text-xs font-semibold tracking-wider text-[#D19F3E] uppercase">
                            Shop by Category
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#072342]">
                        Browse Equipment by{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-[#D19F3E] to-[#E8B86B]">
                                Specialty
                            </span>
                            <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none">
                                <path d="M2 7.5C50 3.5 130 2.5 198 7.5" stroke="#D19F3E" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
                            </svg>
                        </span>
                    </h2>
                    <p className="text-gray-600 mt-4">
                        Farming, construction, trucks, and more – all in one place.
                    </p>
                </div>

                {/* Category Grid – cards themselves will have white backgrounds and strong shadows */}
                <CategoryGrid categories={categories} onCategoryClick={handleCategoryClick} />
            </Container>
        </div>
    );
};

export default CategoryIconsSection;