import { NextResponse } from "next/server";

// Legacy admin login route - redirects to Auth.js flow
// Auth is now handled by /api/auth/[...nextauth] and /login page

export async function POST() {
  return NextResponse.json(
    { error: "This login endpoint has been deprecated. Please use /login instead." },
    { status: 410 },
  );
}
