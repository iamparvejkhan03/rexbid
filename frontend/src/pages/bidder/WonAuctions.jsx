import { useState, useEffect } from "react";
import { AccountInactiveBanner, BidderContainer, BidderHeader, BidderSidebar, LoadingSpinner, ReviewModal } from "../../components";
import {
    Award,
    Trophy,
    Star,
    MessageCircle,
    Phone,
    Mail,
    Search,
    Zap,
    TrendingUp,
    SortAsc,
    Banknote,
    CreditCard,
    CheckCircle,
    XCircle,
    Loader,
    Truck,
    FileText
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function WonAuctions() {
    const [auctions, setAuctions] = useState([]);
    const [allAuctions, setAllAuctions] = useState([]); // Store all auctions
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [showContactModal, setShowContactModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('newest');
    const [statistics, setStatistics] = useState({
        totalWon: 0,
        totalSpent: 0,
        averageSavings: 0,
        recentWins: 0,
    });

    const { user: currentUser } = useAuth();
    const userCurrency = currentUser?.currency || 'EUR';
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReview, setUserReview] = useState(null);
    const [revieweeId, setRevieweeId] = useState(null);

    // payment states
    const [processingPayment, setProcessingPayment] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedAuctionForPayment, setSelectedAuctionForPayment] = useState(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        fetchWonAuctions();
    }, []);

    useEffect(() => {
        const fetchUserReview = async () => {
            if (!currentUser || !selectedAuction || selectedAuction.status !== 'sold') return;
            try {
                const { data } = await axiosInstance.get(`/api/v1/reviews/my-review/auction/${selectedAuction._id}`);
                setUserReview(data.data);
            } catch (error) {
                console.error("Error fetching user review:", error);
            }
        };
        fetchUserReview();
    }, [currentUser, selectedAuction]);

    const fetchWonAuctions = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data } = await axiosInstance.get(`/api/v1/auctions/won-auctions?currency=${userCurrency}`);

            if (data.success) {
                setAllAuctions(data.data.auctions);
                setAuctions(data.data.auctions);
                setStatistics(data.data.statistics);
            } else {
                setError("Failed to fetch won auctions");
            }
        } catch (err) {
            setError("Error loading won auctions");
            console.error("Fetch won auctions error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (allAuctions.length === 0) return;

        let filtered = [...allAuctions];

        if (filter !== "all") {
            filtered = filtered.filter(auction => auction.status === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(auction =>
                auction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                auction.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "newest":
                    return new Date(b.endDate) - new Date(a.endDate); // Use endDate as win time
                case "oldest":
                    return new Date(a.endDate) - new Date(b.endDate); // Use endDate as win time
                case "highest_bid":
                    return (b.finalBid || b.convertedCurrentPrice || 0) - (a.finalBid || a.convertedCurrentPrice || 0);
                case "lowest_bid":
                    return (a.finalBid || a.convertedCurrentPrice || 0) - (b.finalBid || b.convertedCurrentPrice || 0);
                default:
                    return new Date(b.endDate) - new Date(a.endDate); // Default to newest
            }
        });

        setAuctions(filtered);
    }, [filter, searchTerm, allAuctions, sortBy]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IE', {
            style: 'currency',
            currency: `${userCurrency}`,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const openContactModal = (auction) => {
        setSelectedAuction(auction);
        setShowContactModal(true);
    };

    const navigate = useNavigate();

    const handlePayNow = (auction) => {
        navigate(`/checkout/${auction._id}`);
    };

    const handleRetryPayment = async (auction) => {
        toast((t) => (
            <div className="flex flex-col gap-2">
                <p className="font-medium">Retry payment for "{auction.title}"?</p>
                <div className="flex gap-2">
                    <button
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            await handlePayNow(auction);
                        }}
                    >
                        Yes, Retry
                    </button>
                    <button
                        className="px-3 py-1 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), {
            duration: 8000,
            position: 'top-center',
        });
    };

    // Add this helper function to check if payment is allowed
    const canPayForAuction = (auction) => {
        return auction.paymentStatus === "pending" || auction.paymentStatus === "failed" &&
            auction.winner?._id === currentUser?._id; // You'll need currentUser from context
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <div className="flex justify-center items-center min-h-96">
                            {/* <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div> */}
                            <LoadingSpinner />
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <BidderSidebar />
                <div className="w-full relative">
                    <BidderHeader />
                    <BidderContainer>
                        <AccountInactiveBanner />
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <p className="text-red-600">{error}</p>
                            <button
                                onClick={fetchWonAuctions}
                                className="mt-4 bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg"
                            >
                                Try Again
                            </button>
                        </div>
                    </BidderContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />

            <div className="w-full relative">
                <BidderHeader />

                <BidderContainer>
                    <AccountInactiveBanner />
                    {/* Celebratory Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Trophy className="text-primary" size={32} />
                                    <h2 className="text-3xl md:text-4xl font-bold bg-primary bg-clip-text text-transparent">
                                        Your Won Auctions
                                    </h2>
                                </div>
                                {/* <p className="text-secondary text-lg">
                                    Your winning bids and manage your acquisitions
                                </p> */}
                            </div>
                        </div>
                    </div>

                    {/* Gradient Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-primary text-white hover:bg-primary/90 rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm">Total Wins</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {statistics.totalWon}
                                    </p>
                                    <p className="text-amber-200 text-xs mt-1">Auctions Won</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Trophy size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm">Total Investment</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {formatCurrency(statistics.totalSpent)}
                                    </p>
                                    <p className="text-green-200 text-xs mt-1">In Winning Auctions</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Banknote size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Recent Success</p>
                                    <p className="text-3xl font-bold mt-1">
                                        {statistics.recentWins}
                                    </p>
                                    <p className="text-blue-200 text-xs mt-1">Wins This Week</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-full">
                                    <Zap size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {auctions.some(a => a.paymentStatus === "pending") && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CreditCard size={24} className="text-yellow-600" />
                                <div>
                                    <p className="font-semibold text-yellow-800">Pending Payments</p>
                                    <p className="text-sm text-yellow-700">
                                        You have {auctions.filter(a => a.paymentStatus === "pending").length} auction(s) awaiting payment
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filters and Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={18}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search your won auctions..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <SortAsc size={18} className="text-gray-500" />
                                <select
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    {/* <option value="newest">Newest First</option> */}
                                    {/* <option value="oldest">Oldest First</option> */}
                                    <option value="highest_bid">Highest Bid</option>
                                    <option value="lowest_bid">Lowest Bid</option>
                                    <option value="newest">Newest</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Won Auctions Grid */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-16">
                        {auctions.map((auction) => (
                            <div
                                key={auction._id}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-[102%] transition-all duration-300"
                            >

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                {/* Payment Status Badge */}
                                                {auction.paymentStatus && (
                                                    <span className={`text-xs font-medium px-2 py-1 rounded-md ${auction.paymentStatus === "completed"
                                                        ? "bg-green-100 text-green-700"
                                                        : auction.paymentStatus === "processing"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : auction.paymentStatus === "failed"
                                                                ? "bg-red-100 text-red-700"
                                                                : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                        {auction.paymentStatus === "completed" && "Paid"}
                                                        {auction.paymentStatus === "processing" && "Processing"}
                                                        {auction.paymentStatus === "failed" && "Payment Failed"}
                                                        {auction.paymentStatus === "pending" && "Payment Pending"}
                                                    </span>
                                                )}
                                                {/* Payment Method Badge */}
                                                {auction.paymentMethod && auction.paymentStatus === "completed" && (
                                                    <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 text-gray-700">
                                                        {auction.paymentMethod === "credit_card" ? "Card" : "Bank Transfer"}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {auction.title}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-green-600">
                                                {formatCurrency(auction.convertedFinalPrice)}
                                            </div>
                                            {/* <div className="text-sm text-gray-500">Winning Bid</div> */}
                                            <div className="text-sm text-gray-500">Winning Amount</div>
                                        </div>
                                    </div>

                                    {/* Congratulations Message */}
                                    {/* <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <Star
                                                className="text-amber-500"
                                                size={20}
                                                fill="currentColor"
                                            />
                                            <p className="text-amber-800 font-medium">
                                                {auction.congratulatoryMessage}
                                            </p>
                                        </div>
                                    </div> */}

                                    {/* Auction Details */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Won On</p>
                                            <p className="font-semibold">
                                                {formatDate(auction.updatedAt)}
                                            </p>
                                        </div>
                                        <div>
                                            {/* <p className="text-sm text-gray-500">Starting Bid</p> */}
                                            <p className="text-sm text-gray-500">Starting Price</p>
                                            <p className="font-semibold text-blue-600">
                                                {formatCurrency(auction.convertedStartPrice)}
                                            </p>
                                        </div>
                                        {/* {
                                            auction.convertedBuyNowPrice && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Buy Now Price</p>
                                                    <p className="font-semibold">
                                                        {formatCurrency(auction?.convertedBuyNowPrice)}
                                                    </p>
                                                </div>
                                            )
                                        } */}
                                        <div>
                                            <p className="text-sm text-gray-500">Total Offers</p>
                                            <p className="font-semibold">{auction?.offersCount} offers</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Bids</p>
                                            <p className="font-semibold">{auction?.bidCount} bids</p>
                                        </div>

                                        {/* {
                                            auction?.invoice && (
                                                <div>
                                                    <p className="text-sm text-gray-500">Invoice</p>
                                                    <Link target="_blank" to={auction?.invoice?.url} className="font-semibold text-blue-600 underline">
                                                        View
                                                    </Link>
                                                </div>
                                            )
                                        } */}
                                    </div>

                                    {/* Seller Info */}
                                    <div className="border-t border-gray-200 pt-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                                    {auction.seller.firstName.charAt(0)}
                                                </div>
                                                <div>
                                                    <Link className="font-semibold underline" to={`/seller-reviews/${auction?.seller?._id}`}>{auction.seller.firstName} {auction.seller.lastName}</Link>
                                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                                        Member Since: {new Date(auction.seller.createdAt).getFullYear()}
                                                    </div>
                                                </div>
                                            </div>
                                            {<button
                                                onClick={() => openContactModal(auction)}
                                                className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                            >
                                                <MessageCircle size={14} />
                                                Contact
                                            </button>}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-3">
                                        {
                                            canPayForAuction(auction) && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handlePayNow(auction)}
                                                        disabled={processingPayment === auction._id}
                                                        className={`flex-1 flex items-center justify-center gap-2 ${processingPayment === auction._id
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : auction.paymentStatus === "failed"
                                                                ? "bg-orange-600 hover:bg-orange-700"
                                                                : "bg-green-600 hover:bg-green-700"
                                                            } text-white py-3 rounded-lg font-semibold transition-all`}
                                                    >
                                                        {processingPayment === auction._id ? (
                                                            <>
                                                                <Loader size={18} />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CreditCard size={18} />
                                                                {auction.paymentStatus === "failed" ? "Retry Payment" : "Pay Now"}
                                                            </>
                                                        )}
                                                    </button>

                                                    {/* <Link
                                                        to={`/auction/${auction._id}`}
                                                        target="_blank"
                                                        className="flex-1 text-center bg-primary text-white hover:bg-primary/90 py-3 rounded-lg font-semibold transition-all"
                                                    >
                                                        View Auction
                                                    </Link> */}
                                                </div>
                                            )
                                        }

                                        <Link
                                            to={`/auction/${auction._id}`}
                                            target="_blank"
                                            className="flex-1 text-center bg-primary text-white hover:bg-primary/90 py-3 rounded-lg font-semibold transition-all"
                                        >
                                            View Auction
                                        </Link>

                                        {!auction.userReview && auction.auctionStatus === 'sold' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedAuction(auction);
                                                    setShowReviewModal(true);
                                                    setRevieweeId(auction.seller._id);
                                                }}
                                                className="bg-purple-600 text-white px-4 py-3 rounded-md hover:bg-purple-700 transition-colors"
                                            >
                                                Rate Seller
                                            </button>
                                        )}
                                    </div>

                                    {/* Add payment status messages */}
                                    {paymentStatus[auction._id] && (
                                        <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${paymentStatus[auction._id].success
                                            ? "bg-green-50 text-green-700 border border-green-200"
                                            : "bg-red-50 text-red-700 border border-red-200"
                                            }`}>
                                            {paymentStatus[auction._id].success ? (
                                                <CheckCircle size={18} className="text-green-600" />
                                            ) : (
                                                <XCircle size={18} className="text-red-600" />
                                            )}
                                            <span className="text-sm">{paymentStatus[auction._id].message}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {auctions.length === 0 && !loading && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                            <Award size={64} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
                                {searchTerm || filter !== "all"
                                    ? "No matching auctions found"
                                    : "No won auctions yet"}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {searchTerm || filter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "Start bidding on aviation auctions to see your wins here!"}
                            </p>
                            <Link to={`/auctions`} target="_blank" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
                                Browse Active Auctions
                            </Link>
                        </div>
                    )}

                    <ReviewModal
                        isOpen={showReviewModal}
                        onClose={() => setShowReviewModal(false)}
                        auctionId={selectedAuction?._id}
                        revieweeId={revieweeId}
                        onSuccess={() => {
                            setUserReview({}); // mark as reviewed
                            toast.success("Thank you for your review!");
                        }}
                    />

                    {/* Contact Seller Modal */}
                    {showContactModal && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Contact Seller</h3>
                                    <p className="text-gray-600 text-sm">
                                        Reach out to {selectedAuction.seller.name}
                                    </p>
                                </div>
                                <div className="p-6 space-y-4">
                                    <Link to={`mailto:${selectedAuction.seller.email}`} className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Mail size={20} className="text-blue-600" />
                                        <span>Send Email ({selectedAuction.seller.email})</span>
                                    </Link>
                                    <Link to={`tel:${selectedAuction.seller.phone}`} className="w-full flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        <Phone size={20} className="text-purple-600" />
                                        <span>Call ({selectedAuction.seller.phone})</span>
                                    </Link>
                                </div>
                                <div className="p-4 border-t border-gray-200 flex gap-3">
                                    <button
                                        onClick={() => setShowContactModal(false)}
                                        className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default WonAuctions;