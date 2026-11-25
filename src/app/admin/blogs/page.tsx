import { cache } from "react";
import { getBlogs, QueryBlogs } from "@/lib/get-blogs";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { db } from "@/lib/db";
import { BlogsView } from "./view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getBlogList = cache(async (): Promise<QueryBlogs["blogs"]> => {
  try {
    const data = await getBlogs({ limit: "all" });
    return data.blogs;
  } catch (error) {
    console.error("Failed to load blogs:", error);
    return [];
  }
});

export const generateMetadata = () => {
  return metatag({
    title: "Blogs | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminBlogsPage = async () => {
  const [blogs, drafts] = await Promise.all([
    getBlogList(),
    db.draft.findMany({
      where: { type: "blog" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const serializedDrafts = drafts.map((d) => ({
    id: d.id,
    type: d.type,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
    data: d.data as Record<string, any>,
  }));

  return (
    <AdminBody>
      <BlogsView blogs={blogs} drafts={serializedDrafts} />
    </AdminBody>
  );
};

export default AdminBlogsPage;
