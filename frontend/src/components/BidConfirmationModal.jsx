import { forwardRef, useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../contexts/AuthContext";

const BidConfirmationModal = forwardRef((props, ref) => {
    const {
        isOpen,
        onClose,
        onConfirm,
        auction,
        bidAmount
    } = props;

    const [commissionType, setCommissionType] = useState("percentage");
    const [commissionValue, setCommissionValue] = useState(0);
    const [isCommissionEnabled, setIsCommissionEnabled] = useState(null);
    const [commissionAppliesTo, setCommissionAppliesTo] = useState([]);
    const [serviceFee, setServiceFee] = useState(0);

    const { user } = useAuth();
    const userCurrency = user?.currency || 'EUR';

    useEffect(() => {
        if (!isOpen) return;

        const getCommission = async () => {
            try {
                const { data } = await axiosInstance.get("/api/v1/commissions");
                const commission = data?.data?.commission;

                if (!commission) return;

                setCommissionType(commission.commissionType);
                setCommissionValue(commission.commissionValue);
                setIsCommissionEnabled(commission.isEnabled);
                setCommissionAppliesTo(commission.appliesTo);

                if (commission.commissionType === "fixed") {
                    setServiceFee(Number(commission.commissionValue));
                } else {
                    setServiceFee(
                        (Number(bidAmount) * Number(commission.commissionValue)) / 100
                    );
                }
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [bidAmount, isOpen]);

    if (!isOpen) return null;

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return `${userCurrency === 'GBP' ? '£' : '€'}0`;
        return `${userCurrency === 'GBP' ? '£' : '€'}${Number(amount).toLocaleString("en-IE")}`;
    };

    const total = (isCommissionEnabled && commissionAppliesTo?.includes('bidder') ? Number(bidAmount) + Number(serviceFee) : Number(bidAmount));

    return (
        <div className="fixed max-w-full inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 md:p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Confirm your bid
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                    >
                        ×
                    </button>
                </div>

                {/* Vehicle Info */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <strong className="text-gray-900">
                        {auction?.auctionType === "standard" ? "No Reserve" : "Reserve"}:{" "}
                        {auction?.title || "2016 Land Rover LR4 HSE"}
                    </strong>
                </div>

                {/* Bid Details */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200">
                    <table className="w-full">
                        <tbody>
                            <tr>
                                <td className="text-gray-600">Bid Amount:</td>
                                <td className="text-right text-gray-900">
                                    {formatCurrency(bidAmount)}
                                </td>
                            </tr>
                            {isCommissionEnabled && commissionAppliesTo?.includes('bidder') && <tr>
                                <td className="text-gray-600">Service Fee:</td>
                                <td className="text-right text-gray-900">
                                    {formatCurrency(serviceFee)}
                                </td>
                            </tr>}
                            <tr className="border-t border-gray-200">
                                <td className="py-3 font-semibold text-gray-900">Total:</td>
                                <td className="py-3 text-right font-semibold text-gray-900">
                                    {formatCurrency(total)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Information Text */}
                <div className="py-3 px-6 md:p-6 border-b border-gray-200 space-y-4">
                    <p className="text-sm text-gray-600">
                        For more info, read our{" "}
                        <a href="/faqs" className="text-blue-600 hover:text-blue-800 underline">
                            FAQs
                        </a>{" "}
                        or{" "}
                        <a href="/contact" className="text-blue-600 hover:text-blue-800 underline">
                            contact us
                        </a>{" "}
                        with any questions.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="py-3 px-6 md:p-6 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 order-2 sm:order-1 py-2 px-4 md:py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        ref={ref}
                        onClick={onConfirm}
                        type="submit"
                        className="flex-1 order-1 sm:order-2 py-2 px-4 md:py-3 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors"
                    >
                        Place Bid
                    </button>
                </div>

            </div>
        </div>
    );
});

export default BidConfirmationModal;