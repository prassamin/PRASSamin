import { metatag } from "@/lib/metatag";
import AdminEduView from "./view";
import { cache } from "react";
import { db } from "@/lib/db";
import { EDUCATIONSERIALIZER } from "@/lib/serializers";
import { AdminBody } from "@/app/admin/components/admin-body";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const Educations = cache(async () => {
  const p = await db.education.findMany({
    orderBy: [{ start: "desc" }],
  });
  if (p.length === 0) return [];
  return EDUCATIONSERIALIZER(p);
});

const EducationDrafts = cache(async () => {
  try {
    const drafts = await db.draft.findMany({
      where: { type: "education", status: "draft" },
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
    title: "Educations | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminEducationsPage = async () => {
  const [educations, drafts] = await Promise.all([
    Educations(),
    EducationDrafts(),
  ]);

  return (
    <AdminBody>
      <AdminEduView educations={educations} drafts={drafts} />
    </AdminBody>
  );
};

export default AdminEducationsPage;
