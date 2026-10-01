import { forwardRef } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

const PaymentMethodModal = forwardRef((props, ref) => {
    const { isOpen, onClose, onProceed } = props;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Payment Method Required
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="py-5 px-6 space-y-4">
                    <div className="flex justify-center">
                        <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                            <CreditCard className="h-7 w-7 text-blue-600" />
                        </div>
                    </div>

                    <p className="text-gray-700 text-center">
                        We don't require a deposit to allow you to bid. However, as a
                        security measure, we do request that a valid card is linked to
                        your account.
                    </p>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                        <div className="flex gap-3">
                            <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-800">
                                We will never charge this card without your notice. All of
                                our payments are manually handled by Bank Transfer through
                                our payment service provider, Stripe.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="py-3 px-6 flex flex-col sm:flex-row gap-3 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 order-2 sm:order-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onProceed}
                        className="flex-1 order-1 sm:order-2 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors"
                    >
                        Proceed
                    </button>
                </div>
            </div>
        </div>
    );
});

PaymentMethodModal.displayName = "PaymentMethodModal";

export default PaymentMethodModal;