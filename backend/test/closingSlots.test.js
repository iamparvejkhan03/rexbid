import { test } from "node:test";
import assert from "node:assert/strict";
import {
    buildClosingSlots,
    dublinTime,
    dublinHHMM,
    dublinDayKey,
    isValidHHMM,
} from "../src/utils/closingSlots.js";

test("winter: 19:00 Irish time is 19:00 UTC", () => {
    assert.equal(dublinTime("2026-11-17", "19:00").toISOString(), "2026-11-17T19:00:00.000Z");
});

test("summer: 19:00 Irish time is 18:00 UTC", () => {
    assert.equal(dublinTime("2026-07-14", "19:00").toISOString(), "2026-07-14T18:00:00.000Z");
});

test("slots run from the first closing time to the sale end, every N minutes", () => {
    const slots = buildClosingSlots({
        endDate: new Date("2026-11-17T23:00:00.000Z"),
        firstClosingTime: "19:00",
        closingInterval: 2,
    });
    assert.equal(slots.length, 121); // 19:00 .. 23:00 inclusive
    assert.equal(dublinHHMM(slots[0]), "19:00");
    assert.equal(dublinHHMM(slots[1]), "19:02");
    assert.equal(dublinHHMM(slots.at(-1)), "23:00");
    assert.equal(dublinDayKey(slots[0]), "2026-11-17");
});

test("a Saturday day sale uses its own first closing time", () => {
    const slots = buildClosingSlots({
        endDate: new Date("2026-11-21T16:00:00.000Z"),
        firstClosingTime: "12:00",
        closingInterval: 5,
    });
    assert.equal(dublinHHMM(slots[0]), "12:00");
    assert.equal(dublinHHMM(slots[1]), "12:05");
    assert.equal(dublinHHMM(slots.at(-1)), "16:00");
});

test("defaults: 19:00 every 2 minutes", () => {
    const slots = buildClosingSlots({ endDate: new Date("2026-11-24T23:59:00.000Z") });
    assert.equal(dublinHHMM(slots[0]), "19:00");
    assert.equal(dublinHHMM(slots.at(-1)), "23:58");
});

test("HH:MM validation", () => {
    assert.ok(isValidHHMM("07:30"));
    assert.ok(!isValidHHMM("7:30"));
    assert.ok(!isValidHHMM("24:00"));
});
