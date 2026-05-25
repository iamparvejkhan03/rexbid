import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, User, Calendar, ArrowLeft, MessageCircle, MapPin, ShieldCheck, Package, PlusCircle, Phone, Mail } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import Container from "../components/Container";
import LoadingSpinner from "../components/LoadingSpinner";
import RatingStars from "../components/RatingStars";
import { dummyUserImg } from "../assets";

const SellerReviewsPage = () => {
    const { userId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [sellerStats, setSellerStats] = useState(null);
    const [ratingDistribution, setRatingDistribution] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch both seller stats and reviews in parallel
                const [statsRes, reviewsRes] = await Promise.all([
                    axiosInstance.get(`/api/v1/users/${userId}/seller-stats`),
                    axiosInstance.get(`/api/v1/reviews/user/${userId}`)
                ]);

                // Set seller stats
                setSellerStats(statsRes.data.data);

                // Set reviews data
                const reviewsData = reviewsRes.data.data.reviews || [];
                setReviews(reviewsData);

                // Calculate rating distribution
                const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
                reviewsData.forEach(r => {
                    if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
                });
                setRatingDistribution(dist);

            } catch (err) {
                console.error("Error fetching seller data:", err);
                setError("Could not load seller information or reviews. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchData();
    }, [userId]);

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-32 min-h-[70vh] text-center">
                <p className="text-red-500">{error}</p>
                <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">
                    Go back home
                </Link>
            </Container>
        );
    }

    if (!sellerStats) return null;

    const {
        fullName,
        username,
        country,
        isVerified,
        sellerImage,
        itemsSold,
        itemsAdded,
        averageRating,
        totalReviews,
        positivePercentage,
        email,
        phone
    } = sellerStats;

    // For rating distribution bars
    const maxCount = Math.max(...Object.values(ratingDistribution));
    const getBarWidth = (count) => (maxCount ? (count / maxCount) * 100 : 0);

    return (
        <Container className="py-32 min-h-[70vh]">
            {/* Back button */}
            <div className="mb-6">
                <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>
            </div>

            {/* Seller Profile Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                {/* Header with seller info */}
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        {sellerImage ? (
                            <img src={sellerImage || dummyUserImg} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
                        ) : (
                            <img src={sellerImage || dummyUserImg} alt={fullName} className="w-16 h-16 rounded-full object-cover border-2 border-orange-200" />
                        )}
                        <div>
                            <div className="flex items-center gap-5">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{fullName || username}</h1>
                                <div className="flex items-center gap-3 mt-2">
                                <a href={`mailto:${email}`} className="text-gray-500 hover:text-orange-500 transition-colors">
                                    <Mail size={18} />
                                </a>
                                {phone && (
                                    <a href={`tel:${phone}`} className="text-gray-500 hover:text-orange-500 transition-colors">
                                        <Phone size={18} />
                                    </a>
                                )}
                            </div>
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                <span>{country}</span>
                                {isVerified && (
                                    <span className="flex items-center gap-1 text-green-600 ml-2">
                                        <ShieldCheck size={14} />
                                        <span>Verified</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats badges */}
                    <div className="flex flex-wrap gap-4 ml-auto">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Package size={18} className="text-gray-500" />
                            <span className="text-lg font-semibold">{itemsSold.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">sold</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <PlusCircle size={18} className="text-gray-500" />
                            <span className="text-lg font-semibold">{itemsAdded.toLocaleString()}</span>
                            <span className="text-sm text-gray-500">added</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                            <Star size={18} fill="#f97316" stroke="#f97316" />
                            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({totalReviews} reviews)</span>
                        </div>
                    </div>
                </div>

                {/* Rating distribution summary */}
                <div className="px-6 py-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="text-4xl font-bold text-gray-800">{averageRating.toFixed(1)}</span>
                            <div>
                                <RatingStars rating={averageRating} size={18} />
                                <span className="text-sm text-gray-500 block mt-1">{positivePercentage}% positive</span>
                            </div>
                        </div>
                    </div>

                    {/* Star distribution bars */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map(star => {
                            const count = ratingDistribution[star];
                            const percentage = totalReviews ? (count / totalReviews) * 100 : 0;
                            return (
                                <div key={star} className="flex items-center gap-3">
                                    <div className="w-12 text-sm font-medium text-gray-700 flex items-center gap-1">
                                        <span>{star}</span> <Star size={14} fill="#f97316" stroke="#f97316" />
                                    </div>
                                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="w-12 text-sm text-gray-500 text-right">{count}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-800">Reviews from buyers</h2>
                </div>

                <div className="divide-y divide-gray-100">
                    {reviews.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-gray-500">No reviews yet for this seller.</p>
                            <p className="text-sm text-gray-400 mt-1">Be the first to leave a review after a purchase.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {review.reviewer?.image ? (
                                            <img src={review.reviewer.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <div>
                                                <span className="font-semibold text-gray-800">
                                                    {review.reviewer?.firstName} {review.reviewer?.lastName}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <RatingStars rating={review.rating} size={14} />
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 mt-2">{review.comment}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {reviews.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500 border-t border-gray-200">
                        Showing all {totalReviews} reviews
                    </div>
                )}
            </div>
        </Container>
    );
};

export default SellerReviewsPage;