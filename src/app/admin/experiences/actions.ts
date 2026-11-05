"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface ExperienceActionInput {
  company: string;
  role: string;
  start: Date | string;
  end?: Date | string | null;
  description?: string | null;
  companyUrl?: string | null;
  companyLogo?: string | null;
  location?: string | null;
}

export async function createExperienceAction(data: ExperienceActionInput) {
  const company = data.company?.trim();
  const role = data.role?.trim();

  if (!company) throw new Error("Company / Organization name is required.");
  if (!role) throw new Error("Job role / Position is required.");
  if (!data.start) throw new Error("Start date is required.");

  const startDate = new Date(data.start);
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid start date provided.");
  }

  let endDate: Date | null = null;
  if (data.end && data.end !== "Present") {
    const parsed = new Date(data.end);
    if (!isNaN(parsed.getTime()) && parsed.getTime() !== 0) {
      endDate = parsed;
    }
  }

  const created = await db.experience.create({
    data: {
      company,
      role,
      start: startDate,
      end: endDate,
      description: data.description?.trim() || "",
      companyUrl: data.companyUrl?.trim() || null,
      companyLogo: data.companyLogo?.trim() || null,
      location: data.location?.trim() || null,
    },
  });

  revalidatePath("/admin/experiences");
  revalidatePath("/about");

  return { success: true, data: created };
}

export async function updateExperienceAction(
  id: number,
  data: ExperienceActionInput,
) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Experience ID is required for updating.");
  }

  const company = data.company?.trim();
  const role = data.role?.trim();

  if (!company) throw new Error("Company / Organization name is required.");
  if (!role) throw new Error("Job role / Position is required.");
  if (!data.start) throw new Error("Start date is required.");

  const startDate = new Date(data.start);
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid start date provided.");
  }

  let endDate: Date | null = null;
  if (data.end && data.end !== "Present") {
    const parsed = new Date(data.end);
    if (!isNaN(parsed.getTime()) && parsed.getTime() !== 0) {
      endDate = parsed;
    }
  }

  const updated = await db.experience.update({
    where: { id },
    data: {
      company,
      role,
      start: startDate,
      end: endDate,
      description: data.description?.trim() || "",
      companyUrl: data.companyUrl?.trim() || null,
      companyLogo: data.companyLogo?.trim() || null,
      location: data.location?.trim() || null,
    },
  });

  revalidatePath("/admin/experiences");
  revalidatePath("/about");

  return { success: true, data: updated };
}

export async function deleteExperienceAction(id: number) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Experience ID is required for deletion.");
  }

  const deleted = await db.experience.delete({
    where: { id },
  });

  revalidatePath("/admin/experiences");
  revalidatePath("/about");

  return { success: true, data: deleted };
}
