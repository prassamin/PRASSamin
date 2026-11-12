import "./globals.css";
import { poppins, rethinkSans, inter } from "@/constants/fonts";
import { Metadata } from "next";
import { RootProviders } from "@/providers/root-providers";
import { getOwnerCached, toPublicOwner } from "@/lib/github";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export const generateMetadata = async (): Promise<Metadata> => {
  const title = "PRAS";
  const description =
    "PRAS Samin - a curious developer who’s always building, learning, and exploring what’s possible with code.";
  return {
    title: title,
    description: description,
    keywords: ["pras", "pras samin", "pras samin portfolio", "portfolio"],
    publisher: "PRAS",
    creator: "PRAS",
    authors: [
      {
        name: "PRAS",
        url: "https://pras.me",
      },
    ],
    appleWebApp: {
      title: "PRAS",
    },
    icons: {
      icon: [
        { url: "/favicons/favicon-96x96.png", sizes: "96x96" },
        { url: "/favicons/favicon-192x192.png", sizes: "192x192" },
        { url: "/favicons/favicon-512x512.png", sizes: "512x512" },
        { url: "/favicons/favicon.svg" },
      ],
      shortcut: ["/favicons/favicon.svg"],
      apple: [
        {
          url: "/favicons/favicon-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
      ],
    },
    manifest: "/favicons/site.webmanifest",
    openGraph: {
      title: title,
      description: description,
      type: "website",
      siteName: "PRAS",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
    },
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Resolve the GitHub token owner once (cached in memory) and expose only
  // its PUBLIC fields to the app (no ids/secrets) for UI visualization.
  const ownerResult = await getOwnerCached();
  const owner = toPublicOwner(ownerResult.owner);

  return (
    <html
      className="dark overflow-x-clip"
      lang="en"
      suppressHydrationWarning={true}
    >
      <body
        className={`${poppins.className} ${rethinkSans.variable} ${inter.variable} antialiased overflow-x-clip`}
      >
        <RootProviders initialOwner={owner}>{children}</RootProviders>
      </body>
    </html>
  );
}
