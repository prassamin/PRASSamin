"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { TestimonialCategoryType } from "@/types";

export interface TestimonialActionInput {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  category: TestimonialCategoryType;
}

export async function getTestimonialsAction() {
  try {
    const list = await db.testimonial.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
    return { success: true, data: list };
  } catch (error: any) {
    console.error("[Testimonials:Action] Failed to fetch testimonials:", error);
    throw new Error(error?.message || "Failed to load testimonials.");
  }
}

export async function createTestimonialAction(data: TestimonialActionInput) {
  const quote = data.quote?.trim();
  const name = data.name?.trim();
  const role = data.role?.trim();
  const avatar = data.avatar?.trim();
  const category = data.category;

  if (!quote) throw new Error("Quote / Testimonial content is required.");
  if (!name) throw new Error("Client / Reviewer name is required.");
  if (!role) throw new Error("Client role / company is required.");
  if (!avatar) throw new Error("Avatar image URL is required.");
  if (!category) throw new Error("Category is required.");

  try {
    // Append to the end of its column
    const lastInCategory = await db.testimonial.findFirst({
      where: { category },
      orderBy: { order: "desc" },
    });
    const nextOrder = (lastInCategory?.order ?? -1) + 1;

    const created = await db.testimonial.create({
      data: {
        quote,
        name,
        role,
        avatar,
        category,
        order: nextOrder,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true, data: created };
  } catch (error: any) {
    console.error("[Testimonials:Action] Failed to create testimonial:", error);
    throw new Error(error?.message || "Failed to create testimonial.");
  }
}

export async function updateTestimonialAction(
  id: number,
  data: TestimonialActionInput,
) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Testimonial ID is required.");
  }

  const quote = data.quote?.trim();
  const name = data.name?.trim();
  const role = data.role?.trim();
  const avatar = data.avatar?.trim();
  const category = data.category;

  if (!quote) throw new Error("Quote / Testimonial content is required.");
  if (!name) throw new Error("Client / Reviewer name is required.");
  if (!role) throw new Error("Client role / company is required.");
  if (!avatar) throw new Error("Avatar image URL is required.");
  if (!category) throw new Error("Category is required.");

  try {
    const updated = await db.testimonial.update({
      where: { id },
      data: {
        quote,
        name,
        role,
        avatar,
        category,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("[Testimonials:Action] Failed to update testimonial:", error);
    throw new Error(error?.message || "Failed to update testimonial.");
  }
}

/** Persist a full kanban ordering (category + per-column position) atomically. */
export async function reorderTestimonialsAction(
  updates: {
    id: number;
    category: TestimonialCategoryType;
    order: number;
  }[],
) {
  if (!updates.length) return { success: true };

  try {
    // Sequential updates (safe with Prisma Accelerate / driver adapters)
    for (const u of updates) {
      await db.testimonial.update({
        where: { id: u.id },
        data: { category: u.category, order: u.order },
      });
    }

    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("[Testimonials:Action] Failed to reorder testimonials:", error);
    throw new Error(error?.message || "Failed to save ordering.");
  }
}

export async function deleteTestimonialAction(id: number) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Testimonial ID is required.");
  }

  try {
    const deleted = await db.testimonial.delete({
      where: { id },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");

    return { success: true, data: deleted };
  } catch (error: any) {
    console.error("[Testimonials:Action] Failed to delete testimonial:", error);
    if (error?.code === "P2025") {
      throw new Error("Testimonial not found.");
    }
    throw new Error(error?.message || "Failed to delete testimonial.");
  }
}
