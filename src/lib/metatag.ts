import { Metadata } from "next";
import { getCurrentUrl } from "./url";

export const metatag = async ({
  title,
  robots = "index, follow",
  keywords = [],
  image,
  description,
}: {
  title: string;
  robots?: string;
  keywords?: string[];
  image?: string;
  description?: string;
}) => {
  const url = new URL(await getCurrentUrl());
  const thumbnail = image || `${url.origin}/favicons/favicon-512x512-maskable.png`;

  const fixedKeywords = [
    "pras",
    "pras samin",
    "pras samin portfolio",
    "portfolio",
  ];

  const margedkeywords: string[] = fixedKeywords.concat(keywords);

  const m: Metadata = {
    title: title,
    keywords: margedkeywords,
    openGraph: {
      title: title,
      url: url,
      siteName: title,
      images: [
        {
          url: thumbnail,
          width: 1200,
          height: 630,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      title: title,
      images: [thumbnail],
    },
    alternates: {
      canonical: url,
      languages: { "en-US": url },
    },
    robots: robots,
  };

  if (description) {
    m.description = description;
    m.twitter!.description = description;
    m.openGraph!.description = description;
  }
  return m;
};