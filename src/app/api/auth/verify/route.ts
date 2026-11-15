import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AUTH_PUBLIC_KEY } from "@/config/env";
import { SESSION_COOKIE_NAME } from "@/config";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const decodedToken = jwt.verify(token, AUTH_PUBLIC_KEY);
    return NextResponse.json({ success: true, value: decodedToken });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
