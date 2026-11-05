import { format, differenceInMonths, parseISO } from "date-fns";

const formatStartDate = (startDate: any): string => {
  if (!startDate) return "";
  try {
    const d =
      typeof startDate === "string" ? parseISO(startDate) : new Date(startDate);
    if (isNaN(d.getTime())) return "";
    return format(d, "MMM yyyy");
  } catch {
    return "";
  }
};

const formatEndDate = (endDate: any): string => {
  if (
    !endDate ||
    endDate === "Present" ||
    String(endDate).toLowerCase() === "present"
  ) {
    return "Present";
  }
  try {
    const d =
      typeof endDate === "string" ? parseISO(endDate) : new Date(endDate);
    if (isNaN(d.getTime()) || d.getTime() === 0) return "Present";
    return format(d, "MMM yyyy");
  } catch {
    return "Present";
  }
};

const getDuration = (
  startDate: Date | string,
  endDate: Date | string | null,
) => {
  const start =
    typeof startDate === "string" ? parseISO(startDate) : startDate;
  const end =
    !endDate ||
    endDate === "Present" ||
    String(endDate).toLowerCase() === "present"
      ? new Date()
      : typeof endDate === "string"
      ? parseISO(endDate)
      : endDate;

  // Calculate the difference in months
  let months = differenceInMonths(end, start);
  
  // Get the start date advanced by the number of months
  const startPlusMonths = new Date(start);
  startPlusMonths.setMonth(start.getMonth() + months);
  
  // Calculate remaining days
  const remainingDays = Math.ceil((end.getTime() - startPlusMonths.getTime()) / (1000 * 60 * 60 * 24));
  
  // If remaining days > 15, count as an additional month
  if (remainingDays > 15) {
    months += 1;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  const yearsText =
    years > 0 ? `${years} ${years === 1 ? "year" : "years"}` : "";
  const monthsText =
    remainingMonths > 0
      ? `${remainingMonths} ${remainingMonths === 1 ? "month" : "months"}`
      : "";

  if (years > 0 && remainingMonths > 0) {
    return `${yearsText}, ${monthsText}`;
  }
  return yearsText || monthsText;
};

export const EXPERIENCESERIALIZER = (experiences: any) => {
  if (!experiences) return null; // Handle null input
  if (typeof experiences !== "object") return null; // Handle non-object input

  // main serializer function
  const serializer = (experience: any) => {
    const startStr = formatStartDate(experience?.start);
    const endStr = formatEndDate(experience?.end);
    const duration = getDuration(experience?.start, experience?.end);
    const period = startStr
      ? `${startStr} - ${endStr} • ${duration}`
      : `${endStr} • ${duration}`;

    return {
      id: experience.id,
      company: experience.company,
      role: experience.role,
      description: experience?.description,
      companyUrl: experience?.companyUrl,
      companyLogo: experience?.companyLogo,
      location: experience?.location,
      period,
      start: experience?.start,
      end:
        experience?.end && experience.end !== "Present" ? experience.end : null,
      created_at: experience.created_at,
      updated_at: experience.updated_at,
    };
  };

  return typeof experiences === "object" && !Array.isArray(experiences)
    ? serializer(experiences) // single experience
    : experiences.length <= 0
    ? [] // no experiences
    : experiences.map((experience: any) => {
        return serializer(experience);
      }); // array of experiences
};

export const EDUCATIONSERIALIZER = (educations: any) => {
  if (!educations) return null; // Handle null input
  if (typeof educations !== "object") return null; // Handle non-object input

  // main serializer function
  const serializer = (education: any) => {
    const startStr = formatStartDate(education?.start);
    const endStr = formatEndDate(education?.end);
    const period = startStr ? `${startStr} - ${endStr}` : endStr;

    return {
      id: education.id,
      degree: education.degree,
      field: education.field,
      school: education.school,
      description: education?.description,
      period,
      start: education?.start,
      end:
        education?.end && education.end !== "Present" ? education.end : null,
      created_at: education.created_at,
      updated_at: education.updated_at,
    };
  };

  return typeof educations === "object" && !Array.isArray(educations)
    ? serializer(educations) // single education
    : educations.length <= 0
    ? [] // no educations
    : educations.map((education: any) => {
        return serializer(education);
      }); // array of educations
};
