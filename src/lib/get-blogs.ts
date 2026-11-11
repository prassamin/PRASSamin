import { source } from "@/lib/source";
import { db } from "@/lib/db";
import { blogMeta } from "~/generated/mdx";

type GetBlogsParams = {
  page?: number;
  limit?: number | "all";
  search?: string;
  sortBy?: "views" | "created_at" | string;
  order?: "asc" | "desc";
};

export interface QueryBlogs {
  blogs: (Record<string, any> & {
    tags?: string[];
    title: string;
    description?: string;
    thumbnail: string;
    createdAt: string;
    updatedAt: string;
    views?: number;
    slug?: string;
    readingTime?: string;
  })[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getBlogs({
  page: pageParam = 1,
  limit: limitParam = 20,
  search: searchParam = "",
  sortBy = "created_at",
  order = "desc",
}: GetBlogsParams) {
  const page = Math.max(1, pageParam);
  const limit =
    limitParam === "all" ? Infinity : Math.min(100, Math.max(1, limitParam));
  const search = searchParam.toLowerCase();

  const allPages = source.getPages().filter((p) => p.slugs.join("/") !== "");

  // Filter by search
  const filtered = allPages.filter((entry) => {
    if (!search) return true;
    const inTitle = entry.data.title?.toLowerCase().includes(search);
    const inDesc = entry.data.description?.toLowerCase().includes(search);
    const inTags = entry.data.tags?.some((t) =>
      t.toLowerCase().includes(search),
    );
    return inTitle || inDesc || inTags;
  });

  // Fetch corresponding stats from DB
  const slugs = filtered.map((p) => p.slugs.join("/"));
  const stats = await db.blogStat.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      totalViews: true,
    },
  });
  const statsMap = new Map(stats.map((s) => [s.slug, s.totalViews || 0]));

  // Combine metadata + stats
  const blogsWithViews = filtered.map((entry) => {
    const views = statsMap.get(entry.slugs.join("/")) || 0;

    return {
      title: entry.data.title,
      description: entry.data.description,
      updatedAt: entry.data.updatedAt,
      createdAt: entry.data.createdAt,
      tags: entry.data.tags,
      thumbnail: entry.data.thumbnail || "/assets/blog-placeholder.webp",
      slug: entry.slugs.join("/"),
      url: entry.url,
      views: views,
      readingTime: blogMeta[entry.slugs.join("/")]?.readingTime ?? "",
    };
  });

  // Stable sort
  const sorted = blogsWithViews.sort((a, b) => {
    let aKey: string | number;
    let bKey: string | number;

    switch (sortBy) {
      case "views":
        aKey = a.views;
        bKey = b.views;
        break;
      case "created_at":
        aKey = Math.max(
          new Date(a.createdAt ?? 0).getTime(),
          new Date(a.updatedAt ?? 0).getTime(),
        );
        bKey = Math.max(
          new Date(b.createdAt ?? 0).getTime(),
          new Date(b.updatedAt ?? 0).getTime(),
        );
        break;
      default: // title
        aKey = a.title ?? "";
        bKey = b.title ?? "";
        break;
    }

    if (aKey < bKey) return order === "asc" ? -1 : 1;
    if (aKey > bKey) return order === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination slice
  const start = (page - 1) * limit;
  const pagedBlogs = sorted.slice(
    start,
    limit === Infinity ? undefined : start + limit,
  );

  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);

  return {
    blogs: pagedBlogs,
    page,
    limit,
    total,
    totalPages,
  };
}
