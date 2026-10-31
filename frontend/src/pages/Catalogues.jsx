import { useState, useEffect } from "react";
import {
    Search,
    SlidersHorizontal,
    X,
    BookMarked,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from "lucide-react";
import { Container } from "../components";
import CatalogueCard from "../components/CatalogueCard";
import { useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

// ============================================================
// FILTERS SIDEBAR
// ============================================================
const FiltersSection = ({
    uiFilters,
    handleFilterChange,
    resetFilters,
    setShowMobileFilters,
}) => {
    const statusOptions = [
        { value: "", label: "All Catalogues" },
        { value: "upcoming", label: "Upcoming" },
        { value: "past", label: "Past" },
    ];

    return (
        <div className="bg-white px-4 py-6 rounded-lg shadow-md h-fit">
            <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="text-xl font-semibold">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)}>
                    <X size={24} />
                </button>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search Catalogues
                    </label>
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search by title..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            value={uiFilters.search}
                            onChange={handleFilterChange}
                            name="search"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <select
                        name="status"
                        value={uiFilters.status}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {statusOptions.map((s) => (
                            <option key={s.value} value={s.value}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-8">
                <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    Reset All Filters
                </button>
            </div>
        </div>
    );
};

// ============================================================
// SKELETON
// ============================================================
const CatalogueSkeleton = () => (
    <div className="flex flex-col gap-3 rounded-[24px] border border-gray-100 bg-white p-3 shadow-sm">
        <div className="aspect-[4/3] animate-pulse rounded-[18px] bg-gray-100" />
        <div className="space-y-3 p-2 pt-5">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
    </div>
);

// ============================================================
// PAGINATION COMPONENT
// ============================================================
const getPageNumbers = (current, total) => {
    // Show: first, last, current, current±1, with ellipsis for gaps
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set([1, total, current, current - 1, current + 1]);
    const sorted = Array.from(pages)
        .filter((p) => p >= 1 && p <= total)
        .sort((a, b) => a - b);

    const withEllipsis = [];
    for (let i = 0; i < sorted.length; i++) {
        if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
            withEllipsis.push("ellipsis-" + sorted[i]);
        }
        withEllipsis.push(sorted[i]);
    }
    return withEllipsis;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <nav
            className="flex items-center justify-center gap-1.5 mt-12 flex-wrap"
            aria-label="Pagination"
        >
            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page numbers */}
            {pages.map((p) =>
                typeof p === "string" ? (
                    <span
                        key={p}
                        className="flex items-center justify-center h-10 w-10 text-gray-400"
                    >
                        <MoreHorizontal size={16} />
                    </span>
                ) : (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        aria-current={p === currentPage ? "page" : undefined}
                        className={`h-10 min-w-10 px-3 rounded-lg text-sm font-semibold transition-colors ${p === currentPage
                                ? "bg-[#F5B51B] text-black shadow-sm"
                                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        {p}
                    </button>
                )
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
            </button>
        </nav>
    );
};

// ============================================================
// MAIN PAGE
// ============================================================
function Catalogues() {
    const [catalogues, setCatalogues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCatalogues: 0,
    });
    const [uiFilters, setUiFilters] = useState({
        status: "",
        search: "",
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const location = useLocation();

    // Read URL params on load
    useEffect(() => {
        const sp = new URLSearchParams(location.search);
        const newFilters = {
            status: sp.get("status") || "",
            search: sp.get("search") || "",
        };
        const pageFromUrl = parseInt(sp.get("page")) || 1;
        setUiFilters(newFilters);
        fetchCatalogues(pageFromUrl, newFilters);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    const fetchCatalogues = async (page = 1, filters = uiFilters) => {
        try {
            setLoading(true);

            const params = new URLSearchParams({
                page: page.toString(),
                limit: "12",
                ...filters,
            });

            Object.keys(params).forEach((key) => {
                if (!params.get(key)) params.delete(key);
            });

            const { data } = await axiosInstance.get(
                `/api/v1/catalogues?${params}`
            );

            if (data.success) {
                setCatalogues(data.data.catalogues);
                setPagination(data.data.pagination);
            }
        } catch (error) {
            console.error("Fetch catalogues error:", error);
        } finally {
            setLoading(false);
        }
    };

    // Keep URL in sync with all filters + page
    const syncUrl = (filters, page) => {
        const sp = new URLSearchParams();
        if (filters.status) sp.set("status", filters.status);
        if (filters.search) sp.set("search", filters.search);
        if (page && page > 1) sp.set("page", page.toString());
        const qs = sp.toString();
        window.history.replaceState(
            null,
            "",
            `${window.location.pathname}${qs ? `?${qs}` : ""}`
        );
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        if (page === pagination.currentPage) return;
        syncUrl(uiFilters, page);
        fetchCatalogues(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...uiFilters, [name]: value };
        setUiFilters(newFilters);
        syncUrl(newFilters, 1);

        if (name === "search") {
            if (debounceTimer) clearTimeout(debounceTimer);
            const timer = setTimeout(
                () => fetchCatalogues(1, newFilters),
                500
            );
            setDebounceTimer(timer);
        } else {
            fetchCatalogues(1, newFilters);
        }
    };

    const resetFilters = () => {
        const reset = { status: "", search: "" };
        setUiFilters(reset);
        fetchCatalogues(1, reset);
        setShowMobileFilters(false);
        window.history.replaceState(null, "", window.location.pathname);
    };

    return (
        <Container>
            <div className="min-h-screen pt-28 md:pt-32 pb-16 bg-gray-50">
                {/* Header */}
                <div className="container mx-auto">
                    <h2 className="text-4xl font-black tracking-[-0.04em] text-gray-950 md:text-5xl">
                        All
                        <span className="ml-2 font-medium italic text-gray-400">
                            Catalogues.
                        </span>
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Browse auctions grouped by their closing day.
                    </p>
                </div>

                <div className="container mx-auto py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="hidden lg:block lg:w-1/4 xl:w-1/5">
                            <FiltersSection
                                uiFilters={uiFilters}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                            />
                        </div>

                        {/* Content */}
                        <div className="w-full lg:w-3/4 xl:w-4/5">
                            {/* Mobile search + filter */}
                            <div className="flex flex-col md:flex-row gap-4 mb-8 lg:hidden">
                                <div className="relative flex-grow">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                        size={20}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search catalogues..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={uiFilters.search}
                                        onChange={handleFilterChange}
                                        name="search"
                                    />
                                </div>
                                <button
                                    onClick={() => setShowMobileFilters(true)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 md:w-auto font-medium"
                                >
                                    <SlidersHorizontal size={20} />
                                    <span>Filters</span>
                                </button>
                            </div>

                            {/* Count */}
                            <div className="flex justify-between items-center mb-6">
                                <p className="text-gray-600">
                                    {loading
                                        ? "Loading catalogues..."
                                        : `Showing ${catalogues.length} of ${pagination?.totalCatalogues || 0
                                        } catalogues${pagination.totalPages > 1
                                            ? ` · Page ${pagination.currentPage} of ${pagination.totalPages}`
                                            : ""
                                        }`}
                                </p>
                            </div>

                            {/* Grid */}
                            {loading && catalogues.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {[...Array(6)].map((_, i) => (
                                        <CatalogueSkeleton key={i} />
                                    ))}
                                </div>
                            ) : catalogues.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {catalogues.map((cat) => (
                                            <CatalogueCard key={cat._id} catalogue={cat} />
                                        ))}
                                    </div>

                                    {/* Numbered pagination */}
                                    <Pagination
                                        currentPage={pagination.currentPage}
                                        totalPages={pagination.totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <BookMarked
                                        size={48}
                                        className="mx-auto text-gray-300 mb-4"
                                    />
                                    <h3 className="text-xl font-medium text-gray-700 mb-2">
                                        No catalogues found
                                    </h3>
                                    <p className="text-gray-500">
                                        Try adjusting your filters to find what you're
                                        looking for.
                                    </p>
                                    <button
                                        onClick={resetFilters}
                                        className="mt-4 text-primary hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50"
                            onClick={() => setShowMobileFilters(false)}
                        ></div>
                        <div className="absolute left-0 top-0 h-full w-4/5 max-w-sm bg-white overflow-y-auto p-6">
                            <FiltersSection
                                uiFilters={uiFilters}
                                handleFilterChange={handleFilterChange}
                                resetFilters={resetFilters}
                                setShowMobileFilters={setShowMobileFilters}
                            />
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default Catalogues;