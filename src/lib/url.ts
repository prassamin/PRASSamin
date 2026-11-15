import { CURRENT_URL_HEADER, ORIGIN_HEADER } from "@/config";
import { headers } from "next/headers";

/**
 * Returns the origin of the request.
 * @serverOnly
 */
export const getOrigin = async (): Promise<string> => {
  const headersList = await headers();
  let origin = headersList.get(ORIGIN_HEADER);
  if (!origin) {
    const hostHeader =
      headersList.get("x-forwarded-host") ?? headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") ?? "http";
    origin = `${proto}://${hostHeader}`;
  }
  return origin;
};

/**
 * Returns the current URL of the request.
 * @serverOnly
 */
export const getCurrentUrl = async (): Promise<string> => {
  const headersList = await headers();
  let currentUrl = headersList.get(CURRENT_URL_HEADER);
  if (!currentUrl) {
    const origin = await getOrigin();
    const path = headersList.get("x-current-path") ?? "";
    currentUrl = `${origin}${path}`;
  }
  return currentUrl;
};
