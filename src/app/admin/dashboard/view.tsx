"use client";

import React from "react";
import { BookOpen, FolderGit2 } from "lucide-react";
import { TotalContentsViewCard } from "./components/TotalContentsViewCard";
import {
  ContentAnalyticsSection,
  AnalyticsItem,
} from "./components/ContentAnalyticsSection";

interface AdminDashboardViewProps {
  totalViews: number;
  totalBlogViews: number;
  totalProjectViews: number;
  blogViews: AnalyticsItem[];
  projectViews: AnalyticsItem[];
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  totalViews,
  totalBlogViews,
  totalProjectViews,
  blogViews,
  projectViews,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Top Metrics Counter Row */}
      <TotalContentsViewCard
        totalViews={totalViews}
        totalBlogViews={totalBlogViews}
        totalProjectViews={totalProjectViews}
        blogCount={blogViews.length}
        projectCount={projectViews.length}
      />

      {/* Blog Analytics (HeroUI Card + Tabs + Recharts/Table) */}
      <ContentAnalyticsSection
        title="Blog Analytics"
        description="Showing total views, ranking, and performance across all published articles"
        badgeLabel="Blogs"
        color="#70ffc3"
        icon={<BookOpen className="w-5 h-5" />}
        data={blogViews}
        type="blog"
      />

      {/* Projects Analytics (HeroUI Card + Tabs + Recharts/Table) */}
      <ContentAnalyticsSection
        title="Project Analytics"
        description="Showing total views, ranking, and performance across all showcase projects"
        badgeLabel="Projects"
        color="#38bdf8"
        icon={<FolderGit2 className="w-5 h-5" />}
        data={projectViews}
        type="project"
      />
    </div>
  );
};

export default AdminDashboardView;
