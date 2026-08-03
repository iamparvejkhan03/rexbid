// Simple in-memory cache with TTL (milliseconds)
const cache = new Map();

export const setTempData = (key, data, ttl = 30 * 60 * 1000) => { // default 30 minutes
    cache.set(key, { data, expires: Date.now() + ttl });
};

export const getTempData = (key) => {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
        cache.delete(key);
        return null;
    }
    return entry.data;
};

export const deleteTempData = (key) => {
    cache.delete(key);
};

// Clean up expired entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
        if (now > entry.expires) cache.delete(key);
    }
}, 60 * 1000);