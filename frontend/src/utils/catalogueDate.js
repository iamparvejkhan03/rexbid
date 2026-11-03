// Extract "YYYY-MM-DD" from a catalogue's stored closingDate (UTC midnight)
export const getDayKey = (closingDate) =>
    new Date(closingDate).toISOString().slice(0, 10);

// "2026-11-04" → viewer's local start/end as ISO instants
export const getViewerDayBounds = (dayKey) => {
    const [y, m, d] = dayKey.split("-").map(Number);
    const start = new Date(y, m - 1, d, 0, 0, 0, 0);
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    return { start: start.toISOString(), end: end.toISOString() };
};

// "2026-11-04" → "4 November 2026" (consistent display, viewer-TZ agnostic)
export const formatDayKey = (dayKey, locale = "en-IE") => {
    const [y, m, d] = dayKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

// Is the catalogue's day strictly before the viewer's today?
export const isCataloguePast = (closingDate) => {
    const closingKey = getDayKey(closingDate);
    const todayKey = new Date().toLocaleDateString("en-CA"); // viewer TZ, "YYYY-MM-DD"
    return closingKey < todayKey;
};

// Is the catalogue's day strictly after the viewer's today?
export const isCatalogueUpcoming = (closingDate) => {
    const closingKey = getDayKey(closingDate);
    const todayKey = new Date().toLocaleDateString("en-CA");
    return closingKey > todayKey;
};