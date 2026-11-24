import { metatag } from "@/lib/metatag";
import AdminExpView from "./view";
import { cache } from "react";
import { db } from "@/lib/db";
import { EXPERIENCESERIALIZER } from "@/lib/serializers";
import { AdminBody } from "@/app/admin/components/admin-body";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Experiences = cache(async () => {
  const p = await db.experience.findMany({
    orderBy: [{ start: "desc" }],
  });
  if (p.length === 0) return [];
  return EXPERIENCESERIALIZER(p);
});

const ExperienceDrafts = cache(async () => {
  try {
    const drafts = await db.draft.findMany({
      where: { type: "experience", status: "draft" },
      orderBy: [{ createdAt: "desc" }],
    });
    return drafts.map((d) => ({
      id: d.id,
      type: d.type,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
      data: (d.data as any) || {},
    }));
  } catch {
    return [];
  }
});

export const generateMetadata = () => {
  return metatag({
    title: "Experiences | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminExperiencesPage = async () => {
  const [experiences, drafts] = await Promise.all([
    Experiences(),
    ExperienceDrafts(),
  ]);

  return (
    <AdminBody>
      <AdminExpView experiences={experiences} drafts={drafts} />
    </AdminBody>
  );
};

export default AdminExperiencesPage;
