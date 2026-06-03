import { useState, useEffect } from "react";
import { MapPin, ShieldCheck, Package, Star, MessageCircle, PackageCheck, Mail, PhoneCall } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import RatingStars from "./RatingStars";
import { dummyUserImg } from "../assets";
import { Link } from "react-router-dom";

const SellerStatsCard = ({ sellerId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!sellerId) return;
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
    }, [sellerId]);

    if (loading) {
        return (
            <div className="animate-pulse bg-gray-100 rounded-lg p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
        );
    }

    if (!stats) return null;

    return (
        <>
            <h3 className="my-5 text-primary text-xl font-semibold">Sold By</h3>
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                {/* Seller name & location */}
                <div className="mb-3">
                    <div className="flex items-start md:items-center gap-5">
                        <img src={stats.sellerImage || dummyUserImg} alt="seller image" className="h-12 w-12 object-cover rounded-full flex-shrink-0" />
                        <div>
                            <div className="flex items-center flex-wrap gap-5">
                                <h3 className="text-lg font-semibold text-gray-700 flex items-center gap-5">
                                    <span>{stats.fullName}</span>
                                </h3>

                                <div className="flex items-center flex-wrap gap-3 text-gray-500 text-sm">
                                        {/* <a className="flex items-center break-all gap-2" href={`mailto:${stats?.email}`}>
                                            <Mail size={18} /> <span className="underline">{stats?.email}</span>
                                        </a> */}

                                        <a className="flex items-center gap-2" href={`mailto:${stats?.phone}`}>
                                            <PhoneCall size={18} /> <span className="underline">{stats?.phone}</span>
                                        </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <MapPin size={14} />
                                <span>{stats.country}</span>
                                {stats.isVerified && (
                                    <span className="flex items-center gap-1 text-green-600 ml-2">
                                        <ShieldCheck size={14} />
                                        <span>Verified</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div >

                {/* Stats row */}
                < div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-center justify-between border rounded-md py-4 border-gray-200 mt-4" >
                    {/* Items Added */}
                    < div className="text-center flex-1" >
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Package size={16} />
                            <span className="text-xs uppercase">Added</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{stats.itemsAdded.toLocaleString()}</p>
                    </div >

                    {/* Items Sold */}
                    < div className="text-center flex-1" >
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <PackageCheck size={16} />
                            <span className="text-xs uppercase">Sold</span>
                        </div>
                        <p className="text-xl font-bold text-gray-800">{stats.itemsSold.toLocaleString()}</p>
                    </div >

                    {/* Average Rating */}
                    < div className="text-center flex-1 border-l border-r border-gray-100" >
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <Star size={16} fill="#f97316" stroke="#f97316" />
                            <span className="text-xs uppercase">Rating</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            <p className="text-xl font-bold text-gray-800">{stats.averageRating}</p>
                            <span className="text-sm text-gray-500">/5</span>
                            {/* <p className="text-xs text-gray-500">({stats.positivePercentage}% positive)</p> */}
                        </div>

                    </div >

                    {/* Total Reviews */}
                    < div className="text-center flex-1" >
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                            <MessageCircle size={16} />
                            <span className="text-xs uppercase">Reviews</span>
                        </div>
                        <p>
                            <Link className="text-xl font-bold text-gray-800 underline" to={`/seller-reviews/${sellerId}`}>
                                <span>{stats.totalReviews.toLocaleString()}</span>
                                <span className="text-gray-800 font-medium text-sm ml-1">(read)</span>
                            </Link>                            
                        </p>
                    </div >
                </div >
            </div >
        </>
    );
};

export default SellerStatsCard;