import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { createWebSocketTicket } from "@repo/backend-common/auth";
import { getNextAuthSecret } from "../../../lib/server-auth";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
    const token = await getToken({ req: request, secret: getNextAuthSecret() });
    const userId = typeof token?.backendUserId === "string" ? token.backendUserId : null;
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ ticket: createWebSocketTicket(userId) }, { headers: { "Cache-Control": "no-store" } });
}
