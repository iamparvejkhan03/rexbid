import { forwardRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const PilotPhaseModal = forwardRef((props, ref) => {
    const {
        isOpen,
        onClose
    } = props;

    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = "Phone number is required";
        } else if (!/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(phoneNumber)) {
            newErrors.phoneNumber = "Please enter a valid phone number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { data } = await axiosInstance.post("/api/v1/pilot-notification", {
                email,
                phoneNumber,
            });

            if (data.success) {
                setIsSubmitted(true);
                setTimeout(() => {
                    onClose();
                }, 3000);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center py-3 px-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Pilot Phase Notice
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                    >
                        ×
                    </button>
                </div>

                {!isSubmitted ? (
                    <>
                        {/* Warning Message */}
                        <div className="py-3 px-6 border-b border-gray-200">
                            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-yellow-700">
                                            Please enter your email address and phone number to be notified when RexBid opens for bidding.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="py-3 px-6 space-y-4 border-b border-gray-200">

                                {/* Email Field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone Number Field */}
                                <div>
                                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="+1234567890"
                                        className={`w-full p-3 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-black focus:border-transparent`}
                                        disabled={isSubmitting}
                                    />
                                    {errors.phoneNumber && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                                    )}
                                </div>

                                {/* Submit Error */}
                                {errors.submit && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-red-600 text-sm">{errors.submit}</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="py-3 px-6 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 order-2 sm:order-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                >
                                    Close
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 order-1 sm:order-2 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Submitting..." : "Notify Me"}
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    // Success State
                    <div className="py-6 px-6 text-center space-y-4">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Thank You!</h3>
                        <p className="text-sm text-gray-600">
                            We'll notify you via SMS the moment bidding opens in July.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-900 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PilotPhaseModal;