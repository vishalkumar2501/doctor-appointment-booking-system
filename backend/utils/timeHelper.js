/**
 * Converts a time string in 24-hour format (HH:MM) to minutes since midnight.
 * @param {string} t - Time string (e.g., "10:30")
 * @returns {number} Minutes since midnight
 */
export const timeToMinutes = (t) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

/**
 * Converts minutes since midnight back to a 24h formatted time string (HH:MM).
 * @param {number} min - Minutes since midnight
 * @returns {string} Formatted 24-hour time string
 */
export const minutesToTimeStr = (min) => {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return `${h}:${m}`;
};

/**
 * Returns the weekday name of a given date string supporting D_M_YYYY or YYYY-MM-DD.
 * @param {string} dateStr - Date representation
 * @returns {string} Weekday name (e.g. "Monday")
 */
export const getWeekdayOfDate = (dateStr) => {
    let date;
    if (dateStr.includes('_')) {
        const [d, m, y] = dateStr.split('_').map(Number);
        date = new Date(Date.UTC(y, m - 1, d));
    } else if (dateStr.includes('-')) {
        const [y, m, d] = dateStr.split('-').map(Number);
        date = new Date(Date.UTC(y, m - 1, d));
    } else {
        date = new Date(dateStr);
    }
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return weekdays[date.getUTCDay()];
};
