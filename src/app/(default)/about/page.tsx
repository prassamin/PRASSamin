import React from "react";
import { unstable_cache } from "next/cache";
import { metatag } from "@/lib/metatag";
import { HeroSection } from "./components/hero";
import { AboutRetro } from "./components/retro";
import { AboutExperience } from "./components/experience";
import { AboutEducation } from "./components/education";
import { getBlogs } from "@/lib/get-blogs";
import { db } from "@/lib/db";
import { EXPERIENCESERIALIZER, EDUCATIONSERIALIZER } from "@/lib/serializers";
import Image from "next/image";

const getExperiences = unstable_cache(
  async () => {
    const records = await db.experience.findMany({
      orderBy: [{ start: "desc" }],
    });
    return EXPERIENCESERIALIZER(records) || [];
  },
  ["about-experiences"],
  { revalidate: 300 },
);

const getEducations = unstable_cache(
  async () => {
    const records = await db.education.findMany({
      orderBy: [{ start: "desc" }],
    });
    return EDUCATIONSERIALIZER(records) || [];
  },
  ["about-educations"],
  { revalidate: 300 },
);

const getBlogsForAbout = unstable_cache(
  async () => getBlogs({ limit: "all", sortBy: "created_at" }),
  ["about-blogs"],
  { revalidate: 300 },
);

const AboutPage = async () => {
  const blogs = await getBlogsForAbout();

  const retros = blogs.blogs.flatMap((blog) => {
    const tags = blog.tags?.map((tag) => tag.toLowerCase()) ?? [];
    const year = tags.find((tag) => /^\d{4}$/.test(tag));
    return tags.includes("retro") && year ? [{ ...blog, year }] : [];
  });

  const experiences = await getExperiences();
  const educations = await getEducations();

  return (
    <main className="fade-in-start relative min-h-screen flex flex-col items-center">
      {/* Background Texture */}
      <div
        className="absolute inset-0 overflow-hidden h-112.5 bg-neutral-950"
        style={{
          maskImage: "linear-gradient(rgb(0, 0, 0) 80%, rgba(0, 0, 0, 0) 100%)",
        }}
      >
        <div
          aria-hidden="true"
          className="h-100 w-162.5 rounded-full bg-linear-to-r from-[#2E996C]/30 to-[#0F3324]/30 blur-[150px] absolute top-0 -translate-y-full rotate-45 origin-left z-[-2] left-[15%]"
        ></div>
        <Image
          src="/assets/crumpled-paper.webp"
          alt="crumpled paper texture"
          width={1280}
          height={825}
          className="pointer-events-none select-none absolute w-full inset-0 h-112.5 object-cover z-[-1] opacity-40 mix-blend-overlay"
        />
      </div>

      <HeroSection />
      <AboutRetro retros={retros} />
      <AboutExperience experiences={experiences} />
      <AboutEducation educations={educations} />
    </main>
  );
};

export default AboutPage;

export const generateMetadata = () => {
  return metatag({
    title: "About",
    robots: "index, follow",
  });
};
