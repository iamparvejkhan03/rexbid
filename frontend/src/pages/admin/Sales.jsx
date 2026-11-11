import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, FileText, Eye, Send, RefreshCw, Search, X } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { AdminContainer, AdminHeader, AdminSidebar, LoadingSpinner } from "../../components";
import { openPdf, DOCUMENT_LABELS, formatMoney } from "../../utils/openPdf";

const TABS = [
    { key: "sold", label: "Ready to send" },
    { key: "request_sent", label: "Awaiting payment" },
    { key: "paid", label: "Paid" },
    { key: "all", label: "All" },
];

const STATUS_LABELS = {
    sold: "Ready to send",
    request_sent: "Request sent",
    paid: "Paid",
    collected: "Collected",
    payout_due: "Payout due",
    paid_out: "Paid out",
    cancelled: "Cancelled",
};

const STATUS_STYLES = {
    sold: "bg-amber-100 text-amber-800",
    request_sent: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-600",
};

const REGIONS = ["ROI", "NI", "GB", "EU", "OTHER"];

const shortDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" }) : "—";

const canSend = (s) => ["sold", "request_sent"].includes(s.status) && !s.vat?.reviewRequired;

const vatSummary = (s) => {
    if (s.vat?.treatment === "zero_rated") return "Zero-rated";
    if (s.vat?.treatment === "standard") return `${formatMoney(s.vat.amount, s.currency)} (${s.vat.rate}%)`;
    return "None";
};

function VatModal({ sale, onClose, onSaved }) {
    const [treatment, setTreatment] = useState(sale.vat?.override?.treatment || "standard");
    const [rate, setRate] = useState(sale.vat?.override?.rate ?? "");
    const [note, setNote] = useState(sale.vat?.override?.note || "");
    const [itemRegion, setItemRegion] = useState(sale.vat?.itemRegion || "");
    const [buyerRegion, setBuyerRegion] = useState(sale.buyer?.region || "");
    const [saving, setSaving] = useState(false);

    const save = async () => {
        if (!note.trim()) return toast.error("Add a note explaining the decision");
        setSaving(true);
        try {
            const { data } = await axiosInstance.patch(`/api/v1/admin/sales/${sale._id}/vat`, {
                treatment,
                rate: treatment === "standard" ? rate : undefined,
                note,
                itemRegion: itemRegion || null,
                buyerRegion: buyerRegion || null,
            });
            toast.success("VAT updated");
            onSaved(data.data);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update VAT");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b">
                    <h3 className="text-lg font-semibold">VAT review · {sale.reference}</h3>
                    <button onClick={onClose} aria-label="Close"><X size={20} /></button>
                </div>
                <div className="p-5 space-y-4 text-sm">
                    <p className="font-medium">{sale.title}</p>
                    {sale.vat?.reviewReasons?.length > 0 && (
                        <ul className="bg-amber-50 border border-amber-200 rounded-lg p-3 list-disc pl-6 text-amber-900">
                            {sale.vat.reviewReasons.map((r) => <li key={r}>{r}</li>)}
                        </ul>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="text-gray-600">Item location</span>
                            <select className="mt-1 w-full border rounded-lg p-2" value={itemRegion} onChange={(e) => setItemRegion(e.target.value)}>
                                <option value="">Unknown</option>
                                {REGIONS.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </label>
                        <label className="block">
                            <span className="text-gray-600">Buyer location</span>
                            <select className="mt-1 w-full border rounded-lg p-2" value={buyerRegion} onChange={(e) => setBuyerRegion(e.target.value)}>
                                <option value="">Unknown</option>
                                {REGIONS.map((r) => <option key={r}>{r}</option>)}
                            </select>
                        </label>
                    </div>
                    <p className="text-gray-600">
                        Buyer VAT no.: <strong>{sale.buyer?.vatNumber || "none on file"}</strong> · Seller VAT no.:{" "}
                        <strong>{sale.seller?.vatNumber || "none on file"}</strong>
                    </p>
                    <fieldset className="space-y-2">
                        <label className="flex items-center gap-2">
                            <input type="radio" checked={treatment === "standard"} onChange={() => setTreatment("standard")} />
                            Charge VAT at the standard rate (ROI 23%, NI 20%)
                        </label>
                        {treatment === "standard" && (
                            <label className="flex items-center gap-2 pl-6">
                                Rate override %
                                <input type="number" min="0" max="30" step="0.5" className="border rounded-lg p-1 w-24" value={rate} onChange={(e) => setRate(e.target.value)} placeholder="auto" />
                            </label>
                        )}
                        <label className="flex items-center gap-2">
                            <input type="radio" checked={treatment === "zero_rated"} onChange={() => setTreatment("zero_rated")} />
                            Zero-rate (cross-border sale between VAT-registered businesses)
                        </label>
                    </fieldset>
                    <label className="block">
                        <span className="text-gray-600">Note (required, kept on the sale record)</span>
                        <textarea className="mt-1 w-full border rounded-lg p-2" rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Buyer XI VAT number checked on VIES 11/11/2026" />
                    </label>
                </div>
                <div className="flex justify-end gap-2 p-5 border-t">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
                    <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50">
                        {saving ? "Saving…" : "Save decision"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Sales() {
    const [tab, setTab] = useState("sold");
    const [reviewOnly, setReviewOnly] = useState(false);
    const [search, setSearch] = useState("");
    const [sales, setSales] = useState([]);
    const [counts, setCounts] = useState({});
    const [needsReview, setNeedsReview] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(new Set());
    const [sending, setSending] = useState(false);
    const [vatSale, setVatSale] = useState(null);
    const [docsSale, setDocsSale] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ status: tab });
            if (reviewOnly) params.set("review", "true");
            if (search.trim()) params.set("search", search.trim());
            const { data } = await axiosInstance.get(`/api/v1/admin/sales?${params}`);
            setSales(data.data.sales);
            setCounts(data.data.counts || {});
            setNeedsReview(data.data.needsReview || 0);
            setSelected(new Set());
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not load sales");
        } finally {
            setLoading(false);
        }
    }, [tab, reviewOnly, search]);

    useEffect(() => {
        const t = setTimeout(load, search ? 300 : 0);
        return () => clearTimeout(t);
    }, [load, search]);

    const selectable = useMemo(() => sales.filter(canSend), [sales]);
    const allSelected = selectable.length > 0 && selectable.every((s) => selected.has(s._id));

    const toggle = (id) =>
        setSelected((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    const toggleAll = () => setSelected(allSelected ? new Set() : new Set(selectable.map((s) => s._id)));

    const issue = async () => {
        const chosen = sales.filter((s) => selected.has(s._id));
        const resends = chosen.filter((s) => s.status === "request_sent").length;
        const msg =
            `Send payment requests to ${chosen.length} buyer${chosen.length === 1 ? "" : "s"}?` +
            (resends ? `\n\n${resends} already had a request; they will get a replacement.` : "") +
            "\n\nEach buyer is emailed a PDF and it is saved in their Documents.";
        if (!window.confirm(msg)) return;
        setSending(true);
        try {
            const { data } = await axiosInstance.post("/api/v1/admin/sales/issue-payment-requests", {
                saleIds: chosen.map((s) => s._id),
            });
            const { sent, failed, results } = data.data;
            if (sent) toast.success(`${sent} payment request${sent === 1 ? "" : "s"} sent`);
            const notEmailed = results.filter((r) => r.ok && !r.emailed).length;
            if (notEmailed) toast.error(`${notEmailed} created but the email failed; open Documents to resend`);
            results
                .filter((r) => !r.ok)
                .forEach((r) => {
                    const s = chosen.find((c) => c._id === r.saleId);
                    toast.error(`${s?.reference || r.saleId}: ${r.message}`, { duration: 8000 });
                });
            if (failed && !sent) toast.error("No requests were sent");
            await load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Sending failed");
        } finally {
            setSending(false);
        }
    };

    return (
        <section className="flex min-h-screen bg-gray-50">
            <AdminSidebar />
            <div className="w-full relative">
                <AdminHeader />
                <AdminContainer>
                    <div className="max-w-full pt-16 pb-5 md:pt-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <h2 className="text-3xl md:text-4xl font-bold my-5">Sales</h2>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm">
                                    <RefreshCw size={16} /> Refresh
                                </button>
                                <button
                                    onClick={issue}
                                    disabled={selected.size === 0 || sending}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-40"
                                >
                                    <Send size={16} />
                                    {sending ? "Sending…" : `Send payment requests (${selected.size})`}
                                </button>
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm">
                            Every sold lot appears here within 15 minutes of the sale. Tick the sales to send and press the button: each buyer
                            gets their own Stripe bank details, a PDF by email, and a copy in their Documents.
                        </p>
                    </div>

                    {needsReview > 0 && (
                        <button
                            onClick={() => { setReviewOnly(true); setTab("all"); }}
                            className="w-full text-left mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-sm"
                        >
                            <AlertTriangle size={18} />
                            {needsReview} sale{needsReview === 1 ? " needs" : "s need"} a VAT review before the payment request can be sent.
                            <span className="underline ml-auto">Show</span>
                        </button>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                        <div className="flex flex-wrap gap-1 bg-white border rounded-lg p-1">
                            {TABS.map((t) => (
                                <button
                                    key={t.key}
                                    onClick={() => { setTab(t.key); setReviewOnly(false); }}
                                    className={`px-3 py-1.5 rounded-md text-sm ${tab === t.key && !reviewOnly ? "bg-secondary text-white" : "text-gray-700"}`}
                                >
                                    {t.label}
                                    {t.key !== "all" && counts[t.key] ? ` (${counts[t.key]})` : ""}
                                </button>
                            ))}
                            {reviewOnly && <span className="px-3 py-1.5 rounded-md text-sm bg-amber-500 text-white">VAT review</span>}
                        </div>
                        <label className="relative flex-1 md:max-w-xs">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Reference, item, buyer or seller"
                                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                            />
                        </label>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-16">
                        {loading ? (
                            <LoadingSpinner height="300px" />
                        ) : sales.length === 0 ? (
                            <p className="p-10 text-center text-gray-500">No sales here.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                        <tr>
                                            <th className="p-3 text-left">
                                                <input type="checkbox" aria-label="Select all" checked={allSelected} onChange={toggleAll} disabled={!selectable.length} />
                                            </th>
                                            <th className="p-3 text-left">Sale</th>
                                            <th className="p-3 text-left">Buyer</th>
                                            <th className="p-3 text-left">Seller</th>
                                            <th className="p-3 text-right">Item</th>
                                            <th className="p-3 text-right">VAT</th>
                                            <th className="p-3 text-right">Buyer fee</th>
                                            <th className="p-3 text-right">Total</th>
                                            <th className="p-3 text-left">Status</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {sales.map((s) => (
                                            <tr key={s._id} className={selected.has(s._id) ? "bg-amber-50/50" : ""}>
                                                <td className="p-3 align-top">
                                                    <input
                                                        type="checkbox"
                                                        aria-label={`Select ${s.reference}`}
                                                        checked={selected.has(s._id)}
                                                        disabled={!canSend(s)}
                                                        onChange={() => toggle(s._id)}
                                                    />
                                                </td>
                                                <td className="p-3 align-top min-w-[180px]">
                                                    <div className="font-semibold">{s.reference}</div>
                                                    <div className="text-gray-700">{s.title}</div>
                                                    <div className="text-xs text-gray-500">Sold {shortDate(s.saleDate)}</div>
                                                </td>
                                                <td className="p-3 align-top min-w-[160px]">
                                                    <div>{s.buyer?.name || s.buyer?.username}</div>
                                                    <div className="text-xs text-gray-500">{s.buyer?.email}</div>
                                                    <div className="text-xs text-gray-500">{s.buyer?.region || "Location unknown"}</div>
                                                    {s.stripe?.bankTransfer?.iban || s.stripe?.bankTransfer?.accountNumber ? (
                                                        <div className="text-xs font-mono text-gray-700 mt-1" title="Buyer's own Stripe bank-transfer account">
                                                            {s.stripe.bankTransfer.iban ||
                                                                `${s.stripe.bankTransfer.sortCode} ${s.stripe.bankTransfer.accountNumber}`}
                                                        </div>
                                                    ) : ["sold", "request_sent"].includes(s.status) ? (
                                                        <div
                                                            className={`text-xs mt-1 ${s.stripe?.ibanError ? "text-red-600" : "text-gray-400"}`}
                                                            title={s.stripe?.ibanError || ""}
                                                        >
                                                            {s.stripe?.ibanError ? "IBAN failed – press Refresh" : "Getting IBAN from Stripe…"}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td className="p-3 align-top min-w-[140px]">
                                                    <div>{s.seller?.companyName || s.seller?.name || s.seller?.username}</div>
                                                    <div className="text-xs text-gray-500">Item in {s.vat?.itemRegion || "unknown"}</div>
                                                </td>
                                                <td className="p-3 align-top text-right whitespace-nowrap">{formatMoney(s.itemPrice, s.currency)}</td>
                                                <td className="p-3 align-top text-right whitespace-nowrap">
                                                    {vatSummary(s)}
                                                    {s.vat?.reviewRequired && (
                                                        <button onClick={() => setVatSale(s)} className="mt-1 flex items-center gap-1 ml-auto text-xs font-medium text-amber-700">
                                                            <AlertTriangle size={14} /> Review
                                                        </button>
                                                    )}
                                                </td>
                                                <td className="p-3 align-top text-right whitespace-nowrap">{formatMoney(s.buyerFee, s.currency)}</td>
                                                <td className="p-3 align-top text-right whitespace-nowrap font-semibold">{formatMoney(s.total, s.currency)}</td>
                                                <td className="p-3 align-top">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_STYLES[s.status] || "bg-gray-100"}`}>
                                                        {STATUS_LABELS[s.status] || s.status}
                                                    </span>
                                                    {s.status === "request_sent" && s.payment?.dueAt && (
                                                        <div className={`text-xs mt-1 ${new Date(s.payment.dueAt) < new Date() ? "text-red-600 font-medium" : "text-gray-500"}`}>
                                                            Due {shortDate(s.payment.dueAt)}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 align-top text-right whitespace-nowrap">
                                                    <div className="flex justify-end gap-1">
                                                        {["sold", "request_sent"].includes(s.status) && (
                                                            <button
                                                                title="Preview payment request"
                                                                onClick={() => openPdf(`/api/v1/admin/sales/${s._id}/payment-request/preview`, `${s.reference}-draft.pdf`)}
                                                                className="p-2 rounded-lg hover:bg-gray-100"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        )}
                                                        {["sold", "request_sent"].includes(s.status) && !s.vat?.reviewRequired && s.vat?.applicable && (
                                                            <button title="Change VAT" onClick={() => setVatSale(s)} className="p-2 rounded-lg hover:bg-gray-100 text-xs">
                                                                VAT
                                                            </button>
                                                        )}
                                                        <button
                                                            title="Documents"
                                                            onClick={() => setDocsSale(s)}
                                                            disabled={!s.documents?.length}
                                                            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 inline-flex items-center gap-1"
                                                        >
                                                            <FileText size={16} />
                                                            {s.documents?.length ? <span className="text-xs">{s.documents.length}</span> : null}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </AdminContainer>
            </div>

            {vatSale && (
                <VatModal
                    sale={vatSale}
                    onClose={() => setVatSale(null)}
                    onSaved={() => { setVatSale(null); load(); }}
                />
            )}

            {docsSale && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDocsSale(null)}>
                    <div className="bg-white rounded-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b">
                            <h3 className="text-lg font-semibold">Documents · {docsSale.reference}</h3>
                            <button onClick={() => setDocsSale(null)} aria-label="Close"><X size={20} /></button>
                        </div>
                        <ul className="divide-y">
                            {[...(docsSale.documents || [])].reverse().map((d) => (
                                <li key={d._id} className="p-4 flex items-center gap-3 text-sm">
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {DOCUMENT_LABELS[d.type]} · {d.number}
                                            {d.supersededAt && <span className="ml-2 text-xs text-gray-500">(replaced)</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Issued {shortDate(d.issuedAt)} · {formatMoney(d.total, d.currency)}
                                            {d.emailedAt ? ` · emailed to ${d.emailedTo}` : d.emailError ? ` · ${d.emailError}` : ""}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openPdf(`/api/v1/admin/sales/${docsSale._id}/documents/${d._id}`, `${d.number}.pdf`)}
                                        className="px-3 py-1.5 rounded-lg border text-sm"
                                    >
                                        View
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </section>
    );
}

export default Sales;
