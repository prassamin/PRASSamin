import { cache } from "react";
import { getProjects, QueryProjects } from "@/lib/get-projects";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { ProjectsView } from "./view";

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
  const projects = await getProjectList();

  return (
    <AdminBody>
      <ProjectsView projects={projects} />
    </AdminBody>
  );
};

export default AdminProjectsPage;
