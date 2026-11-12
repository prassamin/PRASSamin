import { metatag } from "@/lib/metatag";
import { getBlogs } from "@/lib/get-blogs";
import { getProjects } from "@/lib/get-projects";
import { AdminBody } from "./components/admin-body";
import { AdminDashboardView } from "./dashboard/view";

export const generateMetadata = () => {
  return metatag({
    title: "Dashboard | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminDashboardPage = async () => {
  const [blogsData, projectsData] = await Promise.all([
    getBlogs({ limit: "all", sortBy: "views" }),
    getProjects({ limit: "all", sortBy: "views" }),
  ]);

  const totalBlogViews = blogsData.blogs.reduce(
    (sum, b) => sum + (b.views || 0),
    0,
  );
  const totalProjectViews = projectsData.projects.reduce(
    (sum, p) => sum + (p.views || 0),
    0,
  );
  const totalViews = totalBlogViews + totalProjectViews;

  const blogViews = blogsData.blogs.map((b) => ({
    slug: b.slug || "",
    url: b.url || `/blogs/${b.slug}`,
    title: b.title || b.slug?.replace(/-/g, " ") || "Untitled Article",
    views: b.views || 0,
    readingTime: b.readingTime || "1 min read",
    tags: b.tags || [],
    createdAt: b.createdAt || "",
  }));

  const projectViews = projectsData.projects.map((p) => ({
    slug: p.slug || "",
    url: p.url || `/projects/${p.slug}`,
    title: p.title || p.slug?.replace(/-/g, " ") || "Untitled Project",
    views: p.views || 0,
    tools: p.tools || [],
    category: p.category || "Project",
    createdAt: p.createdAt || "",
  }));

  return (
    <AdminBody>
      <AdminDashboardView
        totalViews={totalViews}
        totalBlogViews={totalBlogViews}
        totalProjectViews={totalProjectViews}
        blogViews={blogViews}
        projectViews={projectViews}
      />
    </AdminBody>
  );
};

export default AdminDashboardPage;
