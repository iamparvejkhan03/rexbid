import React, { useEffect, useState } from "react";
import { X, Banknote, MessageSquare } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const MakeOfferModal = ({
    isOpen,
    onClose,
    onSubmit,
    offerAmount,
    setOfferAmount,
    offerMessage,
    setOfferMessage,
    loading,
    auction,
    isPostAuction = false,
}) => {
    const [serviceFee, setServiceFee] = useState(0);
    const [isCommissionEnabled, setIsCommissionEnabled] = useState(false);
    const [isCapped, setIsCapped] = useState(false);
    const [capDisplay, setCapDisplay] = useState("");

    const { user } = useAuth();
    const userCurrency = user?.currency || "EUR";
    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (!isOpen || !offerAmount) return;

        const getCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;
                if (!commission) return;

                const tiers = commission.bidderTiers || [];
                const appliesToBidder = commission.appliesTo?.includes("bidder");
                setIsCommissionEnabled(
                    !!commission.isEnabled && appliesToBidder && tiers.length > 0
                );

                const amount = Number(offerAmount) || 0;
                let fee = 0;
                if (commission.isEnabled && appliesToBidder) {
                    for (const tier of tiers) {
                        const from = Number(tier.from) || 0;
                        const to =
                            tier.to === null || tier.to === undefined
                                ? Infinity
                                : Number(tier.to);
                        if (amount <= from) break;
                        const slice = Math.min(amount, to) - from;
                        fee += slice * (Number(tier.value) / 100);
                    }
                }

                const capAmount = commission.maxCommissionAmount;
                const capCurrency = commission.maxCommissionCurrency ?? "EUR";
                let capped = false;
                let capInUserCurrency = 0;

                if (capAmount && capAmount > 0) {
                    capInUserCurrency = capAmount;
                    const symbol =
                        capCurrency === "GBP" ? "£" : capCurrency === "EUR" ? "€" : "";
                    setCapDisplay(`${symbol}${capAmount}`);

                    if (capCurrency !== userCurrency) {
                        const ratesRes = await axiosInstance.get("/api/v1/currency/rates");
                        const rates = ratesRes.data || {};
                        const rate = rates[capCurrency]?.rates?.[userCurrency];
                        if (rate) capInUserCurrency = capAmount * rate;
                    }

                    if (fee > capInUserCurrency) {
                        fee = capInUserCurrency;
                        capped = true;
                    }
                } else {
                    setCapDisplay("");
                }

                setIsCapped(capped);
                setServiceFee(fee);
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [offerAmount, isOpen, userCurrency]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) {
            return `${userCurrency === "GBP" ? "£" : "€"}0`;
        }
        return `${userCurrency === "GBP" ? "£" : "€"}${Number(amount)
            ?.toFixed(0)
            .toLocaleString("en-IE")}`;
    };

    const total = isCommissionEnabled
        ? Number(offerAmount) + Number(serviceFee)
        : Number(offerAmount);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const isInvalidOffer =
        !offerAmount || parseFloat(offerAmount) < auction?.convertedStartPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-4">
                        <label className="flex items-center gap-2 justify-start text-lg font-medium text-gray-700 mb-2">
                            Offer Amount
                        </label>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Banknote className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your offer amount"
                                min={auction?.convertedStartPrice?.toFixed(0)}
                                required
                            />
                        </div>

                        {!isPostAuction &&
                            auction?.convertedStartPrice &&
                            auction?.convertedStartPrice > 0 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Minimum offer: {formatCurrency(auction?.convertedStartPrice)}
                                </p>
                            )}
                    </div>

                    {offerAmount && !isInvalidOffer && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Offer Amount</span>
                                <span>{formatCurrency(offerAmount)}</span>
                            </div>

                            {isCommissionEnabled && (
                                <div className="flex justify-between text-gray-700">
                                    <span>
                                        Commission Fee
                                        {isCapped && capDisplay && (
                                            <span className="ml-2 text-xs text-gray-400">
                                                (capped at {capDisplay})
                                            </span>
                                        )}
                                    </span>
                                    <span>{formatCurrency(serviceFee)}</span>
                                </div>
                            )}

                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                <span>Total Payable</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Message to Seller (Optional)
                        </label>

                        <div className="relative">
                            <div className="absolute top-3 left-3">
                                <MessageSquare className="h-5 w-5 text-gray-400" />
                            </div>
                            <textarea
                                value={offerMessage}
                                onChange={(e) => setOfferMessage(e.target.value)}
                                className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a message to the seller..."
                                rows="2"
                            />
                        </div>

                        {!isPostAuction && (
                            <p className="text-sm text-gray-500 mt-1">
                                Your offer will expire in 15 days if not responded to.
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors order-2 md:order-1"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || isInvalidOffer}
                            className="flex-1 bg-[#edcd1f] text-black py-3 px-4 rounded-lg hover:bg-[#edcd1f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 md:order-2"
                        >
                            {loading ? "Submitting..." : "Submit Offer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MakeOfferModal;