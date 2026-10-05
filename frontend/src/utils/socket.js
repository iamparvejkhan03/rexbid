import { io } from "socket.io-client";
import { ensureClockStarted, syncWithServer } from "./serverClock";

const SOCKET_URL =
    import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],

    // --- Reconnect tuning ---
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,       // 1s initial
    reconnectionDelayMax: 3000,    // cap at 3s instead of 5s default
    randomizationFactor: 0.3,
    timeout: 10000,

    autoConnect: true,
});

// ─────────────────────────────────────────────────────────────
// Watchdog: force reconnect if no server event for > 45s while
// the tab is visible. This is what catches the iOS/Android
// silent death where socket.connected stays true.
// ─────────────────────────────────────────────────────────────

let lastServerEventAt = Date.now();
const markServerEvent = () => { lastServerEventAt = Date.now(); };

["auction:tick", "auction:update", "auction:removed"].forEach((evt) =>
    socket.on(evt, markServerEvent)
);
socket.io.on("ping", markServerEvent);

const SILENCE_LIMIT_MS = 40_000;
const WATCHDOG_INTERVAL_MS = 8_000;

const forceReconnect = (reason) => {
    console.warn(`[socket] force reconnect: ${reason}`);
    try { socket.disconnect(); } catch (_) { }
    try { socket.connect(); } catch (_) { }
    lastServerEventAt = Date.now(); // reset so we don't loop
};

const watchdog = setInterval(() => {
    if (!socket.connected) {
        // already reconnecting — reset baseline
        lastServerEventAt = Date.now();
        return;
    }
    const silence = Date.now() - lastServerEventAt;
    if (silence > SILENCE_LIMIT_MS) {
        forceReconnect(`silent for ${Math.round(silence / 1000)}s`);
    }
}, WATCHDOG_INTERVAL_MS);

// ─────────────────────────────────────────────────────────────
// On visibility return, don't just poke it — hard-cycle it.
// (Silent death leaves socket.connected === true, so a plain
// .connect() is a no-op.)
// ─────────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            setTimeout(() => {
                forceReconnect("visibilitychange");
                syncWithServer();
            }, 200);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// Existing hooks
// ─────────────────────────────────────────────────────────────
socket.on("connect", () => {
    lastServerEventAt = Date.now(); // reset watchdog on fresh connect
    ensureClockStarted();
    syncWithServer();
});

socket.on("disconnect", (reason) => {
    // Only log — reconnection is automatic
    console.info("[socket] disconnected:", reason);
});

const isMobile =
    typeof navigator !== "undefined" &&
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

let mobileCycle = null;
if (isMobile) {
    mobileCycle = setInterval(() => {
        forceReconnect("periodic mobile refresh");
    }, 4 * 60 * 1000);
}

// Cleanup for HMR in dev
if (import.meta.hot) {
    import.meta.hot.dispose(() => {
        clearInterval(watchdog);
        if (mobileCycle) clearInterval(mobileCycle);
    });
}