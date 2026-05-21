import React, { useState } from 'react';
import { Banknote, User, Clock, CheckCircle, XCircle, MessageSquare, AlertCircle, RefreshCw, TrendingUp, Shield } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import { toast } from 'react-hot-toast';

const OffersSection = ({ offers, auction, onAuctionUpdate }) => {
    const [responding, setResponding] = useState(false);
    const [selectedOfferId, setSelectedOfferId] = useState(null);

    if (!offers || offers.length === 0) {
        return (
            <div className="text-center py-8">
                <Banknote className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-gray-600">You haven't made any offers on this auction</p>
            </div>
        );
    }

    const reversedOffers = offers.slice().reverse();

    const handleAcceptCounterOffer = async (offerId) => {
        try {
            setResponding(true);

            const res = await axiosInstance.post(`/api/v1/offers/auction/${auction._id}/offer/${offerId}/accept-counter`);

            if (res.data.success) {
                // Use the callback to update auction state
                if (onAuctionUpdate) {
                    onAuctionUpdate(res.data.data.auction);
                }
                toast.success('Counter offer accepted! Auction is now sold to you.');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to accept counter offer');
        } finally {
            setResponding(false);
        }
    };

    const handleWithdrawOffer = async (offerId) => {
        if (!window.confirm('Are you sure you want to withdraw this offer? This action cannot be undone.')) {
            return;
        }

        try {
            setResponding(true);

            const res = await axiosInstance.post(`/api/v1/offers/auction/${auction._id}/offer/${offerId}/withdraw`);

            if (res.data.success) {
                // Use the callback to update auction state in parent
                if (onAuctionUpdate) {
                    onAuctionUpdate(res.data.data.auction);
                }
                toast.success('Offer withdrawn successfully');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to withdraw offer');
        } finally {
            setResponding(false);
        }
    };

    const getStatusConfig = (status) => {
        const config = {
            pending: {
                color: 'bg-yellow-100 text-yellow-800',
                icon: <Clock className="h-4 w-4" />,
                text: 'Pending',
                description: 'Waiting for seller response'
            },
            accepted: {
                color: 'bg-green-100 text-green-800',
                icon: <CheckCircle className="h-4 w-4" />,
                text: 'Accepted',
                description: 'Offer accepted! Auction sold.'
            },
            rejected: {
                color: 'bg-red-100 text-red-800',
                icon: <XCircle className="h-4 w-4" />,
                text: 'Rejected',
                description: 'Seller declined your offer'
            },
            countered: {
                color: 'bg-blue-100 text-blue-800',
                icon: <TrendingUp className="h-4 w-4" />,
                text: 'Countered',
                description: 'Seller made a counter offer'
            },
            expired: {
                color: 'bg-gray-100 text-gray-800',
                icon: <Clock className="h-4 w-4" />,
                text: 'Expired',
                description: 'Offer expired after 48 hours'
            },
            withdrawn: {
                color: 'bg-gray-100 text-gray-800',
                icon: <RefreshCw className="h-4 w-4" />,
                text: 'Withdrawn',
                description: 'You withdrew this offer'
            }
        };

        return config[status] || {
            color: 'bg-gray-100 text-gray-800',
            icon: <AlertCircle className="h-4 w-4" />,
            text: status,
            description: ''
        };
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('nb-NO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate time remaining for pending offers
    const getTimeRemaining = (expiresAt) => {
        if (!expiresAt) return null;

        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry - now;

        if (diffMs <= 0) return null;

        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m remaining`;
        }
        return `${diffMinutes}m remaining`;
    };

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-primary flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Your Offers
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Private offers you've made on this auction. Only you and the seller can see these.
                </p>
            </div>

            {/* Offers List */}
            <div className="space-y-4">
                {reversedOffers?.map((offer) => {
                    const statusConfig = getStatusConfig(offer.status);
                    const timeRemaining = offer.status === 'pending' ? getTimeRemaining(offer.expiresAt) : null;

                    return (
                        <div key={offer._id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                            {/* Offer Header */}
                            <div className="flex justify-between items-start">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-full ${statusConfig.color.replace('bg-', 'bg-').replace('text-', 'text-')}`}>
                                        {statusConfig.icon}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-xl ${offer.status === 'accepted' ? 'text-green-600' : ''}`}>
                                                {offer.amount.toLocaleString()} kr
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                                                {statusConfig.text}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Submitted on {formatDate(offer.createdAt)}
                                        </p>
                                        {timeRemaining && (
                                            <p className="text-sm text-yellow-600 mt-1 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                Expires in {timeRemaining}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Description */}
                                <div className="text-right">
                                    <p className="text-sm text-gray-700">{statusConfig.description}</p>
                                </div>
                            </div>

                            {/* Offer Message */}
                            {offer.message && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{offer.message}</p>
                                    </div>
                                </div>
                            )}

                            {/* Counter Offer Section */}
                            {offer.status === 'countered' && offer.counterOffer && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-5 w-5 text-blue-600" />
                                        <h4 className="font-medium text-blue-800">Counter Offer from Seller</h4>
                                    </div>

                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="text-2xl font-bold text-blue-700">
                                                {offer.counterOffer.amount.toLocaleString()} kr
                                            </p>
                                            <p className="text-sm text-blue-600">New price proposed by seller</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Previous: {offer.amount.toLocaleString()} kr</p>
                                            <p className="text-sm font-medium text-blue-600">
                                                +{(offer.counterOffer.amount - offer.amount).toLocaleString()} kr
                                            </p>
                                        </div>
                                    </div>

                                    {offer.counterOffer.message && (
                                        <div className="mb-3 p-3 bg-white rounded border border-blue-100">
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">Seller's message:</span> {offer.counterOffer.message}
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons for Counter Offer */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAcceptCounterOffer(offer._id)}
                                            disabled={responding}
                                            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="h-4 w-4" />
                                            Accept Counter Offer
                                        </button>
                                        <button
                                            onClick={() => handleWithdrawOffer(offer._id)}
                                            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Seller Response */}
                            {offer.sellerResponse && offer.status !== 'countered' && (
                                <div className={`mt-3 p-3 rounded-lg ${offer.status === 'accepted' ? 'bg-green-50 border border-green-100' :
                                    offer.status === 'rejected' ? 'bg-red-50 border border-red-100' :
                                        'bg-gray-50 border border-gray-100'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <User className="h-4 w-4 text-gray-500" />
                                        <span className="font-medium text-gray-700">Seller Response:</span>
                                    </div>
                                    <p className={`text-sm ${offer.status === 'accepted' ? 'text-green-700' :
                                        offer.status === 'rejected' ? 'text-red-700' :
                                            'text-gray-600'
                                        }`}>
                                        "{offer.sellerResponse}"
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                {offer.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleWithdrawOffer(offer._id)}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Withdraw Offer
                                        </button>
                                    </div>
                                )}

                                {offer.status === 'accepted' && (
                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <CheckCircle className="h-5 w-5" />
                                            <p className="font-medium">Congratulations! This auction is sold to you.</p>
                                        </div>
                                        <p className="text-sm text-green-600 mt-1">
                                            Final price: <span className="font-bold">{offer.amount.toLocaleString()} kr</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    About Private Offers
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Offers are private between you and the seller</li>
                    <li>• Other bidders cannot see your offers</li>
                    <li>• Pending offers expire after 48 hours</li>
                    <li>• You can withdraw pending offers anytime</li>
                    <li>• If seller counters, you have 48 hours to respond</li>
                    <li>• Accepted offers immediately end the auction</li>
                </ul>
            </div>
        </div>
    );
};

export default OffersSection;