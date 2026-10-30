import { metatag } from "@/lib/metatag";
import AdminExpView from "./view";
import { cache } from "react";
import { db } from "@/lib/db";
import { EXPERIENCESERIALIZER } from "@/lib/serializers";
import { AdminBody } from "@/app/admin/components/AdminBody";

const Experiences = cache(async () => {
  const p = await db.experience.findMany({
    orderBy: [{ start: "desc" }],
  });
  if (p.length === 0) return [];
  return EXPERIENCESERIALIZER(p);
});

export const generateMetadata = () => {
  return metatag({
    title: "Experiences | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminExperiencesPage = async () => {
  const experiences = await Experiences();

  return (
    <AdminBody>
      <AdminExpView experiences={experiences} />
    </AdminBody>
  );
};

export default AdminExperiencesPage;
