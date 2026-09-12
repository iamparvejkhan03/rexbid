import { useState, useEffect } from "react";
import { MapPin, ShieldCheck, Package, Star, MessageCircle, PackageCheck, PhoneCall } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { dummyUserImg } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const SellerStatsCard = ({ sellerId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Reset showDetails if user logs out
    useEffect(() => {
        if (!user) {
            setShowDetails(false);
        }
    }, [user]);

    // Fetch stats only when showDetails becomes true and we have a user
    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const { data } = await axiosInstance.get(`/api/v1/users/${sellerId}/seller-stats`);
                setStats(data.data);
            } catch (error) {
                console.error("Failed to fetch seller stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [showDetails, user, sellerId]);

    const handleContactClick = () => {
        if (user) {
            setShowDetails(true);   // Reveal the details and hide the button
        } else {
            navigate("/register"); // Redirect to register
        }
    };

    return (
        <div>
            <h3 className="my-5 text-primary text-xl font-semibold">Sold By</h3>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                {/* Seller info header */}
                <div className="mb-3 mt-4">
                    <div className="flex items-start md:items-center gap-5">
                        <img
                            src={stats?.sellerImage || dummyUserImg}
                            alt="seller image"
                            className="h-12 w-12 object-cover rounded-full flex-shrink-0"
                        />
                        <div>
                            <div className="flex items-center gap-5">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-5">
                                    {stats?.companyName || stats?.fullName || stats?.username}
                                </h3>
                                {!showDetails ? (
                                    <button
                                        className="bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 text-xs"
                                        onClick={handleContactClick}
                                    >
                                        <MessageCircle size={16} />
                                        Contact Seller
                                    </button>
                                ) :
                                    <div className="flex items-center flex-wrap gap-3 text-gray-500 text-sm">
                                        <a
                                            className="flex items-center gap-2"
                                            href={`mailto:${stats?.phone}`}
                                        >
                                            <PhoneCall size={18} />
                                            <span className="underline">{stats?.phone}</span>
                                        </a>
                                    </div>
                                }

                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                <span>{stats?.country}</span>
                                {stats?.isVerified && (
                                    <span className="flex items-center gap-1 text-green-600 ml-2">
                                        <ShieldCheck size={14} />
                                        <span>Verified</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center justify-between border rounded-md py-4 border-gray-200 mt-4">
                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Package size={16} />
                            <span className="text-xs uppercase">Added</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{stats?.itemsAdded.toLocaleString()}</p>
                    </div>

                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <PackageCheck size={16} />
                            <span className="text-xs uppercase">Sold</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{stats?.itemsSold.toLocaleString()}</p>
                    </div>

                    {/* <div className="text-center flex-1 border-l border-r border-gray-100">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Star size={16} fill="#f97316" stroke="#f97316" />
                            <span className="text-xs uppercase">Rating</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            <p className="text-xl font-bold text-gray-800">{stats?.averageRating}</p>
                            <span className="text-sm text-gray-500">/5</span>
                        </div>
                    </div>

                    <div className="text-center flex-1">
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <MessageCircle size={16} />
                            <span className="text-xs uppercase">Reviews</span>
                        </div>
                        <p>
                            <Link
                                className="text-xl font-bold text-gray-800 underline"
                                to={`/seller-reviews/${sellerId}`}
                            >
                                <span>{stats?.totalReviews.toLocaleString()}</span>
                                <span className="text-gray-800 font-medium text-sm ml-1">(read)</span>
                            </Link>
                        </p>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default SellerStatsCard;