import { NextResponse } from "next/server";

import { clearAdminSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  await clearAdminSessionCookie();

  const url = new URL("/admin/login", request.url);
  return NextResponse.redirect(url, 303);
}
