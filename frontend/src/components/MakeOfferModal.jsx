import React, { useEffect, useState } from "react";
import { X, Banknote, MessageSquare, Package, Hand } from "lucide-react";
import axiosInstance from "../utils/axiosInstance";

const MakeOfferModal = ({
    isOpen,
    onClose,
    onSubmit,
    offerAmount,
    setOfferAmount,
    offerMessage,
    setOfferMessage,
    loading,
    auction
}) => {
    const [serviceFee, setServiceFee] = useState(0);
    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);

    useEffect(() => {
        if (!isOpen || !offerAmount) return;

        const getCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;
                if (!commission) return;

                setCommissionType(commission.commissionType);
                setCommissionValue(commission.commissionValue);

                const amount = Number(offerAmount);

                if (commission.commissionType === "fixed") {
                    setServiceFee(Number(commission.commissionValue));
                } else {
                    setServiceFee(
                        (amount * Number(commission.commissionValue)) / 100
                    );
                }
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [offerAmount, isOpen]);

    if (!isOpen) return null;

    const formatNOK = (amount) => {
        if (!amount && amount !== 0) return "0 kr";
        return `${Number(amount).toLocaleString("nb-NO")} kr`;
    };

    const total = Number(offerAmount || 0) + Number(serviceFee);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(e);
    };

    const isInvalidOffer =
        !offerAmount || parseFloat(offerAmount) < auction?.startPrice;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md">

                {/* Header */}
                {/* <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Make an Offer
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X size={24} />
                    </button>
                </div> */}

                <form onSubmit={handleSubmit} className="p-6">

                    {/* Offer Amount */}
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
                                min={auction?.startPrice}
                                step="0.01"
                                required
                            />
                        </div>

                        {auction?.startPrice && auction?.startPrice > 0 && <p className="text-sm text-gray-500 mt-1">
                            Minimum offer: {formatNOK(auction?.startPrice)}
                        </p>}
                    </div>

                    {/* Fee Breakdown */}
                    {offerAmount && !isInvalidOffer && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                            <div className="flex justify-between text-gray-700">
                                <span>Offer Amount</span>
                                <span>{formatNOK(offerAmount)}</span>
                            </div>

                            <div className="flex justify-between text-gray-700">
                                <span>Service Fee</span>
                                <span>{formatNOK(serviceFee)}</span>
                            </div>

                            <div className="border-t pt-2 flex justify-between font-semibold text-green-600">
                                <span>Total Payable</span>
                                <span>{formatNOK(total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Message */}
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

                        <p className="text-sm text-gray-500 mt-1">
                            Your offer will expire in 48 hours if not responded to.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading || isInvalidOffer}
                            className="flex-1 bg-[#edcd1f] text-black py-3 px-4 rounded-lg hover:bg-[#edcd1f]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
