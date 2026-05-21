import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Car, Check, X, AlertCircle, Loader } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

function VehicleLookupModal({
    isOpen,
    onClose,
    onVehicleFound,
    isLoading = false
}) {
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            registrationNumber: '',
        },
    });

    const handleClose = () => {
        reset();
        setError(null);
        setSuccess(false);
        setIsFetching(false);
        onClose();
    };

    const onSubmit = async (data) => {
        setError(null);
        setSuccess(false);
        setIsFetching(true);

        try {
            // Transform the registration number (remove spaces, uppercase)
            const cleanRegistration = data.registrationNumber.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

            // Call the DVLA API through your backend
            const { data: result } = await axiosInstance.post('/api/v1/admin/dvla', {
                registrationNumber: cleanRegistration
            });

            if (result.success && result.data) {
                // Transform DVLA data to match ONLY the fields in your categoryFields
                const transformedData = {
                    title: `${result.data.yearOfManufacture || ''} ${result.data.make || ''}`.trim(),
                    specifications: {}
                };

                // Map only the fields that exist in your categoryFields
                const dvlaData = result.data;

                // Registration number
                transformedData.specifications.registration = cleanRegistration;

                // Year
                if (dvlaData.yearOfManufacture) {
                    transformedData.specifications.year = parseInt(dvlaData.yearOfManufacture);
                }

                // Colour
                if (dvlaData.colour) {
                    transformedData.specifications.colour = dvlaData.colour.toLowerCase();
                }

                // Fuel Type - map DVLA to your options
                if (dvlaData.fuelType) {
                    transformedData.specifications.fuelType = mapFuelType(dvlaData.fuelType);
                }

                // Engine Capacity (store as number)
                if (dvlaData.engineCapacity) {
                    transformedData.specifications.engineCapacity = dvlaData.engineCapacity;
                }

                // MOT Expiry Date (if available from DVLA)
                if (dvlaData.motExpiryDate) {
                    transformedData.specifications.motExpiry = dvlaData.motExpiryDate;
                }

                // Month of first registration can help with year validation
                if (dvlaData.monthOfFirstRegistration && !dvlaData.yearOfManufacture) {
                    const year = dvlaData.monthOfFirstRegistration.split('-')[0];
                    transformedData.specifications.year = parseInt(year);
                }

                // CO2 Emissions (if you want to store it)
                if (dvlaData.co2Emissions) {
                    transformedData.specifications.co2Emissions = dvlaData.co2Emissions;
                }

                // V5 Status - if dateOfLastV5CIssued exists, V5 is present
                if (dvlaData.dateOfLastV5CIssued) {
                    transformedData.specifications.v5Status = 'V5 Present';
                }

                // Euro Status
                if (dvlaData.euroStatus) {
                    transformedData.specifications.euroStatus = dvlaData.euroStatus;
                }

                // Make (for title or description)
                transformedData.make = dvlaData.make || '';

                // Tax and MOT status (can be useful info)
                if (dvlaData.taxStatus) {
                    transformedData.specifications.taxStatus = dvlaData.taxStatus;
                }

                if (dvlaData.motStatus) {
                    transformedData.specifications.motStatus = dvlaData.motStatus;
                }

                // Pass data back to parent
                onVehicleFound(transformedData);

                setSuccess(true);
                setTimeout(() => {
                    handleClose();
                }, 1000);
            } else {
                setError(result.message || 'Vehicle not found. Please check the registration number.');
            }
        } catch (err) {
            console.error('Vehicle lookup error:', err);

            if (err.response) {
                switch (err.response.status) {
                    case 400:
                        setError('Invalid registration number format');
                        break;
                    case 404:
                        setError('Vehicle not found. Please check the registration number.');
                        break;
                    case 429:
                        setError('Too many requests. Please try again in a moment.');
                        break;
                    default:
                        setError(err.response.data?.message || 'Unable to fetch vehicle details.');
                }
            } else if (err.request) {
                setError('Network error. Please check your connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsFetching(false);
        }
    };

    // Helper function to map DVLA fuel types to your format
    const mapFuelType = (dvlaFuelType) => {
        const fuelTypeMap = {
            'PETROL': 'Petrol',
            'DIESEL': 'Diesel',
            'ELECTRIC': 'Electric',
            'HYBRID ELECTRIC': 'Hybrid',
            'HYBRID': 'Hybrid',
            'PLUG-IN HYBRID ELECTRIC': 'Hybrid',
            'PLUG-IN HYBRID': 'Hybrid',
            'OTHER': 'Other',
            'GAS': 'Gasoline',
            'GASOLINE': 'Gasoline'
        };

        if (!dvlaFuelType) return '';

        const upperFuelType = dvlaFuelType.toUpperCase();

        // Check for exact matches first
        for (const [key, value] of Object.entries(fuelTypeMap)) {
            if (upperFuelType === key || upperFuelType.includes(key)) {
                return value;
            }
        }

        return ''; // Return empty if no match found
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Vehicle Lookup</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                        disabled={isFetching}
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <Car className="w-5 h-5" />
                            <p className="text-sm">Enter UK vehicle registration to auto-fill details</p>
                        </div>

                        {/* Registration Number Input */}
                        <div>
                            <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                                Registration Number *
                            </label>
                            <input
                                type="text"
                                id="registrationNumber"
                                placeholder="e.g., WF70TGN"
                                className={`w-full px-4 py-3 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                {...register('registrationNumber', {
                                    required: 'Registration number is required',
                                    pattern: {
                                        value: /^[A-Z0-9]{1,12}$/i,
                                        message: 'Enter a valid UK registration number'
                                    }
                                })}
                                disabled={isFetching}
                            />
                            {errors.registrationNumber && (
                                <p className="mt-2 text-sm text-red-600">{errors.registrationNumber.message}</p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                Enter without spaces or special characters
                            </p>
                        </div>

                        {/* Success Message */}
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center gap-2 text-green-800">
                                    <Check className="w-5 h-5" />
                                    <span className="font-medium">Vehicle details found! Auto-filling form...</span>
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <div className="flex items-center gap-2 text-red-800">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {/* Information Box */}
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">What will be auto-filled?</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Registration Number</li>
                                <li>• Year of Manufacture</li>
                                <li>• Vehicle Colour</li>
                                <li>• Fuel Type</li>
                                <li>• Engine Capacity</li>
                                <li>• MOT Expiry Date (if available)</li>
                                <li>• Euro Status</li>
                            </ul>
                            <p className="text-xs text-blue-700 mt-2 italic">
                                Note: Some fields like mileage, body type, and transmission still need manual entry.
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-3 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                            disabled={isFetching}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isFetching}
                            className="flex-1 py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 font-medium transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isFetching ? (
                                <>
                                    <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Looking up...
                                </>
                            ) : (
                                'Lookup Vehicle'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default VehicleLookupModal;