// Run: node --test src/components/reseller/__tests__/reseller-api.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { transform } from "esbuild";
import { readFile } from "node:fs/promises";
async function load(relative) {
  const source = await readFile(new URL(relative, import.meta.url), "utf8");
  const { code } = await transform(source, { loader: "ts", format: "esm" });
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const api = await load("../../../lib/reseller-api.ts");
const pending = await load("../pending-order.ts");
const i18n = await load("../../../lib/reseller-i18n.ts");
const originalFetch = globalThis.fetch;
const reply = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  api.clearResellerSession();
  delete globalThis.window;
  delete globalThis.sessionStorage;
});

test("protected calls are blocked until a verified session supplies CSRF", async () => {
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return reply({ success: true });
  };
  await assert.rejects(
    api.resellerApi("quote", { kind: "rental", quantity: 1 }),
    (error) => error.code === "SESSION_REQUIRED",
  );
  assert.equal(calls, 0);
});
test("POST cookie contract, CSRF capture and rotation apply to subsequent requests", async () => {
  const requests = [];
  globalThis.fetch = async (url, options) => {
    requests.push({ url, ...options });
    return reply({
      success: true,
      ...(url.endsWith("/me")
        ? { csrfToken: "initial" }
        : url.endsWith("/password")
          ? { csrfToken: "rotated" }
          : {}),
    });
  };
  await api.resellerApi("me", {});
  await api.resellerApi("password", {
    code: "123456",
    password: "NewPassword123",
  });
  await api.resellerApi("sessions", {});
  assert.equal(requests[0].headers["X-Reseller-CSRF"], undefined);
  assert.equal(requests[1].headers["X-Reseller-CSRF"], "initial");
  assert.equal(requests[2].headers["X-Reseller-CSRF"], "rotated");
  for (const request of requests) {
    assert.equal(request.method, "POST");
    assert.equal(request.credentials, "include");
    assert.equal(request.cache, "no-store");
    assert.match(
      request.url,
      /^https:\/\/api2\.arepatool\.com\/api\/reseller\//,
    );
  }
});
test("wrong one-time code does not clear the authenticated session or emit expiry", async () => {
  let eventCount = 0;
  let calls = 0;
  globalThis.window = {
    dispatchEvent() {
      eventCount++;
    },
  };
  globalThis.fetch = async (_, options) => {
    calls++;
    if (calls === 1) return reply({ success: true, csrfToken: "session" });
    if (calls === 2)
      return reply(
        {
          success: false,
          code: "INVALID_OTP",
          error: "Wait for a fresh code.",
        },
        401,
      );
    assert.equal(options.headers["X-Reseller-CSRF"], "session");
    return reply({ success: true });
  };
  await api.resellerApi("me", {});
  await assert.rejects(
    api.resellerApi("api/key", { code: "123456" }),
    (error) => error.code === "INVALID_OTP",
  );
  await api.resellerApi("sessions", {});
  assert.equal(eventCount, 0);
});
test("transport failure never retries and the caller can retry the identical quote ID", async () => {
  let calls = 0;
  const ids = [];
  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/me"))
      return reply({ success: true, csrfToken: "session" });
    calls++;
    ids.push(JSON.parse(options.body).quoteId);
    if (calls === 1) throw new TypeError("Connection lost after server commit");
    return reply({
      success: true,
      order: { referenceId: "existing-order", replayed: true },
    });
  };
  await api.resellerApi("me", {});
  await assert.rejects(
    api.resellerApi("confirm", { quoteId: "original-quote" }),
    (error) => error.uncertain,
  );
  assert.equal(calls, 1);
  const result = await api.resellerApi("confirm", {
    quoteId: "original-quote",
  });
  assert.equal(result.order.referenceId, "existing-order");
  assert.deepEqual(ids, ["original-quote", "original-quote"]);
});
test("invalid JSON and server failures have an uncertain outcome, never an automatic retry", async () => {
  globalThis.fetch = async () => reply({ success: true, csrfToken: "session" });
  await api.resellerApi("me", {});
  let count = 0;
  globalThis.fetch = async () => {
    count++;
    return new Response("<html>gateway</html>", { status: 502 });
  };
  await assert.rejects(
    api.resellerApi("confirm", { quoteId: "q1" }),
    (error) => error.uncertain && error.code === "INVALID_RESPONSE",
  );
  assert.equal(count, 1);
});
test("only opaque pending quote IDs are persisted and isolated by reseller", () => {
  const storage = new Map();
  globalThis.sessionStorage = {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => storage.set(key, value),
    removeItem: (key) => storage.delete(key),
  };
  pending.rememberPendingOrder("reseller-A", "quote-A");
  pending.rememberPendingOrder("reseller-B", "quote-B");
  assert.equal(pending.readPendingOrder("reseller-A"), "quote-A");
  assert.deepEqual([...storage.values()], ["quote-A", "quote-B"]);
  pending.forgetPendingOrder("reseller-A");
  assert.equal(pending.readPendingOrder("reseller-A"), undefined);
  assert.equal(pending.readPendingOrder("reseller-B"), "quote-B");
  pending.forgetPendingOrder("reseller-B");
});
test("storage restrictions retain an in-memory retry handle", () => {
  globalThis.sessionStorage = {
    getItem() {
      throw new Error();
    },
    setItem() {
      throw new Error();
    },
    removeItem() {
      throw new Error();
    },
  };
  pending.rememberPendingOrder("blocked-storage", "q1");
  assert.equal(pending.readPendingOrder("blocked-storage"), "q1");
  pending.forgetPendingOrder("blocked-storage");
});
test("Portuguese locale uses the backend pt-br value and all languages render financial values safely", () => {
  assert.equal(i18n.normalizeLanguage("pt"), "pt-br");
  assert.equal(i18n.normalizeLanguage("pt-BR"), "pt-br");
  for (const language of ["es", "en", "pt-br"]) {
    assert.ok(i18n.translator(language)("orders"));
    assert.notEqual(i18n.money("125.30", language), "—");
    assert.equal(i18n.money(null, language), "—");
  }
});
const reportDates = await load("../report-dates.ts");
test("report defaults use the current Peru month instead of claiming all-time totals", () => {
  assert.deepEqual(
    reportDates.defaultReportDates(new Date("2026-12-01T02:00:00Z")),
    { from: "2026-11-01", to: "2026-11-30" },
  );
});
test("report ranges reject invalid calendar days, reversed dates and overlong periods", () => {
  assert.equal(
    reportDates.validateReportDates({ from: "2026-02-30", to: "2026-03-01" }),
    "invalidDates",
  );
  assert.equal(
    reportDates.validateReportDates({ from: "2026-11-27", to: "2026-11-26" }),
    "invalidDates",
  );
  assert.equal(
    reportDates.validateReportDates({ from: "2020-01-01", to: "2026-11-27" }),
    "dateRangeLimit",
  );
  assert.equal(
    reportDates.validateReportDates({ from: "2024-02-29", to: "2024-03-01" }),
    undefined,
  );
});

test("unapproved Telegram enrollment remains blocked and supplies localized admin guidance", async () => {
  globalThis.fetch = async () =>
    reply(
      {
        success: false,
        code: "ENROLLMENT_UNAVAILABLE",
        error: "Contacta al administrador.",
      },
      409,
    );
  await assert.rejects(
    api.resellerApi("login", { username: "preview", password: "preview-only" }),
    (error) => error.code === "ENROLLMENT_UNAVAILABLE",
  );
  await assert.rejects(
    api.resellerApi("quote", { kind: "rental", quantity: 1 }),
    (error) => error.code === "SESSION_REQUIRED",
  );
  for (const language of ["es", "en", "pt-br"])
    assert.match(
      i18n.translator(language)("enrollmentApprovalRequired"),
      /Telegram/,
    );
});
