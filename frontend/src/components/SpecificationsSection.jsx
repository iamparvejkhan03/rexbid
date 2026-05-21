import { 
    Car, 
    Settings,
    FileText,
    Calendar,
    Gauge,
    Fuel,
    Key,
    PoundSterling,
    Shield,
    Wrench,
    Users,
    Award,
    CheckCircle,
    XCircle,
    Clock,
    Tag,
    PaintBucket,
    AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";

// Default icon for unknown fields
const DefaultIcon = FileText;

// Specifications Section Component - WITH GROUPING
const SpecificationsSection = ({ auction }) => {
    const [groupedFields, setGroupedFields] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategoryFields = async () => {
            if (!auction?.categories || auction.categories.length === 0) return;
            
            // Get the subcategory (last in the array)
            const categorySlug = auction.categories[auction.categories.length - 1];
            
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(`/api/v1/categories/public/by-slug/${categorySlug}/fields`);
                
                if (data.success && data.data.fields) {
                    // Create a map of field configurations by name
                    const fieldConfigMap = {};
                    data.data.fields.forEach(field => {
                        fieldConfigMap[field.name] = {
                            group: field.group || 'General',
                            label: field.label || field.name,
                            unit: field.unit || '',
                            fieldType: field.fieldType
                        };
                    });
                    
                    // Group the auction's specifications by their configured group
                    const grouped = {};
                    
                    if (auction.specifications) {
                        const specs = auction.specifications.get ? 
                            Array.from(auction.specifications.entries()) : 
                            Object.entries(auction.specifications);
                        
                        specs.forEach(([key, value]) => {
                            if (value === undefined || value === null || value === '') return;
                            
                            const config = fieldConfigMap[key] || {
                                group: 'General',
                                label: key.split('_').map(word => 
                                    word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' '),
                                unit: ''
                            };
                            
                            if (!grouped[config.group]) {
                                grouped[config.group] = [];
                            }
                            
                            grouped[config.group].push({
                                key,
                                value,
                                label: config.label,
                                unit: config.unit,
                                fieldType: config.fieldType
                            });
                        });
                    }
                    
                    setGroupedFields(grouped);
                }
            } catch (error) {
                console.error('Error fetching category fields:', error);
                // Fallback: group all in General
                const fallbackGrouped = { 'General': [] };
                
                if (auction.specifications) {
                    const specs = auction.specifications.get ? 
                        Array.from(auction.specifications.entries()) : 
                        Object.entries(auction.specifications);
                    
                    specs.forEach(([key, value]) => {
                        if (value === undefined || value === null || value === '') return;
                        
                        fallbackGrouped['General'].push({
                            key,
                            value,
                            label: key.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' '),
                            unit: '',
                            fieldType: 'text'
                        });
                    });
                }
                
                setGroupedFields(fallbackGrouped);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryFields();
    }, [auction]);

    if (!auction?.specifications) return null;
    
    if (Object.keys(groupedFields).length === 0 && !loading) {
        return null;
    }

    // Format value based on type
    const formatValue = (value, fieldType, unit) => {
        if (value === null || value === undefined) return '';
        
        if (fieldType === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        if (typeof value === 'number') {
            return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
        }
        
        // Handle dates
        if (fieldType === 'date' || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
            try {
                const date = new Date(value);
                return date.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch (e) {
                return value;
            }
        }
        
        // Handle select fields - value might be stored as the option value
        if (typeof value === 'string') {
            return unit ? `${value} ${unit}` : value;
        }
        
        return value;
    };

    if (loading) {
        return (
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Specifications</h3>
                <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-gray-600">Loading specifications...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-8">
            {/* <h3 className="text-xl font-semibold mb-4">Specifications</h3> */}
            
            {Object.entries(groupedFields).map(([groupName, fields]) => (
                <div key={groupName} className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-secondary mb-4 flex items-center">
                        <Settings size={20} className="mr-2" />
                        {groupName}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {fields.map(({ key, value, label, unit, fieldType }) => {
                            const formattedValue = formatValue(value, fieldType, unit);
                            
                            return (
                                <div key={key} className="flex items-start gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-sm">
                                    {/* <DefaultIcon className="flex-shrink-0 w-5 h-5 mt-1 text-primary" strokeWidth={1.5} /> */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-secondary text-sm font-medium">{label}</p>
                                        <div className="text-base font-medium text-gray-900 break-words capitalize">
                                            {formattedValue}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SpecificationsSection;