import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, BookMarked } from "lucide-react";
import { Container, LoadingSpinner, AuctionCard } from "../components";
import axiosInstance from "../utils/axiosInstance";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";

function SingleCatalogue() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const userCurrency = user?.currency || "EUR";

    const [catalogue, setCatalogue] = useState(null);
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await axiosInstance.get(
                    `/api/v1/catalogues/${id}/auctions?currency=${userCurrency}&limit=100`
                );
                if (data.success) {
                    setCatalogue(data.data.catalogue);
                    setAuctions(data.data.auctions || []);
                }
            } catch (err) {
                toast.error(
                    err?.response?.data?.message || "Failed to load catalogue"
                );
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, userCurrency]);

    if (loading) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <LoadingSpinner size="large" />
            </Container>
        );
    }

    if (!catalogue) {
        return (
            <Container className="py-32 min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-600">
                        Catalogue not found
                    </h2>
                    <button
                        onClick={() => navigate("/")}
                        className="text-[#C59D55] hover:underline mt-4 inline-block"
                    >
                        Back to Home
                    </button>
                </div>
            </Container>
        );
    }

    const closingDate = new Date(catalogue.closingDate);

    return (
        <Container className="pt-32 pb-16 min-h-[70vh]">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-[#A17B35] transition-colors mb-6"
            >
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            {/* Header banner */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                <div className="relative aspect-[21/9] md:aspect-[21/7] bg-gray-100">
                    <img
                        src={catalogue.image?.url}
                        alt={catalogue.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-medium backdrop-blur-md mb-3">
                            <Calendar size={12} />
                            Closing{" "}
                            {closingDate.toLocaleDateString("en-IE", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                            {catalogue.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Auctions */}
            {auctions.length > 0 ? (
                <>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Auctions Closing This Day
                        </h2>
                        <span className="text-sm text-gray-500">
                            {auctions.length} auction{auctions.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {auctions.map((auction) => (
                            <AuctionCard key={auction._id} auction={auction} />
                        ))}
                    </div>
                </>
            ) : (
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
                    <BookMarked size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                        No Auctions in This Catalogue
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        There are currently no auctions scheduled to end on this date.
                        Check back soon.
                    </p>
                </div>
            )}
        </Container>
    );
}

export default SingleCatalogue;