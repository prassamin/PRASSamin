import "./globals.css";
import { poppins, rethinkSans, inter } from "@/constants/fonts";
import { Metadata } from "next";
import { RootProviders } from "@/providers/root-providers";
import { getOwnerCached, toPublicOwner } from "@/lib/github";
import { APP_NAME, CREATOR, CREATOR_LINK, META_DESCRIPTION, PUBLISHER } from "@/constants";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
    description: META_DESCRIPTION,
    keywords: ["pras", "pras samin", "pras samin portfolio", "portfolio"],
    publisher: PUBLISHER,
    creator: CREATOR,
    authors: [
      {
        name: CREATOR,
        url: CREATOR_LINK,
      },
    ],
    appleWebApp: {
      title: APP_NAME,
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
      title: APP_NAME,
      description: META_DESCRIPTION,
      type: "website",
      siteName: APP_NAME,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: APP_NAME,
      description: META_DESCRIPTION,
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
