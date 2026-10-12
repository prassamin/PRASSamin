import { NextRequest } from "next/server";

export function createRouteMatcher(patterns: string[]) {
  const regexPatterns = patterns.map(
    (pattern) => new RegExp(`^${pattern.replace(/\*/g, "*")}$`)
  );
  return (request: NextRequest) => {
    const url = new URL(request.url);
    return regexPatterns.some((regex) => regex.test(url.pathname));
  };
}
