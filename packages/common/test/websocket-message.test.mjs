import assert from "node:assert/strict";
import test from "node:test";

const { WebSocketInboundMessageSchema } = await import("../dist/types.js");

test("validates authenticated room messages", () => {
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "authenticate", token: "token" }).success, true);
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "join_room", roomId: "room_1" }).success, true);
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "chat", roomId: "room_1", message: "hello" }).success, true);
});

test("rejects malformed or unauthorized protocol shapes", () => {
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "unknown", roomId: "room_1" }).success, false);
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "join_room", roomId: "../private" }).success, false);
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "cursor", roomId: "room_1", x: Infinity, y: 0 }).success, false);
});

test("rejects oversized chat and drawing payloads", () => {
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "chat", roomId: "room_1", message: "x".repeat(2_001) }).success, false);
    assert.equal(WebSocketInboundMessageSchema.safeParse({ type: "draw", roomId: "room_1", shape: { type: "line", data: "x".repeat(16_000) } }).success, false);
});
