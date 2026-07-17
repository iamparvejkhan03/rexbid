import { useState, useEffect } from "react";
import { LoadingSpinner, ReviewModal, CompanyContainer, CompanyHeader, CompanySidebar } from "../../components";
import { Award, Calendar, Clock, DollarSign, Eye, Gavel, MapPin, Phone, Mail, User, Plane, History, Shield, Package, CreditCard, Loader } from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

function SoldAuctions() {
    const [wonAuctionsData, setWonAuctionsData] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [revieweeId, setRevieweeId] = useState(null);
    const navigate = useNavigate();
    const [payingCommission, setPayingCommission] = useState(false);
    const userCurrency = currentUser?.currency || 'EUR';

    // Fetch company's won auctions
    const fetchSoldAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get(`/api/v1/auctions/sold-auctions?currency=${userCurrency}`);

            if (data.success) {
                const transformedAuctions = transformAuctionData(data.data.auctions);
                setWonAuctionsData(transformedAuctions);

                // Set first auction as selected by default
                if (transformedAuctions.length > 0) {
                    setSelectedAuction(transformedAuctions[0]);
                }
            } else {
                setError("Failed to fetch sold auctions");
            }
        } catch (err) {
            setError("Error loading sold auctions");
            console.error("Fetch sold auctions error:", err);
        } finally {
            setLoading(false);
        }
    };

    // Simplified transform function since backend does most of the work
    const transformAuctionData = (auctions) => {
        return auctions.map(auction => ({
            ...auction,
            // Ensure all fields have proper fallbacks
            winner: auction.winner || {
                id: 'unknown',
                name: 'Unknown Winner',
                username: 'unknown',
                email: '',
                image: '',
                phone: '',
                company: '',
                address: '',
                ip: "Not Available",
                bidHistory: []
            },
            bidders: auction.bidders || []
        }));
    };

    useEffect(() => {
        fetchSoldAuctions();
    }, []);

    useEffect(() => {
        const fetchUserReview = async () => {
            if (!currentUser || !selectedAuction || selectedAuction.status !== 'sold') return;
            try {
                const { data } = await axiosInstance.get(`/api/v1/reviews/my-review/auction/${selectedAuction.id}`);
                setUserReview(data.data);
            } catch (error) {
                console.error("Error fetching user review:", error);
            }
        };
        fetchUserReview();
    }, [currentUser, selectedAuction]);

    const formatTime = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleTimeString('en-IE', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: `${userCurrency}`,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const openUserModal = (user) => {
        setSelectedUser(user);
        setIsUserModalOpen(true);
    };

    const closeUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUser(null);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Aircraft":
                return <Plane size={20} className="text-blue-600" />;
            case "Aviation Memorabilia":
            case "Memorabilia":
                return <History size={20} className="text-amber-600" />;
            case "Engines & Parts":
                return <Package size={20} className="text-gray-600" />;
            default:
                return <Shield size={20} className="text-gray-600" />;
        }
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <CompanySidebar />
                <div className="w-full relative">
                    <CompanyHeader />
                    <CompanyContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div> */}
                                <LoadingSpinner />
                                <p className="mt-4 text-gray-600">Loading sold auctions...</p>
                            </div>
                        </div>
                    </CompanyContainer>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <CompanySidebar />
                <div className="w-full relative">
                    <CompanyHeader />
                    <CompanyContainer>
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center text-red-600">
                                <p>{error}</p>
                                <button
                                    onClick={fetchSoldAuctions}
                                    className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-500"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </CompanyContainer>
                </div>
            </section>
        );
    }

    if (wonAuctionsData.length === 0) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <CompanySidebar />
                <div className="w-full relative">
                    <CompanyHeader />
                    <CompanyContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Sold Auctions</h2>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                            <Award size={48} className="mx-auto text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sold Auctions Yet</h3>
                            <p className="text-gray-500">Auctions that have been sold will appear here once they are completed.</p>
                        </div>
                    </CompanyContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <CompanySidebar />

            <div className="w-full relative">
                <CompanyHeader />

                <CompanyContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Sold Auctions</h2>
                        {/* <p className="text-gray-600">Review completed auctions and contact winners for transaction details.</p> */}
                    </div>

                    {/* Auction Selection */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Completed Auction</label>
                        <select
                            className="w-full md:w-1/2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                            value={selectedAuction?.id || ""}
                            onChange={(e) => setSelectedAuction(wonAuctionsData.find(a => a.id === e.target.value))}
                        >
                            {wonAuctionsData.map(auction => (
                                <option key={auction.id} value={auction.id}>
                                    {auction.title} - Won for {formatCurrency(auction.convertedFinalPrice)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {wonAuctionsData.some(a => a.paymentStatus === "pending") && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard size={24} className="text-yellow-600" />
                                <div>
                                    <p className="font-semibold text-yellow-800">Pending Payments</p>
                                    <p className="text-sm text-yellow-700">
                                        You have {wonAuctionsData.filter(a => a.paymentStatus === "pending").length} auction(s) awaiting payment
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedAuction && (
                        <>
                            {/* Auction Details Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {/* {getCategoryIcon(selectedAuction.category)}
                                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                {selectedAuction.categories[0]}
                                            </span> */}
                                            <span className={`text-sm font-medium px-2 py-1 rounded-md bg-yellow-100 text-yellow-800`}>
                                                Payment {selectedAuction.paymentStatus}
                                            </span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-md bg-yellow-100 text-yellow-800`}>
                                                {selectedAuction.paymentMethod == 'bank_transfer' ? 'Manual Payment' : 'Paid With Card'}
                                            </span>
                                            <span className={`text-sm font-medium px-2 py-1 rounded-md ${selectedAuction.auctionType === "Reserve Auction"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-blue-100 text-blue-800"
                                                }`}>
                                                {selectedAuction.auctionType}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900"><Link to={`/auction/${selectedAuction.id}`} target="_blank">{selectedAuction.title}</Link></h3>
                                        {/* <p className="mt-2 text-gray-600">{selectedAuction.description}</p> */}

                                        <div className="flex flex-wrap gap-4 mt-4">
                                            <div>
                                                <div className="text-sm text-gray-500">Starting Bid</div>
                                                <div className="font-medium">{formatCurrency(selectedAuction.convertedStartPrice)}</div>
                                            </div>
                                            {selectedAuction.convertedReservePrice && (
                                                <div>
                                                    <div className="text-sm text-gray-500">Reserve Price</div>
                                                    <div className="font-medium">{formatCurrency(selectedAuction.convertedReservePrice)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 border border-green-200 text-green-800 px-5 py-4 rounded-xl">
                                        <div className="text-sm font-medium">Winning Bid</div>
                                        <div className="text-2xl font-bold">{formatCurrency(selectedAuction.convertedFinalPrice)}</div>
                                        <div className="text-xs mt-1">Auction completed</div>
                                    </div>
                                </div>

                                <div>
                                    {/* Make Payment Button for sold auctions */}
                                    {selectedAuction.status === 'sold' && selectedAuction?.paymentMethod == 'bank_transfer' && (selectedAuction?.paymentStatus == 'pending' || selectedAuction?.paymentStatus == 'processing') && (
                                        <button
                                            onClick={async () => {
                                                setPayingCommission(true);
                                                try {
                                                    const { data } = await axiosInstance.post(`/api/v1/payments/pay-commission?currency=${userCurrency}`, {
                                                        auctionId: selectedAuction.id
                                                    });
                                                    if (data.success) {
                                                        toast.success('Commission paid successfully!');
                                                        // Refresh the auction data to update paymentStatus
                                                        fetchSoldAuctions();
                                                    } else {
                                                        toast.error(data.message || 'Payment failed');
                                                    }
                                                } catch (error) {
                                                    console.error('Commission payment error:', error);
                                                    toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
                                                } finally {
                                                    setPayingCommission(false);
                                                }
                                            }}
                                            disabled={payingCommission}
                                            className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 my-3 disabled:opacity-50"
                                        >
                                            {payingCommission ? (
                                                <Loader className="animate-spin" size={16} />
                                            ) : (
                                                <>
                                                    <CreditCard size={18} /> Pay Commission ({formatCurrency(selectedAuction?.convertedCommissionAmount)})
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {selectedAuction.status === 'sold' && selectedAuction?.paymentMethod == 'bank_transfer' && (selectedAuction?.paymentStatus == 'pending' || selectedAuction?.paymentStatus == 'processing') && <p className="text-gray-500 text-xs">Note: You are paying the platform commission (service fee + featured premium if applicable). The buyer paid you directly.</p>}
                                </div>

                                {/* Auction Timeline */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex items-center">
                                        <Calendar size={20} className="text-blue-500 mr-3" />
                                        <div>
                                            <div className="text-sm text-gray-500">Auction Start</div>
                                            <div className="font-medium">{formatDate(selectedAuction.startDate)}</div>
                                            <div className="text-sm text-gray-500">{formatTime(selectedAuction.startDate)}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Calendar size={20} className="text-blue-500 mr-3" />
                                        <div>
                                            <div className="text-sm text-gray-500">Auction End</div>
                                            <div className="font-medium">{formatDate(selectedAuction.endDate)}</div>
                                            <div className="text-sm text-gray-500">{formatTime(selectedAuction.endDate)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Winner Section */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                                <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
                                    <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                                        <Award className="mr-2" size={20} />
                                        Auction Winner
                                    </h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                                                {
                                                    selectedAuction.winner.image
                                                        ?
                                                        <img src={selectedAuction.winner.image} alt="winner image" className="object-cover" />
                                                        :
                                                        <User size={24} className="text-blue-600" />
                                                }
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900">{selectedAuction.winner.name}</h4>
                                            <p className="text-gray-600">@{selectedAuction.winner.username}</p>
                                            <div className="flex flex-wrap gap-4 mt-3">
                                                <div>
                                                    <div className="text-sm text-gray-500">Final Bid</div>
                                                    <div className="font-medium text-green-600">{formatCurrency(selectedAuction.convertedFinalPrice)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => openUserModal(selectedAuction.winner)}
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center"
                                            >
                                                <User size={16} className="mr-2" />
                                                Contact Winner
                                            </button>
                                            {!selectedAuction.userReview && selectedAuction.status === 'sold' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAuction(selectedAuction);
                                                        setShowReviewModal(true);
                                                        setRevieweeId(selectedAuction?.winner?.id);
                                                    }}
                                                    className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors w-full"
                                                >
                                                    Rate Bidder
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bidders Table */}
                            {selectedAuction.bidders.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                        <h3 className="text-lg font-semibold">All Bidders</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Bid</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Time</th>
                                                    <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {selectedAuction.bidders.map((bidder) => (
                                                    <tr key={bidder.id} className="hover:bg-gray-50">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center">
                                                                <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                                                                    <User size={18} className="text-gray-500" />
                                                                </div>
                                                                <div className="ml-4">
                                                                    <div className="font-medium text-gray-900">{bidder.name}</div>
                                                                    <div className="text-sm text-gray-500">@{bidder.username}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-medium text-gray-900">{formatCurrency(bidder.finalBid)}</td>
                                                        <td className="py-4 px-6 text-sm text-gray-900">
                                                            <div className="flex items-center">
                                                                <Clock size={14} className="mr-1 text-gray-500" />
                                                                {formatDate(bidder.bidTime)} {formatTime(bidder.bidTime)}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-sm font-medium">
                                                            <button
                                                                onClick={() => openUserModal(bidder)}
                                                                className="text-blue-600 hover:text-blue-800"
                                                            >
                                                                View Details
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <ReviewModal
                        isOpen={showReviewModal}
                        onClose={() => setShowReviewModal(false)}
                        auctionId={selectedAuction.id}
                        revieweeId={revieweeId}
                        onSuccess={() => {
                            setUserReview({}); // mark as reviewed
                            toast.success("Thank you for your review!");
                        }}
                    />

                    {/* User Details Modal */}
                    {isUserModalOpen && selectedUser && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Bidder Details</h3>
                                    <button
                                        onClick={closeUserModal}
                                        className="text-gray-400 hover:text-gray-600 text-xl"
                                    >
                                        &times;
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center mb-6">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-blue-100 rounded-full flex items-center justify-center">
                                            {
                                                selectedUser?.image
                                                    ?
                                                    <img src={selectedUser?.image} alt="userimage" />
                                                    :
                                                    <User size={24} className="text-blue-600" />
                                            }
                                        </div>
                                        <div className="ml-4">
                                            <div className="font-bold text-xl text-gray-900">{selectedUser.name}</div>
                                            <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                                            {selectedUser.isWinner && (
                                                <div className="mt-1">
                                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Auction Winner
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {selectedUser.email && (
                                            <div className="flex items-center">
                                                <Mail size={18} className="text-gray-500 mr-3" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Email</div>
                                                    <a href={`mailto:${selectedUser.email}`} className="font-medium text-blue-600 hover:underline">
                                                        {selectedUser.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {selectedUser.phone && (
                                            <div className="flex items-center">
                                                <Phone size={18} className="text-gray-500 mr-3" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Phone</div>
                                                    <a href={`tel:${selectedUser.phone}`} className="font-medium text-blue-600 hover:underline">
                                                        {selectedUser.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                        {selectedUser.company && (
                                            <div className="flex items-center">
                                                <Shield size={18} className="text-gray-500 mr-3" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Company</div>
                                                    <div className="font-medium">{selectedUser.company}</div>
                                                </div>
                                            </div>
                                        )}
                                        {/* {selectedUser.address && (
                                            <div className="flex items-center">
                                                <MapPin size={18} className="text-gray-500 mr-3" />
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-500">Address</div>
                                                    <div className="font-medium">{selectedUser.address}</div>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>

                                    {/* <div className="mt-6 pt-4 border-t border-gray-200">
                                        <h4 className="font-medium mb-3">Contact Options</h4>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {selectedUser.email && (
                                                <a
                                                    href={`mailto:${selectedUser.email}`}
                                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                                                >
                                                    <Mail size={16} className="mr-2" />
                                                    Send Email
                                                </a>
                                            )}
                                            {selectedUser.phone && (
                                                <a
                                                    href={`tel:${selectedUser.phone}`}
                                                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                                                >
                                                    <Phone size={16} className="mr-2" />
                                                    Call Now
                                                </a>
                                            )}
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                        </div>
                    )}
                </CompanyContainer>
            </div>
        </section>
    );
}

export default SoldAuctions;