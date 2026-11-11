import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
    buildMetaEvent,
    normalisePhone,
    normaliseEmail,
    cleanCustomData,
    sendMetaEvent,
} from "../src/utils/metaCapi.js";

const sha = (v) => crypto.createHash("sha256").update(v).digest("hex");

test("phone numbers are normalised to digits with country code", () => {
    assert.equal(normalisePhone("087 123 4567"), "353871234567");
    assert.equal(normalisePhone("+353 87 123 4567"), "353871234567");
    assert.equal(normalisePhone("0035387 1234567"), "353871234567");
    assert.equal(normalisePhone("07700 900123"), "447700900123");
    assert.equal(normalisePhone("123"), null);
    assert.equal(normalisePhone(undefined), null);
});

test("emails are trimmed and lower-cased", () => {
    assert.equal(normaliseEmail("  Joe@Gmail.com "), "joe@gmail.com");
    assert.equal(normaliseEmail("nope"), null);
});

test("event hashes user details and never sends them in plain text", () => {
    const user = { _id: "abc123", email: "Joe@Gmail.com", phone: "087 123 4567" };
    const e = buildMetaEvent({
        eventName: "PlaceBid",
        eventId: "evt-1",
        eventSourceUrl: "https://rexbid.ie/auction/1",
        fbp: "fb.1.123.456",
        ip: "1.2.3.4",
        userAgent: "UA",
        user,
        customData: { value: 1500, currency: "EUR", content_ids: ["1"], secret: "x" },
        eventTime: 100,
    });
    assert.equal(e.event_name, "PlaceBid");
    assert.equal(e.event_id, "evt-1");
    assert.equal(e.event_time, 100);
    assert.equal(e.action_source, "website");
    assert.deepEqual(e.user_data.em, [sha("joe@gmail.com")]);
    assert.deepEqual(e.user_data.ph, [sha("353871234567")]);
    assert.deepEqual(e.user_data.external_id, [sha("abc123")]);
    assert.equal(e.user_data.fbp, "fb.1.123.456");
    assert.equal(e.event_source_url, "https://rexbid.ie/auction/1");
    assert.deepEqual(e.custom_data, { value: 1500, currency: "EUR", content_ids: ["1"], content_type: "product" });
    assert.ok(!JSON.stringify(e).includes("joe@gmail.com"));
});

test("source URLs outside rexbid.ie are dropped", () => {
    const e = buildMetaEvent({ eventName: "Lead", eventSourceUrl: "https://evil.example/x" });
    assert.equal(e.event_source_url, undefined);
});

test("unknown custom data and currencies are dropped", () => {
    assert.equal(cleanCustomData({ currency: "USD", foo: 1 }), undefined);
    assert.equal(cleanCustomData(null), undefined);
});

test("does nothing without Render settings or for unknown events", async () => {
    delete process.env.META_PIXEL_ID;
    delete process.env.META_CAPI_TOKEN;
    assert.deepEqual(await sendMetaEvent({ eventName: "PlaceBid" }), { skipped: true });
    process.env.META_PIXEL_ID = "1";
    process.env.META_CAPI_TOKEN = "t";
    assert.deepEqual(await sendMetaEvent({ eventName: "Purchase" }), { skipped: true });
    delete process.env.META_PIXEL_ID;
    delete process.env.META_CAPI_TOKEN;
});
