import { NextResponse, NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/config";

export async function POST(request: NextRequest) {
  const { redirect } = await request.json();
  const response = NextResponse.redirect(new URL(redirect || "/", request.url));
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
