import assert from "node:assert/strict";
import test from "node:test";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-validation";
process.env.OAUTH_BACKEND_SHARED_SECRET = "test-oauth-secret-that-is-long-enough-for-validation";
process.env.WS_TICKET_SECRET = "test-ws-ticket-secret-that-is-long-enough-for-validation";
process.env.ALLOWED_ORIGINS = "http://localhost:3000";

const auth = await import("../dist/auth.js");
const config = await import("../dist/config.js");

test("missing JWT secret is rejected", () => {
    const original = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    assert.throws(() => config.getJwtSecret(), /JWT_SECRET/);
    process.env.JWT_SECRET = original;
});

test("expired and tampered access tokens are rejected", () => {
    const expired = jwt.sign({ userId: "user-1" }, process.env.JWT_SECRET, { expiresIn: -1 });
    const valid = auth.signAccessToken("user-1");
    const tampered = `${valid.slice(0, -1)}${valid.endsWith("a") ? "b" : "a"}`;
    assert.equal(auth.checkUser(expired), null);
    assert.equal(auth.checkUser(tampered), null);
});

test("forged OAuth assertions cannot establish an identity", () => {
    const forged = jwt.sign(
        { provider: "google", providerId: "victim-provider-id", email: "victim@example.test" },
        "attacker-controlled-secret-that-is-long-enough",
        { issuer: "flowforge-nextauth", audience: "flowforge-http-backend" },
    );
    assert.equal(auth.verifyOAuthAssertion(forged), null);
});

test("OAuth assertions are short-lived, signed, and provider-restricted", () => {
    const valid = auth.createOAuthAssertion({ provider: "github", providerId: "123", email: null, name: "Test" });
    assert.deepEqual(auth.verifyOAuthAssertion(valid), { provider: "github", providerId: "123", email: null, name: "Test" });
});

test("WebSocket tickets reject expired, malformed, wrong-audience, and backend access tokens", () => {
    const ticket = auth.createWebSocketTicket("user-1");
    assert.equal(auth.verifyWebSocketTicket(ticket)?.userId, "user-1");
    const expired = jwt.sign({ userId: "user-1", ticketId: "ticket-1" }, process.env.WS_TICKET_SECRET, {
        expiresIn: -1, audience: "websocket", issuer: "flowforge-nextauth",
    });
    const wrongAudience = jwt.sign({ userId: "user-1", ticketId: "ticket-1" }, process.env.WS_TICKET_SECRET, {
        expiresIn: 60, audience: "not-websocket", issuer: "flowforge-nextauth",
    });
    assert.equal(auth.verifyWebSocketTicket(expired), null);
    assert.equal(auth.verifyWebSocketTicket(wrongAudience), null);
    assert.equal(auth.verifyWebSocketTicket("malformed"), null);
    assert.equal(auth.verifyWebSocketTicket(auth.signAccessToken("user-1")), null);
});

test("origin configuration rejects absent and malformed origins", () => {
    const original = process.env.ALLOWED_ORIGINS;
    delete process.env.ALLOWED_ORIGINS;
    assert.throws(() => config.getAllowedOrigins(), /ALLOWED_ORIGINS/);
    process.env.ALLOWED_ORIGINS = "not-an-origin";
    assert.throws(() => config.getAllowedOrigins(), /ALLOWED_ORIGINS/);
    process.env.ALLOWED_ORIGINS = original;
});

test("WebSocket origin policy rejects unconfigured origins", () => {
    assert.equal(config.isAllowedOrigin("http://localhost:3000"), true);
    assert.equal(config.isAllowedOrigin("https://attacker.example"), false);
    assert.equal(config.isAllowedOrigin(undefined), false);
});

test("multiple origins and a non-local backend URL are supported", () => {
    const originalOrigins = process.env.ALLOWED_ORIGINS;
    const originalBackendUrl = process.env.HTTP_BACKEND_URL;
    process.env.ALLOWED_ORIGINS = "https://app.example.test, https://admin.example.test";
    process.env.HTTP_BACKEND_URL = "https://api.example.test/";

    assert.deepEqual(config.getAllowedOrigins(), ["https://app.example.test", "https://admin.example.test"]);
    assert.equal(config.isAllowedOrigin("https://admin.example.test"), true);
    assert.equal(config.isAllowedOrigin("https://attacker.example.test"), false);
    assert.equal(config.getHttpBackendUrl(), "https://api.example.test");

    process.env.ALLOWED_ORIGINS = originalOrigins;
    process.env.HTTP_BACKEND_URL = originalBackendUrl;
});

test("invalid configured backend URLs fail clearly", () => {
    const original = process.env.HTTP_BACKEND_URL;
    process.env.HTTP_BACKEND_URL = "not-a-url";
    assert.throws(() => config.getHttpBackendUrl(), /HTTP_BACKEND_URL/);
    process.env.HTTP_BACKEND_URL = original;
});
