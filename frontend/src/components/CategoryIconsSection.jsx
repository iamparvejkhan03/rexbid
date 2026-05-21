import { useState, useEffect, lazy, Suspense } from 'react';
import { Container, LoadingSpinner } from '../components';
import axiosInstance from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const CategoryCarousel = lazy(() => import('../components/CategoryCarousel'));

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
                // Use the new endpoint that specifically returns ONLY parent categories
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
            <Container className="mb-14">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-7">
                    {[...Array(5)].map((_, index) => (
                        <div key={index} className="flex flex-col items-center justify-center p-3 rounded-lg shadow-md">
                            <div className="bg-gray-200 rounded-lg w-24 h-24 animate-pulse"></div>
                            <div className="bg-gray-200 h-5 w-20 rounded animate-pulse mt-2"></div>
                        </div>
                    ))}
                </div>
            </Container>
        );
    }

    return (
        <Container className="mb-14">
            <div className='mb-8'>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">
                    Categories
                </h2>
                <p className="text-sm md:text-base text-gray-500 mt-3">
                    Browse by Category — excavators, tractors, cranes, and more. All verified. All in one place.
                </p>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
                <CategoryCarousel
                    categories={categories}
                    onCategoryClick={handleCategoryClick}
                />
            </Suspense>
        </Container>
    );
};

export default CategoryIconsSection;