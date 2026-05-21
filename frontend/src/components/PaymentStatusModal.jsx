import { useState, useEffect } from 'react';
import { X, Upload, FileText, CreditCard, Building, Banknote, Globe, AlertCircle, CheckCircle } from 'lucide-react';

const PaymentStatusModal = ({ isOpen, onClose, auction, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        paymentStatus: auction?.paymentStatus || 'pending',
        paymentMethod: auction?.paymentMethod || '',
        transactionId: auction?.transactionId || '',
        notes: '',
        invoiceFile: null
    });

    const [invoicePreview, setInvoicePreview] = useState(null);

    // Reset form when auction changes
    useEffect(() => {
        if (auction) {
            setFormData({
                paymentStatus: auction.paymentStatus || 'pending',
                paymentMethod: auction.paymentMethod || '',
                transactionId: auction.transactionId || '',
                notes: '',
                invoiceFile: null
            });
            setInvoicePreview(null);
        }
    }, [auction]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, invoiceFile: file }));
            
            // Create preview for image files
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setInvoicePreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setInvoicePreview(null);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'text-red-600 bg-red-50 border-red-200';
            case 'processing': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'completed': return 'text-green-600 bg-green-50 border-green-200';
            case 'failed': return 'text-red-600 bg-red-50 border-red-200';
            case 'refunded': return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'cancelled': return 'text-gray-600 bg-gray-50 border-gray-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'failed': return <AlertCircle className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">Update Payment Status</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Auction: <span className="font-medium">{auction?.title}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Current Status Display */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Status
                        </label>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${getStatusColor(auction?.paymentStatus || 'pending')}`}>
                            {getStatusIcon(auction?.paymentStatus || 'pending')}
                            <span className="font-medium capitalize">{auction?.paymentStatus || 'pending'}</span>
                        </div>
                    </div>

                    {/* New Payment Status */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Payment Status *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, paymentStatus: status }))}
                                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${formData.paymentStatus === status 
                                        ? getStatusColor(status) + ' ring-2 ring-offset-1' 
                                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {getStatusIcon(status)}
                                    <span className="capitalize text-sm">{status}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Payment Method (Show only if not pending) */}
                    {formData.paymentStatus !== 'pending' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Payment Method
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {['credit_card', 'bank_transfer', 'paypal', 'other'].map((method) => (
                                    <button
                                        key={method}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                                        className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg border transition-colors ${formData.paymentMethod === method 
                                            ? 'bg-blue-50 border-blue-200 text-blue-600 ring-2 ring-offset-1 ring-blue-500' 
                                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {method === 'credit_card' && <CreditCard className="h-5 w-5" />}
                                        {method === 'bank_transfer' && <Building className="h-5 w-5" />}
                                        {method === 'paypal' && <Globe className="h-5 w-5" />}
                                        {method === 'other' && <Banknote className="h-5 w-5" />}
                                        <span className="text-xs capitalize">{method.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Transaction ID */}
                    {formData.paymentStatus !== 'pending' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Transaction ID (Optional)
                            </label>
                            <input
                                type="text"
                                value={formData.transactionId}
                                onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter transaction/reference number"
                            />
                        </div>
                    )}

                    {/* Invoice Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Invoice (Optional)
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                            <input
                                type="file"
                                id="invoice-upload"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label htmlFor="invoice-upload" className="cursor-pointer">
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Upload className="h-8 w-8 text-gray-400" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">
                                            {formData.invoiceFile 
                                                ? formData.invoiceFile.name 
                                                : 'Click to upload invoice'}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF, DOC, JPG, PNG up to 10MB
                                        </p>
                                    </div>
                                </div>
                            </label>
                        </div>
                        
                        {/* Invoice Preview */}
                        {invoicePreview && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                <img 
                                    src={invoicePreview} 
                                    alt="Invoice preview" 
                                    className="max-w-full h-48 object-contain rounded-lg border border-gray-200"
                                />
                            </div>
                        )}
                        
                        {/* Existing Invoice */}
                        {auction?.invoice?.url && !formData.invoiceFile && (
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-1">Current Invoice:</p>
                                <a 
                                    href={auction.invoice.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                                >
                                    <FileText className="h-4 w-4" />
                                    {auction.invoice.filename || 'View Invoice'}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex-1 px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                formData.paymentStatus === 'completed' 
                                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                                    : formData.paymentStatus === 'failed' || formData.paymentStatus === 'cancelled'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:opacity-50`}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <CheckCircle className="h-5 w-5" />
                                    Update to {formData.paymentStatus}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentStatusModal;