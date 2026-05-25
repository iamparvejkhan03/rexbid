import React, { useState, useEffect } from "react";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
} from "../../components";
import {
    BanknoteArrowUpIcon,
    CheckCircle,
    XCircle,
    Edit2,
    Trash2,
    Plus,
    AlertCircle,
    Icon,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import toast from "react-hot-toast";

function PayoutMethods() {
    const [loading, setLoading] = useState(true);
    const [payoutMethods, setPayoutMethods] = useState({});
    const [defaultMethod, setDefaultMethod] = useState(null);
    const [editingMethod, setEditingMethod] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchPayoutMethods();
    }, []);

    const fetchPayoutMethods = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/v1/payouts/methods");
            if (response.data.success) {
                setPayoutMethods(response.data.data.payoutMethods || {});
                setDefaultMethod(response.data.data.defaultPayoutMethod);
            }
        } catch (error) {
            console.error("Error fetching payout methods:", error);
            toast.error("Failed to load payout methods");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMethod = (method) => {
        setSelectedMethod(method);
        setFormData({});
        setShowAddModal(true);
        setEditingMethod(null);
    };

    const handleEditMethod = (method, data) => {
        setSelectedMethod(method);
        setFormData(data);
        setEditingMethod(method);
        setShowAddModal(true);
    };

    const handleRemoveMethod = async (method) => {
        if (!window.confirm(`Are you sure you want to remove your ${method} details?`)) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/api/v1/payouts/${method}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchPayoutMethods();
            }
        } catch (error) {
            console.error("Error removing method:", error);
            toast.error(error.response?.data?.message || "Failed to remove method");
        }
    };

    const handleSetDefault = async (method) => {
        try {
            const response = await axiosInstance.put("/api/v1/payouts/default", { method });
            if (response.data.success) {
                toast.success(response.data.message);
                setDefaultMethod(method);
            }
        } catch (error) {
            console.error("Error setting default method:", error);
            toast.error(error.response?.data?.message || "Failed to set default method");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let response;

            switch (selectedMethod) {
                case "paypal":
                    response = await axiosInstance.put("/api/v1/payouts/paypal", formData);
                    break;
                case "payoneer":
                    response = await axiosInstance.put("/api/v1/payouts/payoneer", formData);
                    break;
                case "bankTransfer":
                    response = await axiosInstance.put("/api/v1/payouts/bank", formData);
                    break;
                default:
                    return;
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setShowAddModal(false);
                fetchPayoutMethods();
            }
        } catch (error) {
            console.error("Error saving method:", error);
            toast.error(error.response?.data?.message || "Failed to save details");
        }
    };

    const renderMethodCard = (method, data, title) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        {/* {data && (
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${data.isVerified
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                    }`}
                            >
                                {data.isVerified ? "Verified" : "Pending Verification"}
                            </span>
                        )} */}
                    </div>
                </div>

                {defaultMethod === method && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Default
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="space-y-2 mb-4">
                {data ? (
                    <>
                        {/* {method === "paypal" && (
                            <p className="text-sm text-gray-600">Email: {data.email}</p>
                        )}

                        {method === "payoneer" && (
                            <p className="text-sm text-gray-600">Email: {data.email}</p>
                        )} */}

                        {method === "bankTransfer" && (
                            <>
                                <p className="text-sm text-gray-600">
                                    Account: {data.accountHolderName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Bank: {data.bankName}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Account Number: {data.accountNumber}
                                </p>
                                {data.iban && (
                                    <p className="text-sm text-gray-600">IBAN: {data.iban}</p>
                                )}
                                {data.swiftCode && (
                                    <p className="text-sm text-gray-600">SWIFT: {data.swiftCode}</p>
                                )}
                            </>
                        )}

                        <p className="text-xs text-gray-400">
                            Added: {new Date(data.addedAt).toLocaleDateString()}
                        </p>
                    </>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-sm text-gray-500">
                            No {title} details added yet
                        </p>
                    </div>
                )}
            </div>

            {/* Buttons pushed to bottom */}
            <div className="flex flex-col gap-2 mt-auto">
                {data ? (
                    <>
                        <button
                            onClick={() => handleEditMethod(method, data)}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                            <Edit2 size={14} />
                            Edit
                        </button>

                        <button
                            onClick={() => handleRemoveMethod(method)}
                            className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                        >
                            <Trash2 size={14} />
                            Remove
                        </button>

                        {defaultMethod !== method && (
                            <button
                                onClick={() => handleSetDefault(method)}
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                            >
                                <CheckCircle size={14} />
                                Set Default
                            </button>
                        )}
                    </>
                ) : (
                    <button
                        onClick={() => handleAddMethod(method)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                    >
                        <Plus size={14} />
                        Add {title} Details
                    </button>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                                    Bank Details
                                </h2>
                                <p className="text-secondary text-lg">
                                    Manage how you receive payments from sold auctions (bank only).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm text-blue-800">
                                Add your bank details to receive payments from successful auctions in your bank account.
                            </p>
                        </div>
                    </div>

                    {/* Methods Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                        {/* PayPal */}
                        {/* {renderMethodCard(
                            "paypal",
                            payoutMethods.paypal,
                            //   PayPal,
                            "PayPal"
                        )} */}

                        {/* Payoneer */}
                        {/* {renderMethodCard(
                            "payoneer",
                            payoutMethods.payoneer,
                            //   Payoneer,
                            "Payoneer"
                        )} */}

                        {/* Bank Transfer */}
                        {renderMethodCard(
                            "bankTransfer",
                            payoutMethods.bankTransfer,
                            //   Bank,
                            "Bank Transfer"
                        )}
                    </div>

                    {/* Add/Edit Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">
                                        {editingMethod ? "Edit" : "Add"} {selectedMethod === "paypal" ? "PayPal" :
                                            selectedMethod === "payoneer" ? "Payoneer" : "Bank Transfer"} Details
                                    </h3>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    {selectedMethod === "paypal" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                PayPal Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your-paypal@email.com"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the email address associated with your PayPal account
                                            </p>
                                        </div>
                                    )}

                                    {selectedMethod === "payoneer" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Payoneer Email Address *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                value={formData.email || ""}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="your-payoneer@email.com"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Enter the email address associated with your Payoneer account
                                            </p>
                                        </div>
                                    )}

                                    {selectedMethod === "bankTransfer" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Account Holder Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.accountHolderName || ""}
                                                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                                                    placeholder="John Doe"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bank Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.bankName || ""}
                                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                                    placeholder="Chase Bank"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Account Number *
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.accountNumber || ""}
                                                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                                                    placeholder="123456789"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Routing Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        value={formData.routingNumber || ""}
                                                        onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                                                        placeholder="021000021"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        SWIFT Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        value={formData.swiftCode || ""}
                                                        onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
                                                        placeholder="CHASUS33"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    IBAN
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.iban || ""}
                                                    onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                                                    placeholder="GB33BUKB20201555555555"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Bank Address
                                                </label>
                                                <input
                                                    type="text"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.bankAddress || ""}
                                                    onChange={(e) => setFormData({ ...formData, bankAddress: e.target.value })}
                                                    placeholder="123 Bank Street, New York, NY 10001"
                                                />
                                            </div>

                                            {/* <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Currency
                                                </label>
                                                <select
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    value={formData.currency || "USD"}
                                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                                >
                                                    <option value="USD">USD - US Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="GBP">GBP - British Pound</option>
                                                    <option value="CAD">CAD - Canadian Dollar</option>
                                                    <option value="AUD">AUD - Australian Dollar</option>
                                                </select>
                                            </div> */}
                                        </>
                                    )}

                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="submit"
                                            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            {editingMethod ? "Update" : "Save"} Details
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default PayoutMethods;