import { GITHUB_API_KEY } from "@/constants/env";

export interface GithubOwner {
  login: string;
  id: number;
  node_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  type: string;
}

/** Public, safe-to-expose subset of the owner — never includes ids/secrets. */
export interface GithubOwnerPublic {
  username: string;
  name: string | null;
  bio: string | null;
  email: string | null;
  avatar_url: string;
}

/** Slice a full owner into its public fields. */
export function toPublicOwner(owner: GithubOwner | undefined | null): GithubOwnerPublic | null {
  if (!owner) return null;
  return {
    username: owner.login,
    name: owner.name,
    bio: owner.bio,
    email: owner.email,
    avatar_url: owner.avatar_url,
  };
}

export interface GithubOwnerResult {
  success: boolean;
  owner?: GithubOwner;
  error?: string;
  status?: number;
}

/**
 * Identify the account that owns a GitHub token by calling GET /user.
 * Pass a token explicitly to override the default `NEXT_GITHUB_API_KEY`.
 */
export async function getOwner(token?: string): Promise<GithubOwnerResult> {
  const resolvedToken = token || GITHUB_API_KEY;

  if (!resolvedToken) {
    return {
      success: false,
      error: "GitHub token is missing (NEXT_GITHUB_API_KEY)",
    };
  }

  try {
    const res = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${resolvedToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "pras-portfolio",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return {
        success: false,
        error: `GitHub API responded ${res.status}: ${await res.text()}`,
        status: res.status,
      };
    }

    const user = (await res.json()) as GithubOwner;

    return { success: true, owner: user };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to fetch GitHub token owner",
    };
  }
}

/**
 * Convenience check: does this GitHub user id match the token owner?
 */
export async function isTokenOwner(
  githubUserId: number | string,
  token?: string,
): Promise<boolean> {
  const { success, owner } = await getOwner(token);
  return success && owner?.id === Number(githubUserId);
}

/* ------------------------------------------------------------------ */
/* In-memory cache (per server instance)                               */
/* ------------------------------------------------------------------ */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

let cachedOwner: { result: GithubOwnerResult; at: number } | null = null;

/**
 * Like `getOwner`, but memoized in memory for `ttlMs` so repeated renders
 * don't hit the GitHub API every time. Clears itself after TTL.
 */
export async function getOwnerCached(
  ttlMs: number = CACHE_TTL_MS,
  token?: string,
): Promise<GithubOwnerResult> {
  const now = Date.now();

  if (cachedOwner && now - cachedOwner.at < ttlMs) {
    return cachedOwner.result;
  }

  const result = await getOwner(token);
  cachedOwner = { result, at: now };
  return result;
}

/** Drop the in-memory cache (e.g. after token rotation). */
export function clearOwnerCache() {
  cachedOwner = null;
}
