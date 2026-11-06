import { getOrigin } from "@/lib/url";
import type { MetadataRoute } from "next";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await getOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/"],
    },
    host: origin,
    sitemap: `${origin}/sitemap.xml`,
  };
}
