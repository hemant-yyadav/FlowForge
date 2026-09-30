"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("db");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("@repo/backend-common/config");
async function run() {
    // Clean up
    await db_1.prismaClient.user.deleteMany({ where: { username: { startsWith: "testuser_" } } });
    // Create User A
    const userA = await db_1.prismaClient.user.create({ data: { username: "testuser_A", name: "A" } });
    // Create Workspace for User A
    await db_1.prismaClient.workspace.create({ data: { name: "Workspace A", ownerId: userA.id } });
    // Create User B
    const userB = await db_1.prismaClient.user.create({ data: { username: "testuser_B", name: "B" } });
    // Fetch for User B using the exact logic from controller
    const workspacesB = await db_1.prismaClient.workspace.findMany({
        where: {
            OR: [
                { ownerId: userB.id },
                { members: { some: { userId: userB.id } } }
            ]
        }
    });
    console.log("Workspaces for User B:", workspacesB);
    // Test through HTTP as well to be sure
    const tokenB = jsonwebtoken_1.default.sign({ userId: userB.id }, config_1.JWT_SECRET);
    const res = await fetch("http://localhost:3001/api/v1/workspaces", { headers: { Authorization: `Bearer ${tokenB}` } });
    console.log("HTTP Workspaces for User B:", await res.json());
}
run().catch(console.error).finally(() => process.exit(0));
