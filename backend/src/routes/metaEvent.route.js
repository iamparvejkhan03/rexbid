import { Router } from "express";
import { optionalAuth } from "../middlewares/auth.middleware.js";
import { ALLOWED_META_EVENTS, sendMetaEvent } from "../utils/metaCapi.js";

// POST /api/v1/meta-events
// Called by the browser (frontend/src/utils/metaPixel.js) only after the
// visitor accepted advertising cookies. Answers 204 straight away and sends
// the event to Meta in the background.

const metaEventRouter = Router();

// Simple per-IP limit: 60 events a minute is far more than a real visitor sends.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map();
const tooMany = (ip) => {
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || now - h.start > WINDOW_MS) {
        hits.set(ip, { start: now, count: 1 });
        if (hits.size > 10_000) hits.clear();
        return false;
    }
    h.count += 1;
    return h.count > MAX_PER_WINDOW;
};

const clientIp = (req) =>
    (req.headers["cf-connecting-ip"] ||
        String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
        req.ip ||
        ""
    ).toString() || undefined;

metaEventRouter.post("/", optionalAuth, (req, res) => {
    const { event_name, event_id, event_source_url, fbp, fbc, custom_data } = req.body || {};
    const ip = clientIp(req);

    if (!ALLOWED_META_EVENTS.has(event_name) || tooMany(ip || "unknown")) {
        return res.status(204).end();
    }

    res.status(204).end();

    sendMetaEvent({
        eventName: event_name,
        eventId: event_id,
        eventSourceUrl: event_source_url,
        fbp,
        fbc,
        ip,
        userAgent: req.headers["user-agent"],
        user: req.user,
        customData: custom_data,
    });
});

export default metaEventRouter;
