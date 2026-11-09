// Approve a listing and give it a closing time from the sale day's menu.
// Times already used by other listings are shown but can't be picked.
import { useEffect, useState } from "react";
import { X, Clock, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const dayLabel = (key) => {
    if (!key) return "";
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
};

function ApproveListingModal({ auction, onClose, onApproved }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [choice, setChoice] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        axiosInstance
            .get(`/api/v1/admin/auctions/${auction._id}/closing-slots`)
            .then(({ data: res }) => {
                if (cancelled || !res?.success) return;
                setData(res.data);
                const firstFree = res.data.slots.find((s) => !s.taken);
                setChoice(firstFree ? firstFree.time : "");
            })
            .catch(() => toast.error("Couldn't load closing times"))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [auction._id]);

    const approve = async (closingTime) => {
        setSaving(true);
        try {
            const { data: res } = await axiosInstance.patch(
                `/api/v1/admin/auctions/${auction._id}/approve`,
                closingTime ? { closingTime } : {}
            );
            if (res.success) {
                toast.success(res.message || "Approved");
                onApproved();
                onClose();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to approve");
            // Someone may have taken the slot meanwhile: reload the menu.
            if (err?.response?.status === 409) {
                const { data: res } = await axiosInstance.get(`/api/v1/admin/auctions/${auction._id}/closing-slots`);
                if (res?.success) {
                    setData(res.data);
                    const firstFree = res.data.slots.find((s) => !s.taken);
                    setChoice(firstFree ? firstFree.time : "");
                }
            }
        } finally {
            setSaving(false);
        }
    };

    const free = data ? data.slots.filter((s) => !s.taken).length : 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Approve listing</h3>
                        <p className="mt-0.5 text-sm text-gray-600">{auction.title}</p>
                    </div>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex items-center gap-2 py-6 text-gray-500">
                        <Loader2 size={18} className="animate-spin" /> Loading closing times...
                    </div>
                ) : data ? (
                    <>
                        <p className="mb-1 text-sm text-gray-700">
                            Sale day: <strong>{dayLabel(data.day)}</strong>
                            {data.saleDateLabel ? ` (${data.saleDateLabel})` : ""}
                        </p>
                        <p className="mb-4 text-xs text-gray-500">
                            {free} of {data.slots.length} closing times free · currently set to {data.currentLabel}
                        </p>

                        <label htmlFor="closingTime" className="mb-1 block text-sm font-medium text-gray-800">
                            Closing time (Irish time)
                        </label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                id="closingTime"
                                value={choice}
                                onChange={(e) => setChoice(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 pl-9"
                            >
                                {data.slots.map((s) => (
                                    <option key={s.time} value={s.time} disabled={s.taken}>
                                        {s.label}
                                        {s.taken ? ` – taken (${s.takenBy})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-6 flex flex-col gap-2">
                            <button
                                disabled={!choice || saving}
                                onClick={() => approve(choice)}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                                <CheckCircle size={16} />
                                {saving ? "Approving..." : `Approve, closing at ${data.slots.find((s) => s.time === choice)?.label || "-"}`}
                            </button>
                            <button
                                disabled={saving}
                                onClick={() => approve(null)}
                                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Approve without changing the closing time ({data.currentLabel})
                            </button>
                        </div>
                    </>
                ) : (
                    <button onClick={() => approve(null)} className="w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white">
                        Approve without a closing time
                    </button>
                )}
            </div>
        </div>
    );
}

export default ApproveListingModal;
