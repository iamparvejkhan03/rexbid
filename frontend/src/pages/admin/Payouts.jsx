import { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Download,
    Banknote,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Eye,
    FileText,
    Upload,
    Send
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance.js";
import { toast } from "react-hot-toast";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { Link } from "react-router-dom";

function Payouts() {
    const [payouts, setPayouts] = useState([]);
    const [pendingAuctions, setPendingAuctions] = useState([]);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [showInitiateModal, setShowInitiateModal] = useState(false);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [receiptFile, setReceiptFile] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        status: "all",
        search: "",
        sortBy: "recent"
    });

    useEffect(() => {
        fetchPayouts();
        fetchPendingAuctions();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/v1/payouts");
            if (response.data.success) {
                setPayouts(response.data.data.payouts);
                setStats(response.data.data.statistics);
            }
        } catch (error) {
            console.error("Error fetching payouts:", error);
            toast.error("Failed to load payouts");
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingAuctions = async () => {
        try {
            const response = await axiosInstance.get("/api/v1/payouts/pending");
            if (response.data.success) {
                setPendingAuctions(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching pending auctions:", error);
        }
    };

    const handleInitiatePayout = async (auction) => {
        setSelectedAuction(auction);
        setShowInitiateModal(true);
    };

    const submitInitiatePayout = async () => {
        if (!selectedAuction?.defaultPayoutMethod) {
            toast.error("Seller hasn't set a default payout method");
            return;
        }

        setProcessing(true);
        try {
            const response = await axiosInstance.post(
                `/api/v1/payouts/initiate/${selectedAuction.id}`,
                {
                    payoutMethod: selectedAuction.defaultPayoutMethod,
                    adminNotes: "Payout initiated by admin"
                }
            );

            if (response.data.success) {
                toast.success("Payout initiated successfully");
                setShowInitiateModal(false);
                fetchPayouts();
                fetchPendingAuctions();
            }
        } catch (error) {
            console.error("Error initiating payout:", error);
            toast.error(error.response?.data?.message || "Failed to initiate payout");
        } finally {
            setProcessing(false);
        }
    };

    const handleCompletePayout = async (payout) => {
        if (!receiptFile && !payout.transactionId) {
            toast.error("Please upload a receipt or provide transaction ID");
            return;
        }

        setProcessing(true);
        const formData = new FormData();
        formData.append("transactionId", payout.transactionId || "");
        formData.append("adminNotes", "Payment completed");
        if (receiptFile) {
            formData.append("receipt", receiptFile);
        }

        try {
            const response = await axiosInstance.put(
                `/api/v1/payouts/${payout.id}/complete`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            if (response.data.success) {
                toast.success("Payout marked as completed");
                setSelectedPayout(null);
                setReceiptFile(null);
                fetchPayouts();
            }
        } catch (error) {
            console.error("Error completing payout:", error);
            toast.error(error.response?.data?.message || "Failed to complete payout");
        } finally {
            setProcessing(false);
        }
    };

    const handleFailPayout = async (payout) => {
        const reason = prompt("Enter failure reason:");
        if (!reason) return;

        setProcessing(true);
        try {
            const response = await axiosInstance.put(
                `/api/v1/payouts/${payout.id}/fail`,
                { failureReason: reason }
            );

            if (response.data.success) {
                toast.success("Payout marked as failed");
                setSelectedPayout(null);
                fetchPayouts();
            }
        } catch (error) {
            console.error("Error failing payout:", error);
            toast.error(error.response?.data?.message || "Failed to mark payout as failed");
        } finally {
            setProcessing(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { class: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" },
            processing: { class: "bg-blue-100 text-blue-800", icon: Clock, text: "Processing" },
            completed: { class: "bg-green-100 text-green-800", icon: CheckCircle, text: "Completed" },
            failed: { class: "bg-red-100 text-red-800", icon: XCircle, text: "Failed" },
            cancelled: { class: "bg-gray-100 text-gray-800", icon: XCircle, text: "Cancelled" }
        };
        const { class: className, icon: Icon, text } = config[status] || config.pending;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${className}`}>
                <Icon size={12} />
                {text}
            </span>
        );
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="flex justify-center items-center h-96">
                            <LoadingSpinner />
                        </div>
                    </AdminContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5 text-gray-800">Seller Payouts</h2>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Payouts</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        {formatCurrency(stats.totalPending || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countPending || 0} auctions
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock size={24} className="text-yellow-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Completed Payouts</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {formatCurrency(stats.totalCompleted || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countCompleted || 0} auctions
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Commission</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {formatCurrency(stats.totalCommission || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Platform earned</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Banknote size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Pending Actions</p>
                                    <p className="text-2xl font-bold text-orange-600 mt-1">
                                        {pendingAuctions.length}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Awaiting payout</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-lg">
                                    <AlertCircle size={24} className="text-orange-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pending Auctions Section */}
                    {pendingAuctions.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <AlertCircle size={20} className="text-orange-600" />
                                Pending Payouts ({pendingAuctions.length})
                            </h3>
                            <div className="space-y-4">
                                {pendingAuctions.map(auction => (
                                    <div key={auction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{auction.auction.title}</h4>
                                                <p className="text-sm text-gray-600">Seller: {auction.seller.name} • {auction.seller.email}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm">
                                                        <span className="text-gray-500">Total:</span>{" "}
                                                        <span className="font-semibold">{auction.financials.formattedTotal}</span>
                                                    </span>
                                                    <span className="text-sm">
                                                        <span className="text-gray-500">Commission:</span>{" "}
                                                        <span className="font-semibold text-blue-600">{auction.financials.formattedCommission}</span>
                                                    </span>
                                                    <span className="text-sm">
                                                        <span className="text-gray-500">Seller gets:</span>{" "}
                                                        <span className="font-semibold text-green-600">{auction.financials.formattedSeller}</span>
                                                    </span>
                                                </div>
                                                {!auction.seller.hasPayoutMethod && (
                                                    <p className="text-xs text-red-600 mt-1">
                                                        ⚠️ Seller hasn't added payout method
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {auction.defaultPayoutMethod && (
                                                    <span className="px-2 py-1 bg-gray-100 rounded-lg text-xs capitalize">
                                                        {auction.defaultPayoutMethod}
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleInitiatePayout(auction)}
                                                    disabled={!auction.seller.hasPayoutMethod}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${auction.seller.hasPayoutMethod
                                                            ? "bg-primary text-white hover:bg-primary/90"
                                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                >
                                                    <Send size={16} />
                                                    Initiate Payout
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Payouts List */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                                <div className="p-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">All Payouts ({payouts.length})</h3>
                                </div>
                                <div className="max-h-[600px] overflow-y-auto">
                                    {payouts.map(payout => (
                                        <div
                                            key={payout.id}
                                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedPayout?.id === payout.id ? "bg-blue-50 border-blue-200" : ""
                                                }`}
                                            onClick={() => setSelectedPayout(payout)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 text-sm">
                                                        {payout.auction.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {payout.seller.name}
                                                    </p>
                                                </div>
                                                {getStatusBadge(payout.status)}
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="font-semibold text-green-600">
                                                    {formatCurrency(payout.sellerAmount)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatDate(payout.createdAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Selected Payout Details */}
                        <div className="lg:col-span-2">
                            {selectedPayout ? (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-bold">Payout Details</h3>
                                        {getStatusBadge(selectedPayout.status)}
                                    </div>

                                    {/* Seller Info */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-semibold mb-3">Seller Information</h4>
                                        <p className="font-medium">{selectedPayout.seller.name}</p>
                                        <p className="text-sm text-gray-600">{selectedPayout.seller.email}</p>
                                        {selectedPayout.seller.phone && (
                                            <p className="text-sm text-gray-600">{selectedPayout.seller.phone}</p>
                                        )}
                                    </div>

                                    {/* Payout Method */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-semibold mb-3">Payout Method</h4>
                                        <p className="capitalize font-medium">{selectedPayout.payoutMethod.method}</p>
                                        {selectedPayout.payoutMethod.method === "paypal" && (
                                            <p className="text-sm text-gray-600">Email: {selectedPayout.payoutMethod.details?.email}</p>
                                        )}
                                        {selectedPayout.payoutMethod.method === "payoneer" && (
                                            <p className="text-sm text-gray-600">Email: {selectedPayout.payoutMethod.details?.email}</p>
                                        )}
                                        {selectedPayout.payoutMethod.method === "bankTransfer" && (
                                            <div className="text-sm text-gray-600">
                                                <p>Account: {selectedPayout.payoutMethod.details?.accountHolderName}</p>
                                                <p>Bank: {selectedPayout.payoutMethod.details?.bankName}</p>
                                                <p>Account: {selectedPayout.payoutMethod.details?.accountNumber}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Summary */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-semibold mb-3">Financial Summary</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Total Amount:</span>
                                                <span className="font-medium">{formatCurrency(selectedPayout.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Commission:</span>
                                                <span className="font-medium text-blue-600">{formatCurrency(selectedPayout.commissionAmount)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                                <span className="font-semibold">Seller Receives:</span>
                                                <span className="font-bold text-green-600">{formatCurrency(selectedPayout.sellerAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Transaction Details */}
                                    {selectedPayout.transactionId && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="font-semibold mb-3">Transaction Details</h4>
                                            <p className="text-sm">Transaction ID: <span className="font-mono">{selectedPayout.transactionId}</span></p>
                                        </div>
                                    )}

                                    {/* Receipt */}
                                    {selectedPayout.receipt && (
                                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                            <h4 className="font-semibold mb-3">Receipt</h4>
                                            <a
                                                href={selectedPayout.receipt.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center gap-2"
                                            >
                                                <FileText size={16} />
                                                View Receipt
                                            </a>
                                        </div>
                                    )}

                                    {/* Admin Actions */}
                                    {selectedPayout.status === "pending" && (
                                        <div className="border-t border-gray-200 pt-6">
                                            <h4 className="font-semibold mb-4">Process Payout</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Transaction ID (Optional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                        placeholder="e.g., PayPal transaction ID"
                                                        value={selectedPayout.transactionId || ""}
                                                        onChange={(e) => setSelectedPayout({
                                                            ...selectedPayout,
                                                            transactionId: e.target.value
                                                        })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Upload Receipt (Optional)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => setReceiptFile(e.target.files[0])}
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleCompletePayout(selectedPayout)}
                                                        disabled={processing}
                                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                                                    >
                                                        {processing ? "Processing..." : "Mark as Completed"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleFailPayout(selectedPayout)}
                                                        disabled={processing}
                                                        className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 disabled:bg-gray-100"
                                                    >
                                                        Mark as Failed
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                    <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Payout Selected</h3>
                                    <p className="text-gray-500">Select a payout from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Initiate Payout Modal */}
                    {showInitiateModal && selectedAuction && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold">Confirm Payout Initiation</h3>
                                </div>
                                <div className="p-6">
                                    <p className="mb-4">Are you sure you want to initiate payout for:</p>
                                    <p className="font-semibold">{selectedAuction.auction.title}</p>

                                    <div className="bg-gray-50 rounded-lg p-4 my-4">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Seller:</span>
                                            <span className="font-medium">{selectedAuction.seller.name}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Payout Method:</span>
                                            <span className="font-medium capitalize">{selectedAuction.defaultPayoutMethod}</span>
                                        </div>
                                        <div className="flex justify-between mb-2">
                                            <span className="text-gray-600">Amount to pay:</span>
                                            <span className="font-bold text-green-600">{selectedAuction.financials.formattedSeller}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={submitInitiatePayout}
                                            disabled={processing}
                                            className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-primary/90 disabled:bg-gray-400"
                                        >
                                            {processing ? "Processing..." : "Confirm & Initiate"}
                                        </button>
                                        <button
                                            onClick={() => setShowInitiateModal(false)}
                                            className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
}

export default Payouts;