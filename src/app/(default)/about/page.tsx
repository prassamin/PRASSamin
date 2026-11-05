import React from "react";
import { metatag } from "@/lib/metatag";
import { HeroSection } from "./components/hero";
import { AboutRetro } from "./components/retro";
import { AboutExperience } from "./components/experience";
import { AboutEducation } from "./components/education";
import { getBlogs } from "@/lib/get-blogs";
import { db } from "@/lib/db";
import { EXPERIENCESERIALIZER, EDUCATIONSERIALIZER } from "@/lib/serializers";
import Image from "next/image";

const AboutPage = async () => {
  const blogs = await getBlogs({ limit: "all", sortBy: "created_at" });

  // Same retro derivation as the home page: "retro" tag + a year tag.
  const retros = blogs.blogs.flatMap((blog) => {
    const tags = blog.tags?.map((tag) => tag.toLowerCase()) ?? [];
    const year = tags.find((tag) => /^\d{4}$/.test(tag));
    return tags.includes("retro") && year ? [{ ...blog, year }] : [];
  });

  const experienceRecords = await db.experience.findMany({
    orderBy: [{ start: "desc" }],
  });
  const experiences = EXPERIENCESERIALIZER(experienceRecords) || [];

  const educationRecords = await db.education.findMany({
    orderBy: [{ start: "desc" }],
  });
  const educations = EDUCATIONSERIALIZER(educationRecords) || [];

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
    title: "About | PRAS",
    robots: "index, follow",
  });
};
