// Approve a listing and give it a closing time (Auctions tab).
// The menu runs from "First closing" every N minutes on the sale's closing
// day. Times already used by other listings are shown but can't be picked.
// The two settings are remembered per sale day in this browser.
import { useCallback, useEffect, useState } from "react";
import { X, Clock, CheckCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";

const dayLabel = (key) => {
    if (!key) return "";
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-IE", { weekday: "long", day: "numeric", month: "long" });
};

const SETTINGS_KEY = "rexbid.closingSettings";
const loadSettings = () => {
    try {
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
    } catch {
        return {};
    }
};
const saveSettings = (day, value) => {
    try {
        const all = loadSettings();
        all[day] = value;
        all._last = value;
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(all));
    } catch {
        /* storage unavailable: settings just aren't remembered */
    }
};

function ApproveListingModal({ auction, onClose, onApproved }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [choice, setChoice] = useState("");
    const [saving, setSaving] = useState(false);
    const [from, setFrom] = useState(() => loadSettings()._last?.from || "19:00");
    const [every, setEvery] = useState(() => loadSettings()._last?.every || 2);

    const loadSlots = useCallback(
        async (f, e) => {
            setLoading(true);
            try {
                const { data: res } = await axiosInstance.get(
                    `/api/v1/admin/auctions/${auction._id}/closing-slots`,
                    { params: { from: f, every: e } }
                );
                if (res?.success) {
                    setData(res.data);
                    const firstFree = res.data.slots.find((s) => !s.taken);
                    setChoice(firstFree ? firstFree.time : "");
                    return res.data;
                }
            } catch {
                toast.error("Couldn't load closing times");
            } finally {
                setLoading(false);
            }
            return null;
        },
        [auction._id]
    );

    // First load; then switch to the settings remembered for this sale day.
    useEffect(() => {
        (async () => {
            const d = await loadSlots(from, every);
            const saved = d && loadSettings()[d.day];
            if (saved && (saved.from !== from || Number(saved.every) !== Number(every))) {
                setFrom(saved.from);
                setEvery(saved.every);
                loadSlots(saved.from, saved.every);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadSlots]);

    const applySettings = () => {
        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(from)) return toast.error("Enter a time like 19:00");
        const n = Math.max(1, Math.min(60, parseInt(every, 10) || 2));
        setEvery(n);
        if (data?.day) saveSettings(data.day, { from, every: n });
        loadSlots(from, n);
    };

    const approve = async (closingTime) => {
        setSaving(true);
        try {
            const { data: res } = await axiosInstance.patch(
                `/api/v1/admin/auctions/${auction._id}/approve`,
                closingTime ? { closingTime } : {}
            );
            if (res.success) {
                if (data?.day) saveSettings(data.day, { from, every: Number(every) });
                toast.success(res.message || "Approved");
                onApproved();
                onClose();
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to approve");
            // Someone may have taken the time meanwhile: reload the menu.
            if (err?.response?.status === 409) loadSlots(from, every);
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

                {data && (
                    <p className="mb-3 text-sm text-gray-700">
                        Closing day: <strong>{dayLabel(data.day)}</strong>
                        {data.saleDateLabel ? ` (${data.saleDateLabel})` : ""}
                    </p>
                )}

                {/* Menu settings */}
                <div className="mb-4 grid grid-cols-[1fr_1fr_auto] items-end gap-2 rounded-lg bg-gray-50 p-3">
                    <div>
                        <label htmlFor="closingFrom" className="mb-1 block text-xs font-medium text-gray-600">First closing</label>
                        <input
                            id="closingFrom"
                            type="time"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full rounded border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="closingEvery" className="mb-1 block text-xs font-medium text-gray-600">Minutes between</label>
                        <input
                            id="closingEvery"
                            type="number"
                            min="1"
                            max="60"
                            value={every}
                            onChange={(e) => setEvery(e.target.value)}
                            className="w-full rounded border border-gray-300 p-2 text-sm"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={applySettings}
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-sm font-medium hover:bg-gray-100"
                    >
                        Update
                    </button>
                </div>

                {loading && !data ? (
                    <div className="flex items-center gap-2 py-6 text-gray-500">
                        <Loader2 size={18} className="animate-spin" /> Loading closing times...
                    </div>
                ) : data ? (
                    <>
                        <label htmlFor="closingTime" className="mb-1 block text-sm font-medium text-gray-800">
                            Closing time (Irish time)
                        </label>
                        <div className="relative">
                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <select
                                id="closingTime"
                                value={choice}
                                disabled={loading}
                                onChange={(e) => setChoice(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 p-3 pl-9"
                            >
                                {data.slots.length === 0 && <option value="">No times: check the settings above</option>}
                                {data.slots.map((s) => (
                                    <option key={s.time} value={s.time} disabled={s.taken}>
                                        {s.label}
                                        {s.taken ? ` – taken (${s.takenBy})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <p className="mt-1.5 text-xs text-gray-500">
                            {free} of {data.slots.length} times free · currently {data.currentLabel}
                        </p>

                        <div className="mt-5 flex flex-col gap-2">
                            <button
                                disabled={!choice || saving || loading}
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
