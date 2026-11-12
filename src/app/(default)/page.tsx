import { getBlogs } from "@/lib/get-blogs";
import HomeView from "./home/view";
import { getProjects } from "@/lib/get-projects";
import { metatag } from "@/lib/metatag";
import { cache } from "react";
import { db } from "@/lib/db";
import { TestimonialType } from "@/types";
import { notFound } from "next/navigation";

const getTestimonials = cache(async (): Promise<TestimonialType[]> => {
  try {
    const list = await db.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return list.map((item) => ({
      ...item,
      category: item.category as TestimonialType["category"],
    }));
  } catch (error) {
    console.error("Failed to load testimonials:", error);
    return [];
  }
});

export default async function Home() {
  const projects = await getProjects({
    page: 1,
    limit: 2,
    sortBy: "created_at",
  });

  const blogs = await getBlogs({
    page: 1,
    limit: "all",
    sortBy: "created_at",
  });

  const testimonials = await getTestimonials();

  // Blogs linked from the mental model cards, resolved by their slugs.
  const mentalModels = {
    concurrency: blogs.blogs.find((blog) => blog.slug === "concurrency"),
    cacheInvalidation: blogs.blogs.find(
      (blog) => blog.slug === "cache-invalidation",
    ),
  };

  // Retrospectives carry both a "retro" tag and their year tag, e.g. ["retro", "2025"].
  const retros = blogs.blogs.flatMap((blog) => {
    const tags = blog.tags?.map((tag) => tag.toLowerCase()) ?? [];
    const year = tags.find((tag) => /^\d{4}$/.test(tag));

    return tags.includes("retro") && year ? [{ ...blog, year }] : [];
  });

  const ignoreSlugs = new Set<string>(
    [...retros, ...Object.values(mentalModels)]
      .filter((blog) => blog !== undefined)
      .map((blog) => blog.slug),
  );

  blogs.blogs = blogs.blogs.filter((blog) => !ignoreSlugs.has(blog.slug));

  return (
    <HomeView
      projects={projects.projects.sort((a, b) => b.views - a.views)}
      blogs={blogs.blogs.sort((a, b) => b.views - a.views).slice(0, 2)}
      retros={retros}
      mentalModels={mentalModels}
      testimonials={testimonials}
    />
  );
}

Home.DisplayName = "Home";

export const generateMetadata = () => {
  return metatag({
    title: "Home",
    robots: "index, follow",
  });
};
