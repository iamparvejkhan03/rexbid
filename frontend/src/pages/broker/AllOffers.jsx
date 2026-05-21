import { useState, useEffect, useMemo } from "react";
import {
    Search, Filter, Calendar, Clock, CheckCircle, XCircle, RefreshCw,
    MessageSquare, Eye, User, Mail, Phone, Building, TrendingUp,
    DollarSign, Package, Award, AlertCircle, Ban, ChevronRight
} from "lucide-react";
import { LoadingSpinner, BrokerContainer, BrokerHeader, BrokerSidebar } from "../../components";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

function AllOffers() {
    const [offers, setOffers] = useState([]);
    const [allOffers, setAllOffers] = useState([]);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [processing, setProcessing] = useState(false);
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [responseData, setResponseData] = useState({
        action: 'accept',
        message: '',
        counterAmount: ''
    });

    // Filters
    const [filters, setFilters] = useState({
        status: "all",
        auction: "all",
        search: "",
        sortBy: "recent",
        dateRange: "all"
    });

    // Fetch all offers for seller
    const fetchBrokerOffers = async () => {
        try {
            setLoading(true);

            const [offersResponse, statsResponse] = await Promise.all([
                axiosInstance.get(`/api/v1/offers/seller`),
                axiosInstance.get('/api/v1/offers/seller/stats') // You'll need to create this endpoint
            ]);

            if (offersResponse.data.success) {
                setAllOffers(offersResponse.data.data.offers);
                if (offersResponse.data.data.offers.length > 0) {
                    setSelectedOffer(offersResponse.data.data.offers[0]);
                }
            }

            if (statsResponse.data.success) {
                setStats(statsResponse.data.data);
            }

        } catch (error) {
            console.error('Fetch broker offers error:', error);
            toast.error('Failed to load offers');
        } finally {
            setLoading(false);
        }
    };

    // Get unique auctions for filter
    const uniqueAuctions = useMemo(() => {
        const auctions = allOffers.map(offer => ({
            id: offer.auction._id,
            title: offer.auction.title
        }));
        const unique = auctions.filter((auction, index, self) =>
            index === self.findIndex(a => a.id === auction.id)
        );
        return unique;
    }, [allOffers]);

    // Apply filters locally
    const filteredOffers = useMemo(() => {
        let filtered = [...allOffers];

        // Search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(offer =>
                offer.auction.title.toLowerCase().includes(searchTerm) ||
                offer.buyerUsername.toLowerCase().includes(searchTerm) ||
                offer.buyer?.firstName?.toLowerCase().includes(searchTerm) ||
                offer.buyer?.lastName?.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter
        if (filters.status !== "all") {
            filtered = filtered.filter(offer => offer.status === filters.status);
        }

        // Auction filter
        if (filters.auction !== "all") {
            filtered = filtered.filter(offer => offer.auction._id === filters.auction);
        }

        // Date range filter
        if (filters.dateRange !== "all") {
            const now = new Date();
            const cutoff = new Date();

            switch (filters.dateRange) {
                case "today":
                    cutoff.setHours(0, 0, 0, 0);
                    break;
                case "week":
                    cutoff.setDate(now.getDate() - 7);
                    break;
                case "month":
                    cutoff.setMonth(now.getMonth() - 1);
                    break;
            }

            filtered = filtered.filter(offer => new Date(offer.createdAt) >= cutoff);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case "recent":
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case "oldest":
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case "amount_high":
                    return b.amount - a.amount;
                case "amount_low":
                    return a.amount - b.amount;
                case "expiring_soon":
                    if (a.status === 'pending' && b.status === 'pending') {
                        return new Date(a.expiresAt) - new Date(b.expiresAt);
                    }
                    return a.status === 'pending' ? -1 : 1;
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }, [allOffers, filters]);

    // Initial fetch
    useEffect(() => {
        fetchBrokerOffers();
    }, []);

    // Handle filter changes
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            status: "all",
            auction: "all",
            search: "",
            sortBy: "recent",
            dateRange: "all"
        });
    };

    // Handle broker response to offer
    const handleRespondToOffer = async () => {
        if (!selectedOffer) return;

        // Validate counter offer amount
        if (responseData.action === 'counter') {
            const counterAmount = parseFloat(responseData.counterAmount);
            if (isNaN(counterAmount) || counterAmount <= selectedOffer.amount) {
                toast.error('Counter offer must be higher than the original offer');
                return;
            }
            if (selectedOffer.auction.buyNowPrice && counterAmount >= selectedOffer.auction.buyNowPrice) {
                toast.error('Counter offer cannot exceed Buy Now price');
                return;
            }
        }

        try {
            setProcessing(true);

            const payload = {
                auctionId: selectedOffer.auction._id,
                response: responseData.action,
                message: responseData.message
            };

            if (responseData.action === 'counter') {
                payload.counterAmount = parseFloat(responseData.counterAmount);
                payload.counterMessage = responseData.message;
            }

            const res = await axiosInstance.post(
                `/api/v1/offers/auction/${selectedOffer.auction._id}/offer/${selectedOffer._id}/respond`,
                payload
            );

            if (res.data.success) {
                toast.success(`Offer ${responseData.action}ed successfully`);
                setShowRespondModal(false);
                setResponseData({ action: 'accept', message: '', counterAmount: '' });

                // Refresh offers
                await fetchBrokerOffers();
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to respond to offer');
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('nb-NO', {
            style: 'currency',
            currency: 'NOK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('nb-NO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('nb-NO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return null;
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry - now;

        if (diffMs <= 0) return "Expired";

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        return `${diffHours}h ${diffMinutes}m`;
    };

    const getStatusConfig = (status) => {
        const config = {
            pending: {
                icon: <Clock className="text-yellow-600" size={16} />,
                text: "Pending",
                bgColor: "bg-yellow-50",
                textColor: "text-yellow-800",
                borderColor: "border-yellow-200"
            },
            accepted: {
                icon: <CheckCircle className="text-green-600" size={16} />,
                text: "Accepted",
                bgColor: "bg-green-50",
                textColor: "text-green-800",
                borderColor: "border-green-200"
            },
            rejected: {
                icon: <XCircle className="text-red-600" size={16} />,
                text: "Rejected",
                bgColor: "bg-red-50",
                textColor: "text-red-800",
                borderColor: "border-red-200"
            },
            countered: {
                icon: <TrendingUp className="text-blue-600" size={16} />,
                text: "Countered",
                bgColor: "bg-blue-50",
                textColor: "text-blue-800",
                borderColor: "border-blue-200"
            },
            expired: {
                icon: <Clock className="text-gray-600" size={16} />,
                text: "Expired",
                bgColor: "bg-gray-50",
                textColor: "text-gray-800",
                borderColor: "border-gray-200"
            },
            withdrawn: {
                icon: <RefreshCw className="text-gray-600" size={16} />,
                text: "Withdrawn",
                bgColor: "bg-gray-50",
                textColor: "text-gray-800",
                borderColor: "border-gray-200"
            }
        };
        return config[status] || config.pending;
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case "Aircraft":
                return <Package size={18} className="text-blue-600" />;
            case "Engines & Parts":
                return <Package size={18} className="text-green-600" />;
            case "Memorabilia":
                return <Award size={18} className="text-amber-600" />;
            default:
                return <Package size={18} className="text-gray-600" />;
        }
    };

    // Stats cards configuration
    const statCards = [
        {
            title: "Total Offers",
            value: stats.totalOffers?.toLocaleString('nb-NO') || "0",
            change: "Across all your auctions",
            icon: <DollarSign size={24} />,
            color: "blue"
        },
        {
            title: "Pending Offers",
            value: stats.pending?.toLocaleString('nb-NO') || "0",
            change: `Worth ${formatCurrency(stats.pendingValue || 0)}`,
            icon: <Clock size={24} />,
            color: "yellow"
        },
        {
            title: "Total Value",
            value: formatCurrency(stats.totalValue || 0),
            change: `Avg: ${formatCurrency(stats.avgOfferAmount || 0)}`,
            icon: <TrendingUp size={24} />,
            color: "green"
        },
        {
            title: "Success Rate",
            value: `${stats.successRate || 0}%`,
            change: `${stats.accepted || 0} accepted offers`,
            icon: <CheckCircle size={24} />,
            color: "purple"
        }
    ];

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <BrokerSidebar />
                <div className="w-full relative">
                    <BrokerHeader />
                    <BrokerContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </BrokerContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <BrokerSidebar />
            <div className="w-full relative">
                <BrokerHeader />
                <BrokerContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Offers Management</h2>
                        <p className="text-gray-600">Review and respond to offers on your auctions.</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {statCards.map((stat, index) => (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                                    </div>
                                    <div className={`p-3 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                                        {stat.icon}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Search */}
                            <div className="lg:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by auction, buyer..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={filters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="accepted">Accepted</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="expired">Expired</option>
                                    <option value="withdrawn">Withdrawn</option>
                                </select>
                            </div>

                            {/* Auction Filter */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.auction}
                                    onChange={(e) => handleFilterChange('auction', e.target.value)}
                                >
                                    <option value="all">All Auctions</option>
                                    {uniqueAuctions.map(auction => (
                                        <option key={auction.id} value={auction.id}>
                                            {auction.title.length > 30
                                                ? auction.title.substring(0, 30) + '...'
                                                : auction.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="recent">Most Recent</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="amount_high">Highest Amount</option>
                                    <option value="amount_low">Lowest Amount</option>
                                    <option value="expiring_soon">Expiring Soon</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex justify-end items-center mt-4">
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-gray-500">
                                    Showing {filteredOffers.length} of {allOffers.length} offers
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Offers List & Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Offers Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Offers ({filteredOffers.length})</h3>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {filteredOffers.map(offer => {
                                        const statusConfig = getStatusConfig(offer.status);
                                        return (
                                            <div
                                                key={offer._id}
                                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedOffer?._id === offer._id ? 'bg-blue-50 border-blue-200' : ''
                                                    }`}
                                                onClick={() => setSelectedOffer(offer)}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                                                                {statusConfig.text}
                                                            </span>
                                                            <span className="text-xs font-medium text-gray-900">
                                                                {formatCurrency(offer.amount)}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                                            {offer.auction.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                            <User size={12} />
                                                            <span>{offer.buyerUsername}</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-xs text-gray-500">
                                                                {formatDate(offer.createdAt)}
                                                            </span>
                                                            {offer.status === 'pending' && offer.expiresAt && (
                                                                <span className="text-xs text-yellow-600">
                                                                    <Clock size={10} className="inline mr-1" />
                                                                    {getTimeRemaining(offer.expiresAt)}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Selected Offer Details */}
                        <div className="lg:col-span-2">
                            {selectedOffer ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                    {/* Offer Header */}
                                    <div className="p-6 border-b border-gray-200">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    {getCategoryIcon(selectedOffer.auction.category)}
                                                    <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                        {selectedOffer.auction.category}
                                                    </span>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${getStatusConfig(selectedOffer.status).bgColor} ${getStatusConfig(selectedOffer.status).textColor}`}>
                                                        {getStatusConfig(selectedOffer.status).icon}
                                                        {getStatusConfig(selectedOffer.status).text}
                                                    </div>
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedOffer.auction.title}</h2>
                                            </div>
                                            <a
                                                href={`/auction/${selectedOffer.auction._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                                title="View Auction"
                                            >
                                                <Eye size={18} />
                                            </a>
                                        </div>

                                        {/* Offer Details */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Offer Amount & Timing */}
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-600 mb-2">Offer Details</div>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-2xl font-bold text-blue-600">
                                                                {formatCurrency(selectedOffer.amount)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">Offered Amount</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-medium">
                                                                {formatCurrency(selectedOffer.auction.startPrice)}
                                                            </div>
                                                            <div className="text-sm text-gray-500">Starting Price</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <div className="text-sm text-gray-600">Submitted</div>
                                                        <div className="font-medium">{formatDate(selectedOffer.createdAt)}</div>
                                                    </div>
                                                    {selectedOffer.status === 'pending' && selectedOffer.expiresAt && (
                                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                            <div className="text-sm text-yellow-700">Expires In</div>
                                                            <div className="font-medium text-yellow-800">
                                                                <Clock size={14} className="inline mr-1" />
                                                                {getTimeRemaining(selectedOffer.expiresAt)}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Buyer Info */}
                                            <div className="space-y-4">
                                                <div className="bg-blue-50 p-4 rounded-lg">
                                                    <div className="text-sm text-blue-700 mb-2">Buyer Information</div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <User size={14} className="text-blue-600" />
                                                            <span className="font-medium">{selectedOffer.buyerUsername}</span>
                                                        </div>
                                                        {/* {selectedOffer.buyer && (
                                                            <>
                                                                {selectedOffer.buyer.email && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Mail size={12} className="text-gray-500" />
                                                                        <span className="text-gray-600">{selectedOffer.buyer.email}</span>
                                                                    </div>
                                                                )}
                                                                {selectedOffer.buyer.phone && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Phone size={12} className="text-gray-500" />
                                                                        <span className="text-gray-600">{selectedOffer.buyer.phone}</span>
                                                                    </div>
                                                                )}
                                                                {selectedOffer.buyer.company && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Building size={12} className="text-gray-500" />
                                                                        <span className="text-gray-600">{selectedOffer.buyer.company}</span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )} */}
                                                    </div>
                                                </div>

                                                {selectedOffer.auction.buyNowPrice && (
                                                    <div className="bg-green-50 p-3 rounded-lg">
                                                        <div className="text-sm text-green-700">Buy Now Price</div>
                                                        <div className="font-medium text-green-800">
                                                            {formatCurrency(selectedOffer.auction.buyNowPrice)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Messages & Actions */}
                                    <div className="p-6">
                                        {/* Buyer's Message */}
                                        {selectedOffer.message && (
                                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MessageSquare size={16} className="text-gray-500" />
                                                    <h4 className="font-medium text-gray-700">Buyer's Message</h4>
                                                </div>
                                                <p className="text-gray-600 text-sm">{selectedOffer.message}</p>
                                            </div>
                                        )}

                                        {/* Counter Offer Info */}
                                        {selectedOffer.status === 'countered' && selectedOffer.counterOffer && (
                                            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp size={16} className="text-blue-600" />
                                                    <h4 className="font-medium text-blue-800">Your Counter Offer</h4>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <div className="text-sm text-blue-600">Counter Amount</div>
                                                        <div className="text-xl font-bold text-blue-700">
                                                            {formatCurrency(selectedOffer.counterOffer.amount)}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-600">Original Offer</div>
                                                        <div className="font-medium text-gray-700">
                                                            {formatCurrency(selectedOffer.amount)}
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedOffer.counterOffer.message && (
                                                    <div className="p-3 bg-white rounded border border-blue-100">
                                                        <p className="text-sm text-gray-700">
                                                            <span className="font-medium">Your message:</span> {selectedOffer.counterOffer.message}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="mt-3 text-sm text-blue-600">
                                                    ⏳ Waiting for buyer to respond to your counter offer
                                                </div>
                                            </div>
                                        )}

                                        {/* Broker Actions */}
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h4 className="font-medium text-gray-700 mb-4">Response Actions</h4>

                                            {selectedOffer.status === 'pending' && (
                                                <div className="space-y-4">
                                                    <div className="flex flex-wrap gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setResponseData({ action: 'accept', message: '', counterAmount: '' });
                                                                setShowRespondModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Accept Offer
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setResponseData({ action: 'reject', message: '', counterAmount: '' });
                                                                setShowRespondModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <XCircle size={16} />
                                                            Reject Offer
                                                        </button>
                                                        {/* <button
                                                            onClick={() => {
                                                                setResponseData({ action: 'counter', message: '', counterAmount: '' });
                                                                setShowRespondModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                                        >
                                                            <TrendingUp size={16} />
                                                            Make Counter Offer
                                                        </button> */}
                                                    </div>
                                                    <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                                                        <AlertCircle size={16} className="inline mr-1 text-yellow-600" />
                                                        Offer will expire on {formatDateTime(selectedOffer.expiresAt)}
                                                    </div>
                                                </div>
                                            )}

                                            {selectedOffer.status === 'countered' && (
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                    <p className="text-sm text-blue-700">
                                                        You've already sent a counter offer. Waiting for buyer's response.
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOffer.status === 'accepted' && (
                                                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                    <p className="text-sm text-green-700">
                                                        ✅ You've accepted this offer. The auction has ended and the item is sold to {selectedOffer.buyerUsername}.
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOffer.status === 'rejected' && (
                                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                                    <p className="text-sm text-red-700">
                                                        You've rejected this offer. The buyer has been notified.
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOffer.status === 'expired' && (
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        This offer has expired. No further action is needed.
                                                    </p>
                                                </div>
                                            )}

                                            {selectedOffer.status === 'withdrawn' && (
                                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                    <p className="text-sm text-gray-700">
                                                        The buyer has withdrawn this offer.
                                                    </p>
                                                </div>
                                            )}

                                            <a
                                                href={`/auction/${selectedOffer.auction._id}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 inline-block px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Eye size={16} className="inline mr-2" />
                                                View Full Auction Details
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Offer Selected</h3>
                                    <p className="text-gray-500">Select an offer from the list to review details and respond</p>
                                </div>
                            )}
                        </div>
                    </div>
                </BrokerContainer>
            </div>

            {/* Response Modal */}
            {showRespondModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">
                            {responseData.action === 'accept' && 'Accept Offer'}
                            {responseData.action === 'reject' && 'Reject Offer'}
                            {responseData.action === 'counter' && 'Make Counter Offer'}
                        </h3>

                        {responseData.action === 'accept' && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-700 font-medium mb-2">⚠️ Accepting will:</p>
                                <ul className="text-sm text-green-600 space-y-1 list-disc pl-4">
                                    <li>End the auction immediately</li>
                                    <li>Sell to <strong>{selectedOffer?.buyerUsername}</strong></li>
                                    <li>Set final price to <strong>{formatCurrency(selectedOffer?.amount)}</strong></li>
                                    <li>Reject all other pending offers</li>
                                </ul>
                            </div>
                        )}

                        {responseData.action === 'counter' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Counter Offer Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">kr</span>
                                    <input
                                        type="number"
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        value={responseData.counterAmount}
                                        onChange={(e) => setResponseData(prev => ({ ...prev, counterAmount: e.target.value }))}
                                        placeholder="Enter amount"
                                        min={selectedOffer?.amount + 1}
                                        max={selectedOffer?.auction.buyNowPrice}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Original offer: {formatCurrency(selectedOffer?.amount)}
                                    {selectedOffer?.auction.buyNowPrice && ` • Max: ${formatCurrency(selectedOffer.auction.buyNowPrice)}`}
                                </p>
                            </div>
                        )}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Message to buyer {responseData.action === 'counter' ? '(optional)' : '(optional)'}
                            </label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                                value={responseData.message}
                                onChange={(e) => setResponseData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder={responseData.action === 'accept' ? "Add a congratulatory message..."
                                    : responseData.action === 'reject' ? "Explain why you're rejecting..."
                                        : "Explain your counter offer..."}
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowRespondModal(false);
                                    setResponseData({ action: 'accept', message: '', counterAmount: '' });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRespondToOffer}
                                className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${responseData.action === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                                        responseData.action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                            'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={processing || (responseData.action === 'counter' && !responseData.counterAmount)}
                            >
                                {processing ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        {responseData.action === 'accept' && <CheckCircle size={16} />}
                                        {responseData.action === 'reject' && <XCircle size={16} />}
                                        {responseData.action === 'counter' && <TrendingUp size={16} />}
                                        {responseData.action === 'accept' && 'Accept Offer'}
                                        {responseData.action === 'reject' && 'Reject Offer'}
                                        {responseData.action === 'counter' && 'Send Counter Offer'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AllOffers;