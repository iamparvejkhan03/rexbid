// Closing-time slots for a sale day.
//
// On a sale day, listings close one after another. When an admin approves a
// listing they pick its closing time from a menu of slots (e.g. 19:00, 19:02,
// 19:04 ...). A slot used by one listing can't be picked for another.
//
// Times are Irish local time (Europe/Dublin), so 19:00 stays 19:00 across the
// summer/winter clock change.

export const TIME_ZONE = "Europe/Dublin";
export const DEFAULT_FIRST_CLOSING_TIME = "19:00";
export const DEFAULT_CLOSING_INTERVAL = 2; // minutes
const MAX_SLOTS = 720;

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
export const isValidHHMM = (v) => typeof v === "string" && HHMM.test(v);

/** Minutes Dublin is ahead of UTC at a given instant (0 in winter, 60 in summer). */
const dublinOffsetMinutes = (date) => {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: TIME_ZONE,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    }).formatToParts(date);
    const get = (t) => Number(parts.find((p) => p.type === t).value);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
    return Math.round((asUtc - Math.floor(date.getTime() / 60000) * 60000) / 60000);
};

/** "YYYY-MM-DD" of an instant, in Irish time. */
export const dublinDayKey = (date) =>
    new Date(date).toLocaleDateString("en-CA", { timeZone: TIME_ZONE });

/** The instant that is HH:MM Irish time on the given Irish day. */
export const dublinTime = (dayKey, hhmm) => {
    const [y, m, d] = dayKey.split("-").map(Number);
    const [h, mi] = hhmm.split(":").map(Number);
    const guess = Date.UTC(y, m - 1, d, h, mi);
    let result = guess - dublinOffsetMinutes(new Date(guess)) * 60000;
    // Re-check near the clock change.
    result = guess - dublinOffsetMinutes(new Date(result)) * 60000;
    return new Date(result);
};

/** "19:04" for an instant, in Irish time. */
export const dublinHHMM = (date) =>
    new Date(date).toLocaleTimeString("en-GB", {
        timeZone: TIME_ZONE,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });

/**
 * All closing slots for a sale day.
 * @param {object} opts  { endDate, firstClosingTime?, closingInterval? }
 *   endDate is the sale date's end. Slots run on its Irish day, from
 *   firstClosingTime (set in the admin approve pop-up, default 19:00) every
 *   closingInterval minutes (default 2), up to and including endDate.
 * @returns {Date[]}
 */
export const buildClosingSlots = (saleDate) => {
    const end = new Date(saleDate.endDate);
    const first = isValidHHMM(saleDate.firstClosingTime)
        ? saleDate.firstClosingTime
        : DEFAULT_FIRST_CLOSING_TIME;
    const interval = Math.max(1, Math.min(60, Number(saleDate.closingInterval) || DEFAULT_CLOSING_INTERVAL));

    const start = dublinTime(dublinDayKey(end), first);
    const slots = [];
    for (let t = start.getTime(); t <= end.getTime() && slots.length < MAX_SLOTS; t += interval * 60000) {
        slots.push(new Date(t));
    }
    return slots;
};

/** Listing statuses that hold a closing slot. */
export const SLOT_HOLDING_STATUSES = ["approved", "active", "ended", "sold", "reserve_not_met"];
