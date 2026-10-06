import { io } from "socket.io-client";
import { ensureClockStarted, syncWithServer } from "./serverClock";

const SOCKET_URL =
    import.meta.env.VITE_DOMAIN_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],

    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 3000,
    randomizationFactor: 0.3,
    timeout: 10000,

    autoConnect: true,
});

// ─────────────────────────────────────────────────────────────
// Watchdog: force reconnect if no server event for > 40s.
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
  try { socket.disconnect(); } catch (_) {}
  try { socket.connect(); } catch (_) {}
  lastServerEventAt = Date.now();
};

const runWatchdogCheck = () => {
  if (!socket.connected) {
    lastServerEventAt = Date.now();
    return;
  }
  const silence = Date.now() - lastServerEventAt;
  if (silence > SILENCE_LIMIT_MS) {
    forceReconnect(`silent for ${Math.round(silence / 1000)}s`);
  }
};

const watchdog = setInterval(runWatchdogCheck, WATCHDOG_INTERVAL_MS);

// ─────────────────────────────────────────────────────────────
// Multi-signal wake detector.
// rAF double-tick is used instead of setTimeout because setTimeout
// is throttled on the first beat after a mobile wake.
// ─────────────────────────────────────────────────────────────

const onWake = (reason) => {
  if (typeof document !== "undefined" && document.hidden) return;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      forceReconnect(reason);
      syncWithServer();
      // Also run watchdog immediately — no need to wait up to 8s.
      runWatchdogCheck();
    });
  });
};

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) onWake("visibilitychange");
  });

  // Any user interaction on a stale socket = instant recovery.
  document.addEventListener(
    "touchstart",
    () => {
      if (Date.now() - lastServerEventAt > 30_000) {
        onWake("touchstart");
      }
    },
    { passive: true }
  );
}

if (typeof window !== "undefined") {
  window.addEventListener("focus", () => onWake("focus"));
  window.addEventListener("pageshow", (e) => {
    // persisted === true means restored from bfcache
    if (e.persisted) onWake("pageshow");
  });
  window.addEventListener("online", () => onWake("online"));
}

// ─────────────────────────────────────────────────────────────
// Existing hooks
// ─────────────────────────────────────────────────────────────
socket.on("connect", () => {
  lastServerEventAt = Date.now();
  ensureClockStarted();
  syncWithServer();
});

socket.on("disconnect", (reason) => {
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

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    clearInterval(watchdog);
    if (mobileCycle) clearInterval(mobileCycle);
  });
}