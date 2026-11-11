import { pathToRegexp as pathToRegexpBase } from "./path-to-regexp";

const pathToRegexp = (path: string) => {
  try {
    return pathToRegexpBase(path);
  } catch (e: any) {
    throw new Error(
      `Invalid path: ${path}.\nConsult the documentation of path-to-regexp here: https://github.com/pillarjs/path-to-regexp/tree/6.x\n${e.message}`,
    );
  }
};
type Autocomplete<U extends T, T = string> = U | (T & Record<never, never>);

/**
 * @deprecated Prefer {@link WithPathSegmentWildcard}; `(.*)` also matches sibling routes
 * (e.g. `/dashboard(.*)` matches `/dashboardxyz`).
 */

type StripTrailingSlash<T extends string> = T extends "/"
  ? T
  : T extends `${infer Prefix}/`
    ? StripTrailingSlash<Prefix>
    : T;

/**
 * Suggests the `:path*` subtree form (e.g. `/dashboard/:path*`), which matches on
 * path-segment boundaries. `/` is special-cased to `/:path*` to avoid a malformed `//:path*`.
 *
 * @deprecated Will be removed in the next major version together with {@link createPathMatcher}.
 */
type WithPathSegmentWildcard<T = string> = T extends "/"
  ? "/:path*"
  : `${StripTrailingSlash<T & string>}/:path*`;
/**
 * @deprecated Will be removed in the next major version together with {@link createPathMatcher}.
 */
type PathPattern = Autocomplete<WithPathSegmentWildcard>;

type PathMatcherParam = Array<RegExp | PathPattern> | RegExp | PathPattern;

class MalformedURLError extends Error {
  public readonly statusCode = 400;

  constructor(pathname: string, cause?: unknown) {
    super(`Malformed encoding in URL path: ${pathname}`);
    this.name = "MalformedURLError";
    this.cause = cause;
  }
}

const precomputePathRegex = (patterns: Array<string | RegExp>) => {
  return patterns.map((pattern) =>
    pattern instanceof RegExp ? pattern : pathToRegexp(pattern),
  );
};

/**
 * Normalizes a URL path for safe route matching.
 *
 * 1. Decodes percent-encoded unreserved characters using decodeURI (not
 *    decodeURIComponent) so path-reserved delimiters like %2F, %3F, %23
 *    are preserved — matching how framework routers interpret paths.
 * 2. Collapses consecutive slashes (e.g. //api/v1/admin → /api/v1/admin) to
 *    prevent bypass via extra slashes.
 *
 * @throws {MalformedURLError} if the path contains invalid percent-encoding
 */
const normalizePath = (pathname: string): string => {
  try {
    pathname = decodeURI(pathname);
  } catch (e) {
    throw new MalformedURLError(pathname, e);
  }
  return pathname.replace(/\/\/+/g, "/");
};

/**
 * Creates a function that matches paths against a set of patterns.
 *
 * @param patterns - A string, RegExp, or array of patterns to match against
 * @returns A function that takes a pathname and returns true if it matches any of the patterns
 */
export const createRouteMatcher = (patterns: PathMatcherParam) => {
  const routePatterns = [patterns || ""].flat().filter(Boolean);
  const matchers = precomputePathRegex(routePatterns);
  return (
    request: { nextUrl?: { pathname: string }; url?: string } | string,
  ): boolean => {
    let pathname: string;
    if (typeof request === "string") {
      if (request.startsWith("http") || request.startsWith("https")) {
        pathname = new URL(request).pathname;
      } else {
        pathname = request;
      }
    } else if (
      request &&
      request.nextUrl &&
      typeof request.nextUrl.pathname === "string"
    ) {
      pathname = request.nextUrl.pathname;
    } else if (request && request.url) {
      try {
        pathname = new URL(request.url).pathname;
      } catch {
        pathname = String(request.url);
      }
    } else {
      pathname = "";
    }
    return matchers.some((matcher) => matcher.test(normalizePath(pathname)));
  };
};
