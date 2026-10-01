import "./globals.css";
import { poppins, rethinkSans, inter } from "@/constants/fonts";
import { Metadata } from "next";
import { RootProviders } from "@/providers/RootProviders";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

const title = "PRAS";
const description =
  "PRAS Samin - a curious developer who’s always building, learning, and exploring what’s possible with code.";

export const metadata: Metadata = {
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
  title: title,
  description: description,
  openGraph: {
    title: title,
    description: description,
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    creator: "@imprassamin",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      className="overflow-x-hidden dark"
      lang="en"
      suppressHydrationWarning={true}
    >
      <body
        className={`${poppins.className} ${rethinkSans.variable} ${inter.variable} antialiased overflow-x-hidden`}
      >
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
