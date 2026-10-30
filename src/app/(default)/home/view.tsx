"use client";

import React from "react";
import HeroSection from "./components/hero";
import { MentalModels } from "./components/mental-models";
import { FeaturedPosts } from "./components/featured-posts";
import { Retro } from "./components/retro";
import { FeaturedProjects } from "./components/featured-projects";
import { Testimonials } from "./components/testimonials";
import { QueryProjects } from "@/lib/get-projects";
import { QueryBlogs } from "@/lib/get-blogs";
import type { TestimonialType } from "@/types";

type SingleBlog = QueryBlogs["blogs"][0];

interface RetroBlogs extends SingleBlog {
  year: string;
}

type Props = {
  projects: QueryProjects["projects"];
  blogs: QueryBlogs["blogs"];
  retros: RetroBlogs[];
  mentalModels: {
    concurrency: SingleBlog | undefined;
    cacheInvalidation: SingleBlog | undefined;
  };
  testimonials: TestimonialType[];
};

const HomeView: React.FC<Props> = ({
  projects,
  blogs,
  mentalModels,
  retros,
  testimonials,
}) => {
  return (
    <div className="flex flex-col items-center w-full overflow-hidden">
      {/* Hero & Mental Models seamlessly grouped to allow 3D isometric grid flow */}
      <HeroSection />

      {Object.values(mentalModels).filter(Boolean).length > 0 && (
        <MentalModels mentalModels={mentalModels} />
      )}

      {/* Featured Writing & Guides */}
      {blogs.length > 0 && <FeaturedPosts blogs={blogs} />}

      {/* Yearly Retrospectives */}
      {retros.length > 0 && <Retro retros={retros} />}

      {/* Featured Projects / Case Studies */}
      {projects.length > 0 && <FeaturedProjects projects={projects} />}

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />
    </div>
  );
};

export default HomeView;
