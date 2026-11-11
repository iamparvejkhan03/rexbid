/** Days the buyer has to collect after payment. */
export const COLLECTION_WORKING_DAYS = Number(process.env.COLLECTION_WORKING_DAYS || 3);

/**
 * Adds working days (Monday to Friday) to a date, counting from the next day,
 * and returns close of business on the last one. Public holidays are not skipped.
 */
export const addWorkingDays = (from, days) => {
    const d = new Date(from);
    let added = 0;
    while (added < days) {
        d.setUTCDate(d.getUTCDate() + 1);
        if (![0, 6].includes(d.getUTCDay())) added += 1;
    }
    d.setUTCHours(17, 0, 0, 0);
    return d;
};
