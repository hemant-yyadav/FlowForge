import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { getHttpBackendUrl } from "@repo/backend-common/config";
import { getNextAuthSecret } from "../../../../lib/server-auth";

export const runtime = "nodejs";
const PUBLIC_BACKEND_PATHS = new Set(["signup"]);
const METHODS = new Set(["GET", "POST", "PUT", "PATCH", "DELETE"]);

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    if (!METHODS.has(request.method)) return NextResponse.json({ message: "Method not allowed" }, { status: 405 });
    const { path } = await context.params;
    if (!path.length || path.some((part) => !part || part === "." || part === "..")) return NextResponse.json({ message: "Invalid backend path" }, { status: 400 });
    const isPublic = path.length === 1 && PUBLIC_BACKEND_PATHS.has(path[0]!);
    const sessionToken = await getToken({ req: request, secret: getNextAuthSecret() });
    const accessToken = typeof sessionToken?.backendAccessToken === "string" ? sessionToken.backendAccessToken : null;
    if (!isPublic && !accessToken) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const target = new URL(path.map(encodeURIComponent).join("/"), `${getHttpBackendUrl()}/`);
    target.search = request.nextUrl.search;
    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
    try {
        const response = await fetch(target, { method: request.method, headers, body: request.method === "GET" || request.method === "DELETE" ? undefined : await request.arrayBuffer(), cache: "no-store" });
        const responseHeaders = new Headers();
        const responseContentType = response.headers.get("content-type");
        if (responseContentType) responseHeaders.set("content-type", responseContentType);
        return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
    } catch { return NextResponse.json({ message: "Backend service is unavailable" }, { status: 502 }); }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
