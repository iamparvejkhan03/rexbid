import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const getPageNumbers = (current, total) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

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
    if (!totalPages || totalPages <= 1) return null;

    const pages = getPageNumbers(currentPage, totalPages);

    return (
        <nav
            className="flex items-center justify-center gap-1.5 mt-12 flex-wrap"
            aria-label="Pagination"
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center gap-1 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
            </button>

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

export default Pagination;