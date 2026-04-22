import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";

import { getUserByEmail, createUser } from "@/lib/data";

const signupSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  try {
    const body = signupSchema.parse(await request.json());

    const existingUser = await getUserByEmail(body.email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    const passwordHash = await hash(body.password, 12);

    const user = await createUser({
      name: body.name,
      email: body.email,
      passwordHash,
    });

    return NextResponse.json({
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid input." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Could not create account." },
      { status: 500 },
    );
  }
}
