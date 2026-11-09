"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";

const CONTENT_ROOT = path.join(process.cwd(), "content", "blogs");
const SAFE_FILE = /^[a-zA-Z0-9._-]+\.mdx?$/;

export async function getBlogFileAction(file: string) {
  if (!SAFE_FILE.test(file)) {
    return { success: false, error: "Invalid filename" };
  }

  try {
    const content = await readFile(path.join(CONTENT_ROOT, file), "utf8");
    return { success: true, content };
  } catch {
    return { success: false, error: "File not found" };
  }
}
