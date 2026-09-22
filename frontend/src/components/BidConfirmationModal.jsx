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
    const [isCapped, setIsCapped] = useState(false);
    const [capDisplay, setCapDisplay] = useState("");

    const { user } = useAuth();
    const userCurrency = user?.currency || 'EUR';

    // useEffect(() => {
    //     if (!isOpen) return;

    //     const getCommission = async () => {
    //         try {
    //             const { data } = await axiosInstance.get("/api/v1/commissions");
    //             const commission = data?.data?.commission;
    //             console.log(commission)

    //             if (!commission) return;

    //             setCommissionType(commission.commissionType);
    //             setCommissionValue(commission.commissionValue);
    //             setIsCommissionEnabled(commission.isEnabled);
    //             setCommissionAppliesTo(commission.appliesTo);

    //             if (commission.commissionType === "fixed") {
    //                 setServiceFee(Number(commission.commissionValue));
    //             } else {
    //                 setServiceFee(
    //                     (Number(bidAmount) * Number(commission.commissionValue)) / 100
    //                 );
    //             }
    //         } catch (error) {
    //             console.error("Error fetching commission:", error);
    //         }
    //     };

    //     getCommission();
    // }, [bidAmount, isOpen]);

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

                // ---- 1. Compute the raw fee in user's currency ----
                let fee =
                    commission.commissionType === "fixed"
                        ? Number(commission.commissionValue)
                        : (Number(bidAmount) * Number(commission.commissionValue)) / 100;

                // ---- 2. Fetch FX rates and convert the cap ----
                const capAmount = commission.maxCommissionAmount ?? 500;
                const capCurrency = commission.maxCommissionCurrency ?? "EUR";

                // Format label always in the cap's ORIGINAL currency
                const symbol = capCurrency === "GBP" ? "£" : capCurrency === "EUR" ? "€" : "";
                setCapDisplay(`${symbol}${capAmount}`);

                // Convert cap to the user's currency for comparison
                let capInUserCurrency = capAmount;

                if (capCurrency !== userCurrency) {
                    const ratesRes = await axiosInstance.get("/api/v1/currency/rates");
                    const rates = ratesRes.data || {};   // direct object, no wrapper
                    const rate = rates[capCurrency]?.rates?.[userCurrency];
                    if (rate) {
                        capInUserCurrency = capAmount * rate;
                    } else {
                        console.warn(
                            `FX rate missing for ${capCurrency} → ${userCurrency}. ` +
                            `Cap will not be converted correctly.`
                        );
                    }
                }

                // ---- 3. Apply the cap ----
                if (capInUserCurrency > 0 && fee > capInUserCurrency) {
                    fee = capInUserCurrency;
                    setIsCapped(true);
                } else {
                    setIsCapped(false);
                }

                setServiceFee(fee);
            } catch (error) {
                console.error("Error fetching commission:", error);
            }
        };

        getCommission();
    }, [bidAmount, isOpen, userCurrency]);

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
                            {/* {isCommissionEnabled && commissionAppliesTo?.includes('bidder') && <tr>
                                <td className="text-gray-600">Commission Fee:</td>
                                <td className="text-right text-gray-900">
                                    {formatCurrency(serviceFee)}
                                </td>
                            </tr>} */}
                            {isCommissionEnabled && commissionAppliesTo?.includes("bidder") && (
                                <tr>
                                    <td className="text-gray-600">
                                        Commission Fee:
                                        {isCapped && capDisplay && (
                                            <span className="ml-2 text-xs text-gray-400">
                                                (capped at {capDisplay})
                                            </span>
                                        )}
                                    </td>
                                    <td className="text-right text-gray-900">
                                        {formatCurrency(serviceFee)}
                                    </td>
                                </tr>
                            )}
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
                        <a href="/buyer-terms" target="_blank" className="text-blue-600 hover:text-blue-800 underline">
                            buyer's terms.
                        </a>
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