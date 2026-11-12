import { cache } from "react";
import { db } from "@/lib/db";
import { metatag } from "@/lib/metatag";
import { AdminBody } from "@/app/admin/components/admin-body";
import { TestimonialsView } from "./view";
import { TestimonialType } from "@/types";

const getTestimonials = cache(async (): Promise<TestimonialType[]> => {
  try {
    const list = await db.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return list.map((item) => ({
      ...item,
      category: item.category as TestimonialType["category"],
    }));
  } catch (error) {
    console.error("Failed to load testimonials:", error);
    return [];
  }
});

export const generateMetadata = () => {
  return metatag({
    title: "Testimonials | Admin",
    robots: "noindex, nofollow",
  });
};

const AdminTestimonialsPage = async () => {
  const testimonials = await getTestimonials();

  return (
    <AdminBody>
      <TestimonialsView testimonials={testimonials} />
    </AdminBody>
  );
};

export default AdminTestimonialsPage;
