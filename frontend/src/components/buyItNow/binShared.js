// Shared helpers for Buy It Now after the auction.
export const BIN_HOURS = 48;

export const money = (amount, currency = "EUR") =>
    amount || amount === 0
        ? `${currency === "GBP" ? "£" : "€"}${Number(amount).toLocaleString("en-IE", { maximumFractionDigits: 0 })}`
        : "";

/** "1d 4h left", "3h 12m left", "8m left" */
export const timeLeft = (endsAt, now = Date.now()) => {
    const ms = new Date(endsAt).getTime() - now;
    if (ms <= 0) return "Ended";
    const h = Math.floor(ms / 36e5);
    const m = Math.floor((ms % 36e5) / 6e4);
    if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
    if (h >= 1) return `${h}h ${m}m left`;
    return `${Math.max(1, m)}m left`;
};
