import {
  AUTH_PRIVATE_KEY,
  GITHUB_AUTH_CLIENT_ID,
  GITHUB_AUTH_CLIENT_SECRET,
  NODE_ENV,
} from "@/constants/env";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { SESSION_COOKIE_NAME } from "@/constants";
import axios from "axios";
import { isTokenOwner } from "@/lib/github";

const TOKEN_URL = "https://github.com/login/oauth/access_token";
const USER_URL = "https://api.github.com/user";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Exchange code for access token
  const { data: tbody } = await axios.post(
    TOKEN_URL,
    {},
    {
      headers: { Accept: "application/json" },
      params: {
        client_id: GITHUB_AUTH_CLIENT_ID,
        client_secret: GITHUB_AUTH_CLIENT_SECRET,
        code,
      },
    }
  );

  if (!tbody?.access_token) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Get user info
  const { data: rawUser } = await axios.get(USER_URL, {
    headers: {
      Authorization: `Bearer ${tbody.access_token}`,
      Accept: "application/vnd.github+json",
    },
  });

  // Gate: only the account that owns this deployment's GitHub token may sign in.
  if (!rawUser?.id || !(await isTokenOwner(rawUser.id))) {
    return NextResponse.json({ message: "You are not authorized" }, { status: 401 });
  }

  const user = {
    id: rawUser?.id,
    username: rawUser?.login,
    avatar_url: rawUser?.avatar_url,
    name: rawUser?.name,
    email: rawUser?.email || "",
    bio: rawUser?.bio,
    role: "ADMIN",
  };

  const response = NextResponse.json(
    { message: "User signed in successfully" },
    { status: 200 }
  );

  const token = jwt.sign(user, AUTH_PRIVATE_KEY, {
    expiresIn: "7d",
    algorithm: "RS256",
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
