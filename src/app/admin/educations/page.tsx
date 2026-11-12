import { metatag } from "@/lib/metatag";
import AdminEduView from "./view";
import { cache } from "react";
import { db } from "@/lib/db";
import { EDUCATIONSERIALIZER } from "@/lib/serializers";
import { AdminBody } from "@/app/admin/components/admin-body";

const Educations = cache(async () => {
  const p = await db.education.findMany({
    orderBy: [{ start: "desc" }],
  });
  if (p.length === 0) return [];
  return EDUCATIONSERIALIZER(p);
});

export const generateMetadata = () => {
  return metatag({
    title: "Educations | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminEducationsPage = async () => {
  const educations = await Educations();

  return (
    <AdminBody>
      <AdminEduView educations={educations} />
    </AdminBody>
  );
};

export default AdminEducationsPage;
