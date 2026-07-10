import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Liveness check for uptime monitoring — deliberately has no dependencies. */
export function GET() {
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() });
}
