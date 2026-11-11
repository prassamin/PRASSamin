import type { NextConfig } from "next";
import { createMDX } from "fumadocs-mdx/next";
import { withFrontmatter } from "./plugins/frontmatter";

const withMDX = createMDX();
const withFM = withFrontmatter({
  dir: ["content/**/*"],
  frequency: 10,
});

const nextConfig: NextConfig = {
  // Ensure MDX content files are included in serverless function bundles
  // (Fumadocs reads them lazily at runtime).
  outputFileTracingIncludes: {
    "/**": ["./content/**"],
  },
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: "/blogs",
      },
      {
        source: "/blog/:path*",
        destination: "/blogs/:path*",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default withFM(withMDX(nextConfig));
