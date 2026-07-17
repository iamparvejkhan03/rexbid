import { useState, useEffect } from "react";
import { CompanyContainer, CompanyHeader, CompanySidebar, LoadingSpinner } from "../../components";
import {
    CheckCircle,
    Clock,
    XCircle,
    Banknote,
    FileText,
    Eye,
    Download,
    Calendar,
    CreditCard,
    Mail,
    Phone,
    MapPin,
    ChevronRight,
    ChevronLeft,
    Loader
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";

function Payouts() {
    const [payouts, setPayouts] = useState([]);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/api/v1/payouts/seller");
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

    const fetchPayoutDetails = async (payoutId) => {
        try {
            setLoadingDetails(true);
            const response = await axiosInstance.get(`/api/v1/payouts/seller/${payoutId}`);
            if (response.data.success) {
                setSelectedPayout(response.data.data);
                setShowDetailsModal(true);
            }
        } catch (error) {
            console.error("Error fetching payout details:", error);
            toast.error("Failed to load payout details");
        } finally {
            setLoadingDetails(false);
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
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
            <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
                <CompanySidebar />
                <div className="w-full relative">
                    <CompanyHeader />
                    <CompanyContainer>
                        <div className="flex justify-center items-center min-h-96">
                            <LoadingSpinner />
                        </div>
                    </CompanyContainer>
                </div>
            </section>
        );
    }

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <CompanySidebar />
            <div className="w-full relative">
                <CompanyHeader />
                <CompanyContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-2">My Payouts</h2>
                        <p className="text-secondary text-lg">Track your earnings and payment status</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600 mt-1">
                                        {stats.formattedTotalPaid || "$0"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countCompleted || 0} completed payouts
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
                                    <p className="text-sm text-gray-600">Pending Payouts</p>
                                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                                        {stats.formattedTotalPending || "$0"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stats.countPending || 0} pending payouts
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
                                    <p className="text-sm text-gray-600">Total Commission</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {formatCurrency(stats.totalCommission || 0)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Platform fees deducted
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Banknote size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payouts List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold">Payout History</h3>
                        </div>

                        {payouts.length === 0 ? (
                            <div className="p-12 text-center">
                                <Banknote size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">No payouts yet</h3>
                                <p className="text-gray-500">Your payouts will appear here once admin processes them</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {payouts.map(payout => (
                                    <div key={payout._id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="font-semibold text-gray-900 text-lg">
                                                        {payout.auction?.title || "Unknown Auction"}
                                                    </h4>
                                                    {getStatusBadge(payout.status)}
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(payout.createdAt)}
                                                    </span>
                                                    {payout.transactionId && (
                                                        <span className="flex items-center gap-1">
                                                            <FileText size={14} />
                                                            ID: {payout.transactionId.slice(-8)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-green-600">
                                                        {formatCurrency(payout.sellerAmount)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        Commission: {formatCurrency(payout.commissionAmount)}
                                                    </p>
                                                </div>

                                                <button
                                                    onClick={() => fetchPayoutDetails(payout._id)}
                                                    disabled={loadingDetails}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    {loadingDetails ? (
                                                        <Loader size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {payout.failureReason && (
                                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs text-red-600">
                                                    <span className="font-semibold">Failure Reason:</span> {payout.failureReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Payout Details Modal */}
                    {showDetailsModal && selectedPayout && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Payout Details</h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedPayout.auction?.title}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <XCircle size={20} className="text-gray-500" />
                                    </button>
                                </div>

                                <div className="p-6 space-y-6">
                                    {/* Status Banner */}
                                    <div className={`p-4 rounded-lg ${selectedPayout.status === 'completed' ? 'bg-green-50 border border-green-200' :
                                        selectedPayout.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                                            selectedPayout.status === 'failed' ? 'bg-red-50 border border-red-200' :
                                                'bg-blue-50 border border-blue-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            {selectedPayout.status === 'completed' && <CheckCircle className="text-green-600" size={24} />}
                                            {selectedPayout.status === 'pending' && <Clock className="text-yellow-600" size={24} />}
                                            {selectedPayout.status === 'failed' && <XCircle className="text-red-600" size={24} />}
                                            {selectedPayout.status === 'processing' && <Clock className="text-blue-600" size={24} />}
                                            <div>
                                                <p className="font-semibold capitalize">{selectedPayout.status} Payment</p>
                                                <p className="text-sm">
                                                    {selectedPayout.status === 'completed' && `Paid on ${formatDate(selectedPayout.completedAt)}`}
                                                    {selectedPayout.status === 'pending' && 'Awaiting processing by admin'}
                                                    {selectedPayout.status === 'failed' && selectedPayout.failureReason}
                                                    {selectedPayout.status === 'processing' && 'Your payment is being processed'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Auction Details */}
                                    <div className="bg-gray-50 rounded-lg p-5">
                                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-primary" />
                                            Auction Information
                                        </h4>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Auction Title</p>
                                                <p className="font-medium">{selectedPayout.auction?.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">End Date</p>
                                                <p className="font-medium">{formatDate(selectedPayout.auction?.endDate)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Final Price</p>
                                                <p className="font-medium text-green-600">
                                                    {formatCurrency(selectedPayout.auction?.finalPrice || selectedPayout.auction?.currentPrice)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4">
                                            <Link
                                                to={`/auction/${selectedPayout.auction?._id}`}
                                                target="_blank"
                                                className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
                                            >
                                                View Auction <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Financial Breakdown */}
                                    <div className="bg-gray-50 rounded-lg p-5">
                                        <h4 className="font-semibold text-gray-900 mb-4">Financial Breakdown</h4>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-gray-600">Total Sale Amount:</span>
                                                <span className="font-medium">{formatCurrency(selectedPayout.totalAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                                <span className="text-gray-600">Platform Commission:</span>
                                                <span className="font-medium text-blue-600">{formatCurrency(selectedPayout.commissionAmount)}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 text-lg">
                                                <span className="font-semibold">Your Net Amount:</span>
                                                <span className="font-bold text-green-600">{formatCurrency(selectedPayout.sellerAmount)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    {(selectedPayout.transactionId || selectedPayout.completedAt) && (
                                        <div className="bg-gray-50 rounded-lg p-5">
                                            <h4 className="font-semibold text-gray-900 mb-4">Payment Details</h4>

                                            <div className="space-y-3">
                                                {selectedPayout.transactionId && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Transaction ID:</span>
                                                        <span className="font-mono text-sm bg-white px-3 py-1 rounded border border-gray-200">
                                                            {selectedPayout.transactionId}
                                                        </span>
                                                    </div>
                                                )}
                                                {selectedPayout.completedAt && (
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-gray-600">Payment Date:</span>
                                                        <span className="font-medium">{formatDateTime(selectedPayout.completedAt)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Invoice Section */}
                                    {selectedPayout?.invoice && (
                                        <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                                            <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                                <FileText size={18} />
                                                Invoice
                                            </h4>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-800">Invoice for this auction is available</p>
                                                    <p className="text-xs text-blue-600">
                                                        Uploaded: {formatDate(selectedPayout.invoice.uploadedAt)}
                                                    </p>
                                                </div>
                                                <a
                                                    href={selectedPayout.invoice.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-300"
                                                >
                                                    <Download size={16} />
                                                    View Invoice
                                                </a>
                                            </div>
                                        </div>
                                    )}

                                    {/* Failure Reason (if failed) */}
                                    {selectedPayout.status === 'failed' && selectedPayout.failureReason && (
                                        <div className="bg-red-50 rounded-lg p-5 border border-red-200">
                                            <h4 className="font-semibold text-red-900 mb-2">Failure Reason</h4>
                                            <p className="text-red-800">{selectedPayout.failureReason}</p>
                                            <p className="text-sm text-red-600 mt-2">
                                                Please update your payout methods or contact support for assistance.
                                            </p>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => setShowDetailsModal(false)}
                                            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Close
                                        </button>

                                        {selectedPayout.status === 'pending' && (
                                            <Link
                                                to="/company/payout-methods"
                                                className="flex-1 text-center bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                            >
                                                Update Payout Methods
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CompanyContainer>
            </div>
        </section>
    );
}

export default Payouts;