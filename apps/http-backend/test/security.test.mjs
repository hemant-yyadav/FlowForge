import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-validation";
process.env.OAUTH_BACKEND_SHARED_SECRET = "test-oauth-secret-that-is-long-enough-for-validation";

const { oauthSignin } = await import("../dist/controllers/auth.controller.js");

test("forged POST /oauth is rejected before any database lookup", async () => {
    let statusCode = 200;
    let body;
    const response = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(value) {
            body = value;
            return this;
        },
    };

    await oauthSignin({ body: { provider: "google", providerId: "victim" } }, response);
    assert.equal(statusCode, 401);
    assert.deepEqual(body, { message: "Invalid OAuth assertion" });
});
