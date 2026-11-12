import { cache } from "react";
import { getBlogs, QueryBlogs } from "@/lib/get-blogs";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { BlogsView } from "./view";

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
  const blogs = await getBlogList();

  return (
    <AdminBody>
      <BlogsView blogs={blogs} />
    </AdminBody>
  );
};

export default AdminBlogsPage;
