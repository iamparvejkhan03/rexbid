import { useState } from 'react';
import { ChevronDown, Circle, CheckCircle, AlertCircle, Clock, XCircle, RefreshCw, PoundSterling } from 'lucide-react';
import { PaymentStatusModal } from '../index';

const PaymentStatusDropdown = ({ auction, onStatusUpdate, disabled }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const getStatusConfig = (status) => {
        const config = {
            pending: {
                color: 'text-red-600 bg-red-50 border-red-200',
                icon: <Clock className="h-4 w-4" />,
                label: 'Pending'
            },
            processing: {
                color: 'text-orange-600 bg-orange-50 border-orange-200',
                icon: <RefreshCw className="h-4 w-4" />,
                label: 'Processing'
            },
            completed: {
                color: 'text-green-600 bg-green-50 border-green-200',
                icon: <CheckCircle className="h-4 w-4" />,
                label: 'Completed'
            },
            failed: {
                color: 'text-red-600 bg-red-50 border-red-200',
                icon: <XCircle className="h-4 w-4" />,
                label: 'Failed'
            },
            refunded: {
                color: 'text-blue-600 bg-blue-50 border-blue-200',
                icon: <PoundSterling className="h-4 w-4" />,
                label: 'Refunded'
            },
            cancelled: {
                color: 'text-gray-600 bg-gray-50 border-gray-200',
                icon: <XCircle className="h-4 w-4" />,
                label: 'Cancelled'
            }
        };
        return config[status] || config.pending;
    };

    const handleStatusSelect = (status) => {
        setIsOpen(false);
        setShowModal(true);
    };

    const handleModalSubmit = async (formData) => {
        setLoading(true);
        try {
            await onStatusUpdate(auction._id, formData);
            setShowModal(false);
        } finally {
            setLoading(false);
        }
    };

    const currentStatus = getStatusConfig(auction.paymentStatus);

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${currentStatus.color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
                >
                    {currentStatus.icon}
                    <span className="font-medium text-sm capitalize">{currentStatus.label}</span>
                    {!disabled && <ChevronDown className="h-4 w-4" />}
                </button>

                {isOpen && !disabled && (
                    <>
                        <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute z-20 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                            {['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'].map((status) => {
                                const config = getStatusConfig(status);
                                return (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusSelect(status)}
                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <span className={`p-1 rounded ${config.color.replace('text-', 'text-').replace('bg-', 'bg-').split(' ')[0]}`}>
                                            {config.icon}
                                        </span>
                                        <span className="capitalize">{config.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            <PaymentStatusModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                auction={auction}
                onSubmit={handleModalSubmit}
                loading={loading}
            />
        </>
    );
};

export default PaymentStatusDropdown;