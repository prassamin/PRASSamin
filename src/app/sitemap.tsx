import { source, projectSource } from "@/lib/source";
import { getOrigin } from "@/lib/url";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const blogs = source.getPages();
  const projects = projectSource.getPages();
  const origin = await getOrigin();

  return [
    {
      url: origin,
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: `${origin}/about`,
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: `${origin}/contact`,
      lastModified: new Date(),
      priority: 0.9,
    },
    ...blogs.map((blog) => ({
      url: `${origin}${blog.url}`,
      lastModified: blog.data.updatedAt,
      priority: 0.8,
    })),
    ...projects.map((project) => ({
      url: `${origin}${project.url}`,
      lastModified: project.data.updatedAt,
      priority: 0.8,
    })),
  ];
}
