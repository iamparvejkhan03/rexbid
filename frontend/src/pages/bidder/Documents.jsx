import { useEffect, useState } from "react";
import { FileText, Download } from "lucide-react";
import { AccountInactiveBanner, BidderContainer, BidderHeader, BidderSidebar, LoadingSpinner } from "../../components";
import axiosInstance from "../../utils/axiosInstance";
import { openPdf, DOCUMENT_LABELS, formatMoney } from "../../utils/openPdf";

function Documents() {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get("/api/v1/sales/documents")
            .then((res) => setDocs(res.data?.data || []))
            .catch(() => setDocs([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            <BidderSidebar />
            <div className="w-full relative">
                <BidderHeader />
                <BidderContainer>
                    <AccountInactiveBanner />
                    <div className="max-w-full pt-16 pb-7 md:pt-0">
                        <h2 className="text-3xl md:text-4xl font-bold my-5">Documents</h2>
                        <p className="text-gray-600">Payment requests and receipts for your purchases.</p>
                    </div>

                    {loading ? (
                        <LoadingSpinner height="300px" />
                    ) : docs.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500 mb-16">
                            <FileText className="mx-auto mb-3 text-gray-400" size={36} />
                            No documents yet. When you win an auction, your payment request will appear here.
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                            <ul className="divide-y divide-gray-200">
                                {docs.map((d) => (
                                    <li key={d.documentId} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-secondary">
                                                    {DOCUMENT_LABELS[d.type] || d.type}
                                                </span>
                                                <span className="text-xs text-gray-500">{d.number}</span>
                                                {!d.current && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        Replaced
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-700 truncate">{d.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(d.issuedAt).toLocaleDateString("en-IE", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div className="font-semibold">{formatMoney(d.total, d.currency)}</div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                openPdf(`/api/v1/sales/${d.saleId}/documents/${d.documentId}`, `${d.number}.pdf`)
                                            }
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90"
                                        >
                                            <Download size={16} /> View PDF
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </BidderContainer>
            </div>
        </section>
    );
}

export default Documents;
