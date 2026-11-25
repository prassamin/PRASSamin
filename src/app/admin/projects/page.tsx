import { cache } from "react";
import { getProjects, QueryProjects } from "@/lib/get-projects";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { db } from "@/lib/db";
import { ProjectsView } from "./view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getProjectList = cache(async (): Promise<QueryProjects["projects"]> => {
  try {
    const data = await getProjects({ limit: "all" });
    return data.projects;
  } catch (error) {
    console.error("Failed to load projects:", error);
    return [];
  }
});

export const generateMetadata = () => {
  return metatag({
    title: "Projects | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminProjectsPage = async () => {
  const [projects, drafts] = await Promise.all([
    getProjectList(),
    db.draft.findMany({
      where: { type: "project" },
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
      <ProjectsView projects={projects} drafts={serializedDrafts} />
    </AdminBody>
  );
};

export default AdminProjectsPage;
