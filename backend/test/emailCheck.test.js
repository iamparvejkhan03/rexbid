import { test } from "node:test";
import assert from "node:assert/strict";
import { suggestEmailFix, checkEmail, __clearMxCache } from "../src/utils/emailCheck.js";

// Fake DNS: these domains have mail servers, everything else doesn't exist.
const fakeResolver = {
    resolveMx: async (d) => {
        if (["gmail.com", "hotmail.com", "rexbid.ie", "eircom.net", "gmal.com"].includes(d)) {
            return [{ exchange: `mx.${d}`, priority: 10 }];
        }
        throw Object.assign(new Error("not found"), { code: "ENOTFOUND" });
    },
};

test("suggests fixes for common typos", () => {
    assert.equal(suggestEmailFix("joe@gmail.vom"), "joe@gmail.com");
    assert.equal(suggestEmailFix("joe@gmial.com"), "joe@gmail.com");
    assert.equal(suggestEmailFix("joe@hotmial.com"), "joe@hotmail.com");
    assert.equal(suggestEmailFix("joe@outlook.ei"), "joe@outlook.ie");
    assert.equal(suggestEmailFix("joe@eircom.ner"), "joe@eircom.net");
});

test("no suggestion for correct or unrelated domains", () => {
    assert.equal(suggestEmailFix("joe@gmail.com"), null);
    assert.equal(suggestEmailFix("joe@rexbid.ie"), null);
    assert.equal(suggestEmailFix("joe@farmersjournal.ie"), null);
});

test("checkEmail: typo domain with no mail server is not ok, with suggestion", async () => {
    __clearMxCache();
    const r = await checkEmail("joe@gmail.vom", fakeResolver);
    assert.deepEqual(r, { ok: false, problem: "typo", suggestion: "joe@gmail.com" });
});

test("checkEmail: made-up domain is not ok", async () => {
    const r = await checkEmail("joe@nowhere-xyz.ie", fakeResolver);
    assert.equal(r.ok, false);
    assert.equal(r.problem, "no_mail_server");
});

test("checkEmail: good address is ok", async () => {
    const r = await checkEmail("joe@gmail.com", fakeResolver);
    assert.deepEqual(r, { ok: true, problem: null, suggestion: null });
});

test("checkEmail: real domain that looks like a typo is ok but flagged", async () => {
    const r = await checkEmail("joe@gmal.com", fakeResolver);
    assert.equal(r.ok, true);
    assert.equal(r.problem, "typo");
    assert.equal(r.suggestion, "joe@gmail.com");
});

test("checkEmail: bad format", async () => {
    const r = await checkEmail("not-an-email", fakeResolver);
    assert.equal(r.problem, "format");
});
