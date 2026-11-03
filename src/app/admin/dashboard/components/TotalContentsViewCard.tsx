"use client";

import React from "react";
import { Card, Chip } from "@heroui/react";
import { Eye, BookOpen, FolderGit2 } from "lucide-react";

interface TotalContentsViewCardProps {
  totalViews: number;
  totalBlogViews: number;
  totalProjectViews: number;
  blogCount: number;
  projectCount: number;
}

export const TotalContentsViewCard: React.FC<TotalContentsViewCardProps> = ({
  totalViews,
  totalBlogViews,
  totalProjectViews,
  blogCount,
  projectCount,
}) => {
  const avgBlogViews =
    blogCount > 0 ? Math.round(totalBlogViews / blogCount) : 0;
  const avgProjectViews =
    projectCount > 0 ? Math.round(totalProjectViews / projectCount) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
      {/* Hero Card: Total Contents View */}
      <Card className="relative overflow-hidden bg-muted/40 border border-accent/25 hover:border-accent/40 transition-all duration-300 !p-5 sm:!p-6 rounded-2xl flex flex-col justify-between group shadow-sm">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-accent/10 blur-2xl pointer-events-none group-hover:bg-accent/20 transition-all duration-300" />

        {/* Top Row: Title on Left, Icon on Right */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-300 font-inter">
            Total Contents View
          </h3>
          <div className="w-8 h-8 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Eye className="w-4 h-4" />
          </div>
        </div>

        {/* Content: Large number + Badge + Subtext */}
        <div className="space-y-1.5">
          <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-rethink">
            {totalViews.toLocaleString()}
          </span>
          <p className="text-xs text-neutral-400 font-inter">
            Total lifetime impressions across all posts &amp; projects
          </p>
        </div>
      </Card>

      {/* Blog Views Card */}
      <Card className="bg-muted/40 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 !p-5 sm:!p-6 rounded-2xl flex flex-col justify-between group shadow-sm">
        {/* Top Row: Title on Left, Icon on Right */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-300 font-inter">
            Blog Views
          </h3>
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <BookOpen className="w-4 h-4" />
          </div>
        </div>

        {/* Content: Large number + Badge + Subtext */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-rethink">
              {totalBlogViews.toLocaleString()}
            </span>
            <Chip
              size="sm"
              variant="tertiary"
              className="text-[11px] font-medium text-neutral-300"
            >
              {blogCount} {blogCount === 1 ? "article" : "articles"}
            </Chip>
          </div>
          <p className="text-xs text-neutral-400 font-inter">
            Avg. ~{avgBlogViews.toLocaleString()}{" "}
            {avgBlogViews === 1 ? "view" : "views"} per article
          </p>
        </div>
      </Card>

      {/* Project Views Card */}
      <Card className="bg-muted/40 border border-white/[0.08] hover:border-white/[0.16] transition-all duration-300 !p-5 sm:!p-6 rounded-2xl flex flex-col justify-between group shadow-sm">
        {/* Top Row: Title on Left, Icon on Right */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-neutral-300 font-inter">
            Project Views
          </h3>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FolderGit2 className="w-4 h-4" />
          </div>
        </div>

        {/* Content: Large number + Badge + Subtext */}
        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-rethink">
              {totalProjectViews.toLocaleString()}
            </span>
            <Chip
              size="sm"
              variant="tertiary"
              className="text-[11px] font-medium text-neutral-300"
            >
              {projectCount} {projectCount === 1 ? "project" : "projects"}
            </Chip>
          </div>
          <p className="text-xs text-neutral-400 font-inter">
            Avg. ~{avgProjectViews.toLocaleString()}{" "}
            {avgProjectViews === 1 ? "view" : "views"} per project
          </p>
        </div>
      </Card>
    </div>
  );
};

export default TotalContentsViewCard;
