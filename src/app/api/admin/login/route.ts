import { NextResponse } from "next/server";

import { setAdminSessionCookie } from "@/lib/auth";
import { getEnv } from "@/lib/env";
import { safeCompare } from "@/lib/utils";
import { loginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = loginSchema.parse(await request.json());

    if (!safeCompare(body.password, getEnv().ADMIN_PASSWORD)) {
      return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
    }

    await setAdminSessionCookie();

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not sign in." }, { status: 400 });
  }
}
