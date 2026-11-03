import { NextRequest, NextResponse } from "next/server";
import { getProjects } from "@/lib/get-projects";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);

  const page = parseInt(url.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
  const search = url.searchParams.get("search") ?? "";
  const sortBy = url.searchParams.get("sortBy");
  const order = url.searchParams.get("order") as "asc" | "desc" | undefined;

  const projectsData = await getProjects({
    page,
    limit,
    search,
    sortBy: sortBy ?? "created_at",
    order,
  });

  return NextResponse.json(projectsData);
}
