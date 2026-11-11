import { useEffect, useState } from "react";
import { PackageCheck, Phone } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { formatMoney } from "../../utils/openPdf";

const longDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" }) : "";

/**
 * Paid sales waiting for collection. The buyer and the seller each confirm
 * here once the item has been collected; when both have, the seller is paid.
 */
function CollectionsPanel() {
    const [items, setItems] = useState([]);
    const [busy, setBusy] = useState(null);

    const load = () =>
        axiosInstance
            .get("/api/v1/sales/collections")
            .then((res) => setItems(res.data?.data || []))
            .catch(() => setItems([]));

    useEffect(() => {
        load();
    }, []);

    const confirm = async (item) => {
        const msg =
            item.role === "buyer"
                ? `Confirm you have collected ${item.title}?`
                : `Confirm the buyer has collected ${item.title}?`;
        if (!window.confirm(msg)) return;
        setBusy(item.saleId);
        try {
            const { data } = await axiosInstance.post(`/api/v1/sales/${item.saleId}/confirm-collection`);
            toast.success(
                data.data.status === "payout_due"
                    ? "Thanks. Both sides have confirmed, so the seller payout is now being processed."
                    : "Thanks, collection confirmed.",
            );
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not confirm collection");
        } finally {
            setBusy(null);
        }
    };

    if (!items.length) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
            <div className="px-4 py-3 border-b bg-gray-50 rounded-t-xl">
                <h3 className="font-semibold">Collection</h3>
            </div>
            <ul className="divide-y divide-gray-200">
                {items.map((i) => (
                    <li key={i.saleId} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-secondary">{i.title}</p>
                            {i.status === "payout_due" ? (
                                <p className="text-sm text-green-700">Collected. {i.role === "seller" ? "Your payout is being processed." : "Thank you."}</p>
                            ) : (
                                <>
                                    {i.collectBy && (
                                        <p className={`text-sm ${new Date(i.collectBy) < new Date() ? "text-red-600 font-medium" : "text-gray-700"}`}>
                                            Collect by {longDate(i.collectBy)}
                                            {i.itemLocation ? ` · ${i.itemLocation}` : ""}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        {i.role === "buyer" ? "Seller" : "Buyer"}: {i.otherName}
                                        {i.otherPhone && (
                                            <a href={`tel:${i.otherPhone.replace(/\s+/g, "")}`} className="ml-2 inline-flex items-center gap-1 text-primary">
                                                <Phone size={12} /> {i.otherPhone}
                                            </a>
                                        )}
                                    </p>
                                    {i.role === "seller" && i.payoutAmount !== undefined && (
                                        <p className="text-xs text-gray-500">
                                            You&rsquo;ll receive {formatMoney(i.payoutAmount, i.currency)} once you and the buyer have both confirmed.
                                        </p>
                                    )}
                                    {i.youConfirmed && !i.otherConfirmed && (
                                        <p className="text-xs text-gray-500">
                                            You&rsquo;ve confirmed. Waiting for the {i.role === "buyer" ? "seller" : "buyer"} to confirm too.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                        {i.status !== "payout_due" && !i.youConfirmed && (
                            <button
                                type="button"
                                disabled={busy === i.saleId}
                                onClick={() => confirm(i)}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
                            >
                                <PackageCheck size={16} />
                                {i.role === "buyer" ? "I've collected it" : "Buyer has collected"}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default CollectionsPanel;
