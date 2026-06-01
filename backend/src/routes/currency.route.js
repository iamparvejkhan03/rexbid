import express from 'express';
const currencyRouter = express.Router();

let cache = {
    rates: null,
    lastFetch: null
};
const REFRESH_MS = 3600000; // 1 hour

// Fetch rates for both base currencies
async function fetchAllRates() {
    try {
        const [eurRes, gbpRes] = await Promise.all([
            fetch('https://open.er-api.com/v6/latest/EUR'),
            fetch('https://open.er-api.com/v6/latest/GBP')
        ]);
        const eurData = await eurRes.json();
        const gbpData = await gbpRes.json();

        cache.rates = {
            EUR: { rates: eurData.rates, updated: new Date().toISOString() },
            GBP: { rates: gbpData.rates, updated: new Date().toISOString() }
        };
        cache.lastFetch = Date.now();
        console.log('Exchange rates cached');
    } catch (err) {
        console.error('Rate fetch error:', err);
    }
}

// Endpoint for frontend
currencyRouter.get('/rates', (req, res) => {
    if (!cache.rates) return res.status(503).json({ error: 'Rates not ready' });
    res.json(cache.rates);
});

// Start auto-refresh on server load
fetchAllRates();
setInterval(fetchAllRates, REFRESH_MS);

// At bottom of currencyRoutes.js
export const getCachedRates = () => cache.rates;

export default currencyRouter;