// Small helpers shared by the homepage sections.
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { useLiveAuctionTicks } from "../../hooks/useLiveAuctionTicks";

export const NAVY = "#072342";
export const GOLD = "#D19F3E";

/** "€23,000" / "£4,500" */
export const money = (value, currency = "EUR") => {
    if (value === undefined || value === null || isNaN(value)) return "";
    const sym = currency === "GBP" ? "£" : "€";
    return `${sym}${Math.round(Number(value)).toLocaleString("en-IE")}`;
};

/** Price to show on a live listing card. */
export const livePrice = (a) =>
    a?.bidCount > 0 ? a?.convertedCurrentPrice ?? a?.currentPrice : a?.convertedStartPrice ?? a?.startPrice;

/** Re-render every second (for countdowns). */
export const useNow = (intervalMs = 1000) => {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), intervalMs);
        return () => clearInterval(t);
    }, [intervalMs]);
    return now;
};

/** "2d 4h", "3h 12m", "4m 09s" */
export const timeLeft = (endDate, now = Date.now()) => {
    const diff = new Date(endDate).getTime() - now;
    if (diff <= 0) return "Closed";
    const s = Math.floor(diff / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${m}m ${String(sec).padStart(2, "0")}s`;
};

/** YYYY-MM-DD for a moment, in Irish time. */
export const irishDayKey = (date) =>
    new Date(date).toLocaleDateString("en-CA", { timeZone: "Europe/Dublin" });

/**
 * Live listings that close next (soonest first), kept up to date with the
 * live bidding feed. Used by the "closing now" banner and the hero panel.
 */
export const useClosingNext = (limit = 12) => {
    const { user } = useAuth();
    const currency = user?.currency || "EUR";
    const [items, setItems] = useState([]);
    const [loaded, setLoaded] = useState(false);
    useLiveAuctionTicks(setItems);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const { data } = await axiosInstance.get(
                    `/api/v1/auctions/top?status=active&sortBy=endingSoon&limit=${limit}&currency=${currency}`
                );
                if (!cancelled && data?.success) setItems(data.data.auctions || []);
            } catch (err) {
                console.error("Closing-next fetch failed:", err);
            } finally {
                if (!cancelled) setLoaded(true);
            }
        };
        load();
        // Refresh every 2 minutes so the list rolls on as listings close.
        const t = setInterval(load, 2 * 60 * 1000);
        return () => {
            cancelled = true;
            clearInterval(t);
        };
    }, [limit, currency]);

    return { items, loaded, currency };
};
