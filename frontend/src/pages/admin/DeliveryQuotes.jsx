import { useState, useEffect } from "react";
import {
    AdminContainer,
    AdminHeader,
    AdminSidebar,
    LoadingSpinner,
} from "../../components";
import {
    User,
    Trash2,
    Truck,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    Package,
    Scale,
    MapPin,
    Home,
    ArrowRight,
} from "lucide-react";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

// Anything longer than this many chars gets a Show more toggle
const PREVIEW_LENGTH = 120;

function DeliveryQuotes() {
    const [quotes, setQuotes] = useState([]);
    const [loading, setLoading] = useState(true);
    // Track which rows are expanded: { [quoteId]: true }
    const [expanded, setExpanded] = useState({});

    // -------- Fetch --------
    const fetchQuotes = async () => {
        try {
            setLoading(true);
            const { data } = await axiosInstance.get(
                "/api/v1/delivery-quote?limit=200"
            );
            if (data.success) {
                setQuotes(data.data.quotes);
            }
        } catch (error) {
            console.error("Fetch delivery quotes error:", error);
            toast.error("Failed to load delivery quote requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotes();
    }, []);

    // -------- Actions --------
    const deleteQuote = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this request? This cannot be undone."
            )
        )
            return;

        try {
            const { data } = await axiosInstance.delete(
                `/api/v1/delivery-quote/${id}`
            );
            if (data.success) {
                setQuotes((prev) => prev.filter((q) => q._id !== id));
                toast.success("Request deleted");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete request");
        }
    };

    const toggleExpanded = (id) => {
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) {
        return (
            <section className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <div className="w-full relative">
                    <AdminHeader />
                    <AdminContainer>
                        <div className="max-w-full pt-16 pb-7 md:pt-0">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">
                                Delivery Quote Requests
                            </h2>
                            <p className="text-gray-600">Loading...</p>
                        </div>
                        <div className="flex justify-center items-center h-64">
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
                    {/* Header */}
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">
                                Delivery Quote Requests
                            </h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium w-fit">
                                {quotes.length} requests
                            </span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-semibold">
                                Requests ({quotes.length})
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Shipment
                                        </th>
                                        <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {quotes.map((q) => {
                                        // New structured records have at least
                                        // one of these populated. Old records
                                        // only have `message`.
                                        const hasStructured =
                                            !!(q.whatDelivered ||
                                                q.collectionAddress ||
                                                q.deliveryAddress);

                                        const isLong =
                                            (q.message?.length || 0) >
                                            PREVIEW_LENGTH;
                                        const isExpanded = !!expanded[q._id];

                                        const displayMessage =
                                            !isLong || isExpanded
                                                ? q.message
                                                : `${q.message.slice(
                                                    0,
                                                    PREVIEW_LENGTH
                                                )}…`;

                                        return (
                                            <tr
                                                key={q._id}
                                                className="hover:bg-gray-50 align-top"
                                            >
                                                {/* Name */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                            <User
                                                                size={16}
                                                                className="text-blue-600"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col items-start gap-1">
                                                            <span className="font-medium text-gray-900 whitespace-nowrap">
                                                                {q.name}
                                                            </span>
                                                            <a
                                                                href={`mailto:${q.email}`}
                                                                className="text-sm text-blue-600 hover:underline break-all flex items-center gap-2"
                                                            >
                                                                <Mail
                                                                    size={14}
                                                                    className="flex-shrink-0"
                                                                />
                                                                {q.email}
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Phone */}
                                                <td className="py-4 px-6">
                                                    {q.phone ? (
                                                        <a
                                                            href={`tel:${q.phone.replace(
                                                                /\D/g,
                                                                ""
                                                            )}`}
                                                            className="text-sm text-gray-700 hover:text-blue-600 flex items-center gap-2 whitespace-nowrap"
                                                        >
                                                            <Phone
                                                                size={14}
                                                                className="flex-shrink-0"
                                                            />
                                                            {q.phone}
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Shipment */}
                                                <td className="py-4 px-6 min-w-[320px] max-w-[520px]">
                                                    {hasStructured ? (
                                                        <div className="space-y-2">
                                                            {/* What is being delivered */}
                                                            <div className="flex items-start gap-2">
                                                                <Package
                                                                    size={14}
                                                                    className="text-gray-400 flex-shrink-0 mt-0.5"
                                                                />
                                                                <span className="text-sm font-semibold text-gray-900 break-words">
                                                                    {q.whatDelivered ||
                                                                        "—"}
                                                                </span>
                                                            </div>

                                                            {/* Weight / dimensions */}
                                                            {q.weightDimensions && (
                                                                <div className="flex items-start gap-2">
                                                                    <Scale
                                                                        size={14}
                                                                        className="text-gray-400 flex-shrink-0 mt-0.5"
                                                                    />
                                                                    <span className="text-xs text-gray-600">
                                                                        {
                                                                            q.weightDimensions
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* From → To */}
                                                            <div className="flex items-center gap-5 mt-2 rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-1.5">
                                                                <div className="flex items-start gap-2">
                                                                    <MapPin
                                                                        size={13}
                                                                        className="text-blue-600 flex-shrink-0 mt-0.5"
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">
                                                                            From
                                                                        </p>
                                                                        <p className="text-xs text-gray-800 break-words">
                                                                            {q.collectionAddress ||
                                                                                "—"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div className="pl-[5px]">
                                                                    <ArrowRight
                                                                        size={12}
                                                                        className="text-gray-300"
                                                                    />
                                                                </div>

                                                                <div className="flex items-start gap-2">
                                                                    <Home
                                                                        size={13}
                                                                        className="text-[#D19F3E] flex-shrink-0 mt-0.5"
                                                                    />
                                                                    <div className="min-w-0">
                                                                        <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">
                                                                            To
                                                                        </p>
                                                                        <p className="text-xs text-gray-800 break-words">
                                                                            {q.deliveryAddress ||
                                                                                "—"}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Legacy note — some old
                                                                records may also
                                                                have a free-text
                                                                message. Show it if
                                                                present. */}
                                                            {q.message && (
                                                                <p className="text-xs text-gray-500 whitespace-pre-wrap break-words pt-1">
                                                                    {q.message}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        /* Legacy record — only
                                                           has `message` */
                                                        <>
                                                            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                                                {displayMessage}
                                                            </p>

                                                            {isLong && (
                                                                <button
                                                                    onClick={() =>
                                                                        toggleExpanded(
                                                                            q._id
                                                                        )
                                                                    }
                                                                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800"
                                                                >
                                                                    {isExpanded ? (
                                                                        <>
                                                                            Show
                                                                            less{" "}
                                                                            <ChevronUp
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            Show
                                                                            more{" "}
                                                                            <ChevronDown
                                                                                size={
                                                                                    12
                                                                                }
                                                                            />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() =>
                                                            deleteQuote(q._id)
                                                        }
                                                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {quotes.length === 0 && (
                                <div className="text-center py-12">
                                    <Truck
                                        size={48}
                                        className="mx-auto text-gray-300 mb-3"
                                    />
                                    <p className="text-gray-500">
                                        No delivery quote requests yet
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </AdminContainer>
            </div>
        </section>
    );
}

export default DeliveryQuotes;