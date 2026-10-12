import { BASE_URL } from "@/constants/env";
import { Metadata } from "next";
import { headers } from "next/headers";

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
  const headersList = await headers();
  const url = headersList.get("x-current-url");
  const fav = image || `${BASE_URL}/favicons/favicon-512x512-maskable.png`;

  const fixedKeywords = [
    "pras",
    "pras samin",
    "pras samin portfolio",
    "portfolio",
  ];

  const margedkeywords = fixedKeywords.concat(keywords);

  const m: Metadata = {
    title: title,
    keywords: margedkeywords,
    openGraph: {
      title: title,
      url: url!,
      siteName: title,
      images: [
        {
          url: fav,
        },
      ],
      locale: "en-US",
      type: "website",
    },
    twitter: {
      title: title,
      creator: "@prassamin78",
      images: fav,
      card: "summary_large_image",
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
