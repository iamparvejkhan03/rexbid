import { forwardRef, useEffect, useState } from "react";
import { CreditCard, ShieldCheck, Loader, Plus, ArrowLeft } from "lucide-react";
import { useStripe, useElements, CardElement, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "react-hot-toast";
import axiosInstance from "../utils/axiosInstance";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Inner component so it can use useStripe/useElements
const PaymentMethodModalInner = forwardRef((props, ref) => {
    const { isOpen, onClose, onCardAdded } = props;

    const stripe = useStripe();
    const elements = useElements();

    const [step, setStep] = useState("notice"); // "notice" | "card"
    const [submitting, setSubmitting] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [billingStatus, setBillingStatus] = useState({
        hasStripeCustomer: false,
        hasCard: false,
    });

    // Fetch billing status when the modal opens
    useEffect(() => {
        if (!isOpen) return;

        const fetchStatus = async () => {
            try {
                setLoadingStatus(true);
                const { data } = await axiosInstance.get("/api/v1/users/billing");
                if (data.success) {
                    setBillingStatus({
                        hasStripeCustomer: data.data.hasStripeCustomer || false,
                        hasCard: data.data.hasCard || false,
                    });
                }
            } catch (err) {
                console.error("Fetch billing status error:", err);
                // Fall back to safe defaults; the request will figure it out
            } finally {
                setLoadingStatus(false);
            }
        };

        fetchStatus();
    }, [isOpen]);

    // Reset step each time the modal reopens
    useEffect(() => {
        if (isOpen) setStep("notice");
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProceed = () => setStep("card");

    const handleBack = () => setStep("notice");

    const handleClose = () => {
        setStep("notice");
        onClose();
    };

    const handleSubmitCard = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            toast.error("Stripe not initialized");
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            toast.error("Please enter your card details");
            return;
        }

        setSubmitting(true);

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: "card",
                card: cardElement,
            });

            if (error) {
                toast.error(`Card error: ${error.message}`);
                return;
            }

            const isCreate = !billingStatus.hasStripeCustomer;
            const endpoint = isCreate
                ? "/api/v1/users/billing/create-card"
                : "/api/v1/users/billing/update-card";

            const { data } = await axiosInstance({
                method: isCreate ? "post" : "put",
                url: endpoint,
                data: { paymentMethodId: paymentMethod.id },
            });

            if (data.success) {
                try {
                    cardElement.clear();
                } catch (err) {
                    console.debug("CardElement already unmounted, skipping clear:", err?.message);
                }

                toast.success("Bidder verified successfully!");
                setStep("notice");
                // Fire the resume callback
                onCardAdded?.();
            } else {
                toast.error(data.message || "Failed to add card");
            }
        } catch (error) {
            const msg =
                error?.response?.data?.message ||
                error.message ||
                "Failed to add card. Please try again.";
            toast.error(msg);
            console.error("Add card error:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {step === "notice" ? "Bidder Verification Required" : "Add Card"}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {step === "notice" ? (
                    <>
                        {/* Body: Notice */}
                        <div className="py-5 px-6 space-y-4">
                            <div className="flex justify-center">
                                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                                    <CreditCard className="h-7 w-7 text-blue-600" />
                                </div>
                            </div>

                            <p className="text-gray-700 text-center">
                                To help keep RexBid secure and reduce non-genuine bidding, all bidders are required to link a valid card before placing their first bid.
                            </p>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                                <div className="flex gap-3">
                                    <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-blue-800">
                                        No deposit is taken and your card will not be automatically charged when you bid.
                                        Winning purchases are paid separately by bank transfer.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="py-3 px-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 order-2 sm:order-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleProceed}
                                disabled={loadingStatus}
                                className="flex-1 order-1 sm:order-2 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {loadingStatus ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Checking...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Add Card
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleSubmitCard}>
                        {/* Body: Card form */}
                        <div className="py-5 px-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Card Information
                                </label>
                                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                                    <CardElement
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: "16px",
                                                    color: "#424770",
                                                    fontFamily:
                                                        '"Helvetica Neue", Helvetica, sans-serif',
                                                    "::placeholder": {
                                                        color: "#aab7c4",
                                                    },
                                                },
                                                invalid: {
                                                    color: "#fa755a",
                                                    iconColor: "#fa755a",
                                                },
                                            },
                                            hidePostalCode: true,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <ShieldCheck
                                        size={18}
                                        className="text-blue-600 mt-0.5 flex-shrink-0"
                                    />
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">Secure</p>
                                        <p>
                                            Your card is encrypted and stored by Stripe. We never see your full card number.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="py-3 px-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={submitting}
                                className="flex-1 order-2 sm:order-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !stripe}
                                className="flex-1 order-1 sm:order-2 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <Plus size={16} />
                                        Add Card
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
});

// Outer wrapper — only renders Elements when the modal is open
const PaymentMethodModal = forwardRef((props, ref) => {
    if (!props.isOpen) return null;
    return (
        <Elements stripe={stripePromise}>
            <PaymentMethodModalInner {...props} ref={ref} />
        </Elements>
    );
});

PaymentMethodModal.displayName = "PaymentMethodModal";

export default PaymentMethodModal;