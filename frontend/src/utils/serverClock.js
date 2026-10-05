// A site-wide singleton that keeps the frontend's notion of "now"
// in sync with the backend's clock. Every countdown in the app
// reads from getServerNow() instead of Date.now().

import axiosInstance from "./axiosInstance";

const RESYNC_INTERVAL_MS = 5 * 60 * 1000;   // periodic resync
const REANCHOR_THRESHOLD_MS = 250;          // ignore tiny socket drift

let offsetMs = 0;          // serverNow - clientNow
let ready = false;
let started = false;
let intervalId = null;

const listeners = new Set();

const notify = () => {
    for (const fn of listeners) {
        try { fn(ready, offsetMs); } catch (_) { /* ignore */ }
    }
};

const applyOffset = (newOffset) => {
    // Guard against garbage values.
    if (!Number.isFinite(newOffset)) return;
    offsetMs = newOffset;
    const wasReady = ready;
    ready = true;
    if (!wasReady || true) notify(); // always notify on offset change
};

/** Server-aligned "now" in ms. Safe to call at any time (falls back to local). */
export const getServerNow = () => Date.now() + offsetMs;

/** True once the first successful sync has landed. */
export const isClockReady = () => ready;

/**
 * Subscribe to clock updates. Callback fires immediately with current state,
 * then on every offset change. Returns an unsubscribe function.
 */
export const subscribeToClock = (fn) => {
    listeners.add(fn);
    try { fn(ready, offsetMs); } catch (_) { }
    return () => listeners.delete(fn);
};

/**
 * HTTP sync. Measures round-trip and assumes the server stamped its
 * time at the midpoint — halves the error from network latency.
 */
export const syncWithServer = async () => {
    try {
        const t0 = Date.now();
        const { data } = await axiosInstance.get("/api/v1/time");
        const t1 = Date.now();
        if (!data || typeof data.serverTime !== "number") return;
        const rtt = t1 - t0;
        const serverNow = data.serverTime + rtt / 2;
        applyOffset(serverNow - t1);
    } catch (_) {
        // Silent — countdown falls back to local time until next attempt.
    }
};

/**
 * Nudge the offset from a socket payload's serverTime. Only applies if the
 * change is meaningful, to avoid jitter from socket latency variance.
 */
export const reanchorFromSocket = (serverTime) => {
    if (typeof serverTime !== "number") return;
    const receivedAt = Date.now();
    const candidateOffset = serverTime - receivedAt;
    if (Math.abs(candidateOffset - offsetMs) > REANCHOR_THRESHOLD_MS) {
        applyOffset(candidateOffset);
    }
};

/**
 * Start the clock. Idempotent — safe to call from anywhere.
 * Wires up:
 *  - initial sync
 *  - 5-min periodic resync
 *  - resync on tab focus
 *  - resync when the network comes back online
 */
export const ensureClockStarted = () => {
    if (started) return;
    started = true;

    syncWithServer();
    intervalId = setInterval(syncWithServer, RESYNC_INTERVAL_MS);

    if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") syncWithServer();
        });
    }
    if (typeof window !== "undefined") {
        window.addEventListener("online", syncWithServer);
    }
};