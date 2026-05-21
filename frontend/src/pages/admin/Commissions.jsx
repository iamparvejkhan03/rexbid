import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';
import { Crown, Save, Banknote, Percent, Settings } from 'lucide-react';
import { AdminContainer, AdminHeader, AdminSidebar } from '../../components';

const Commissions = () => {
    const [commission, setCommission] = useState({
        commissionType: 'percentage',
        commissionValue: 5
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Fetch commission settings
    const fetchCommission = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get('/api/v1/commissions');
            if (data.success) {
                setCommission(data.data.commission);
            }
        } catch (err) {
            console.error('Fetch commission error:', err);
            toast.error(err.response?.data?.message || "Failed to fetch commission settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommission();
    }, []);

    // Handle commission type change
    const handleCommissionTypeChange = (type) => {
        setCommission(prev => ({
            ...prev,
            commissionType: type,
            // Reset value if switching to percentage and current value > 100
            commissionValue: type === 'percentage' && prev.commissionValue > 100 ? 100 : prev.commissionValue
        }));
    };

    // Handle commission value change
    const handleCommissionValueChange = (value) => {
        const numValue = parseFloat(value) || 0;
        
        // Validate percentage doesn't exceed 100
        if (commission.commissionType === 'percentage' && numValue > 100) {
            toast.error('Percentage cannot exceed 100%');
            return;
        }

        setCommission(prev => ({
            ...prev,
            commissionValue: numValue
        }));
    };

    // Save commission settings
    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await axiosInstance.put('/api/v1/commissions', {
                commissionType: commission.commissionType,
                commissionValue: commission.commissionValue
            });

            if (data.success) {
                toast.success('Commission settings updated successfully');
                setCommission(data.data.commission);
            }
        } catch (err) {
            console.error('Update commission error:', err);
            toast.error(err.response?.data?.message || "Failed to update commission settings");
        } finally {
            setSaving(false);
        }
    };

    // Get display value with symbol
    const getDisplayValue = () => {
        const value = commission.commissionValue || 0;
        return commission.commissionType === 'fixed' ? `${value} kr` : `${value}%`;
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />

            <div className="w-full relative">
                <AdminHeader />

                <AdminContainer>
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings size={32} className="text-green-600" />
                            <h2 className="text-3xl md:text-4xl font-bold">Commission Settings</h2>
                        </div>
                        <p className="text-gray-600">Configure global commission rate for all auctions</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                        </div>
                    ) : (
                        <div className="max-w-full mx-auto">
                            {/* Main Commission Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-900 to-slate-950 px-6 py-4">
                                    <h3 className="text-lg font-semibold text-white">Global Commission Rate</h3>
                                    <p className="text-gray-300 text-sm">This rate applies to all auction categories</p>
                                </div>

                                {/* Current Rate Display */}
                                <div className="p-6 border-b border-gray-200 bg-gray-50">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Current Commission</p>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-bold">{getDisplayValue()}</span>
                                                <span className="text-gray-500 text-sm">
                                                    {commission.commissionType === 'fixed' ? 'fixed amount' : 'of sale price'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`p-4 rounded-full ${
                                            commission.commissionType === 'fixed' 
                                                ? 'bg-green-100 text-green-600' 
                                                : 'bg-orange-100 text-orange-500'
                                        }`}>
                                            {commission.commissionType === 'fixed' 
                                                ? <Banknote size={28} />
                                                : <Percent size={28} />
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* Settings Form */}
                                <div className="p-6 space-y-6">
                                    {/* Commission Type Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Commission Type
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleCommissionTypeChange('fixed')}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                                    commission.commissionType === 'fixed'
                                                        ? 'border-green-600 bg-green-50 text-green-700'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Banknote size={20} />
                                                <span className="font-medium">Fixed Amount</span>
                                            </button>
                                            <button
                                                onClick={() => handleCommissionTypeChange('percentage')}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                                                    commission.commissionType === 'percentage'
                                                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                                                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Percent size={20} />
                                                <span className="font-medium">Percentage</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Commission Value Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {commission.commissionType === 'fixed' ? 'Amount (kr)' : 'Percentage (%)'}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max={commission.commissionType === 'percentage' ? 100 : undefined}
                                                step={commission.commissionType === 'percentage' ? "0.1" : "10"}
                                                value={commission.commissionValue}
                                                onChange={(e) => handleCommissionValueChange(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                                                {commission.commissionType === 'fixed' ? 'kr' : '%'}
                                            </span>
                                        </div>
                                        {commission.commissionType === 'percentage' && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                Percentage of the final sale price (0-100%)
                                            </p>
                                        )}
                                    </div>

                                    {/* Last Updated Info */}
                                    {commission.updatedAt && (
                                        <div className="bg-gray-50 rounded-lg text-sm text-gray-600">
                                            <p>Last updated: {new Date(commission.updatedAt).toLocaleString()}</p>
                                            {commission.updatedBy && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Updated by: {commission.updatedBy}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white hover:from-orange-500 hover:via-orange-600 hover:to-orange-700 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 font-medium"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Saving Changes...
                                            </>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save Commission Settings
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Information Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                        <Crown size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-blue-800 mb-2">About Commission Settings</h3>
                                        <div className="space-y-2 text-sm text-blue-700">
                                            <p>• <span className="font-medium">Fixed commission (kr):</span> A fixed amount charged per transaction regardless of the sale price</p>
                                            <p>• <span className="font-medium">Percentage commission (%):</span> A percentage of the final sale price (cannot exceed 100%)</p>
                                            <p>• This is a <span className="font-medium">global setting</span> that applies to all auction categories</p>
                                            <p>• Changes take effect immediately for all new auctions</p>
                                            <p>• Existing auctions will use the commission rate that was set when they were created</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </AdminContainer>
            </div>
        </section>
    );
};

export default Commissions;