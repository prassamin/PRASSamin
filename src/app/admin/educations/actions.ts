"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface EducationActionInput {
  school: string;
  degree: string;
  field: string;
  start: Date | string;
  end?: Date | string | null;
  description?: string | null;
}

export async function createEducationAction(data: EducationActionInput) {
  const school = data.school?.trim();
  const degree = data.degree?.trim();
  const field = data.field?.trim();

  if (!school) throw new Error("Institution / School name is required.");
  if (!degree) throw new Error("Degree / Qualification is required.");
  if (!field) throw new Error("Field of study is required.");
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

  const created = await db.education.create({
    data: {
      school,
      degree,
      field,
      start: startDate,
      end: endDate,
      description: data.description?.trim() || "",
    },
  });

  revalidatePath("/admin/educations");
  revalidatePath("/about");

  return { success: true, data: created };
}

export async function updateEducationAction(
  id: number,
  data: EducationActionInput,
) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Education ID is required for updating.");
  }

  const school = data.school?.trim();
  const degree = data.degree?.trim();
  const field = data.field?.trim();

  if (!school) throw new Error("Institution / School name is required.");
  if (!degree) throw new Error("Degree / Qualification is required.");
  if (!field) throw new Error("Field of study is required.");
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

  const updated = await db.education.update({
    where: { id },
    data: {
      school,
      degree,
      field,
      start: startDate,
      end: endDate,
      description: data.description?.trim() || "",
    },
  });

  revalidatePath("/admin/educations");
  revalidatePath("/about");

  return { success: true, data: updated };
}

export async function deleteEducationAction(id: number) {
  if (!id || typeof id !== "number" || isNaN(id)) {
    throw new Error("Valid Education ID is required for deletion.");
  }

  const deleted = await db.education.delete({
    where: { id },
  });

  revalidatePath("/admin/educations");
  revalidatePath("/about");

  return { success: true, data: deleted };
}
