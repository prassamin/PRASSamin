#!/usr/bin/env node
/**
 * Pre-commit hook: bump `updatedAt` on staged MDX/MD content files.
 *
 * - Only touches STAGED files (git diff --cached), so unrelated dirty
 *   files are never affected.
 * - Sets `createdAt` when missing (new files).
 * - Serializes with forced double-quoting so YAML never parses timestamps
 *   as Date objects (which broke the build once).
 * - Re-stages the files so the timestamp changes ride along in the commit.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { stringify } from "yaml";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_EXT = /\.mdx?$/;

function git(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

function toDateString(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function stringifyMeta(data) {
  return stringify(data, {
    lineWidth: 80,
    defaultKeyType: "PLAIN",
    defaultStringType: "QUOTE_DOUBLE",
  });
}

// Staged files only — respect exactly what the user is committing.
const stagedFiles = git([
  "diff",
  "--cached",
  "--name-only",
  "--diff-filter=ACM",
])
  .split("\n")
  .filter(Boolean);

const mdxFiles = stagedFiles.filter((file) => CONTENT_EXT.test(file));

if (mdxFiles.length === 0) {
  process.exit(0);
}

const nowIso = new Date().toISOString();
const touched = [];

for (const file of mdxFiles) {
  const abs = join(ROOT, file);
  let raw;
  try {
    raw = readFileSync(abs, "utf8");
  } catch {
    continue; // deleted between staging and now — skip
  }

  const { data, content } = matter(raw);

  const normalized = {};
  for (const [key, value] of Object.entries(data)) {
    normalized[key] = toDateString(value);
  }

  const nextMeta = {
    ...normalized,
    updatedAt: nowIso,
  };
  // New files: stamp createdAt too.
  if (!nextMeta.createdAt) {
    nextMeta.createdAt = nowIso;
  }

  const updated = `---\n${stringifyMeta(nextMeta)}---\n\n${content}`;
  writeFileSync(abs, updated, "utf8");
  touched.push(file);
}

// Re-stage the touched files so the changes are part of this commit.
if (touched.length > 0) {
  git(["add", "--", ...touched]);
}

console.log(
  `[pre-commit] bumped updatedAt on ${touched.length} file(s):\n` +
    touched.map((f) => `  - ${f}`).join("\n"),
);
