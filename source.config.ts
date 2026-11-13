import { z } from "zod";
import {
  defineDocs,
  frontmatterSchema,
  defineConfig,
  defineCollections,
} from "fumadocs-mdx/config";
import remarkAttributes from "remark-attributes";
import type { Pluggable } from "unified";

/**
 * Accept either an ISO string or a YAML-parsed Date and normalize to an
 * ISO string. Unquoted timestamps in frontmatter (e.g.
 * `createdAt: 2026-11-14T04:49:35.251Z`) are parsed by YAML as Date
 * objects; this keeps the schema robust against both forms.
 */
const dateString = z
  .union([z.string(), z.date()])
  .transform((value) =>
    value instanceof Date ? value.toISOString() : value,
  );

export const blog = defineDocs({
  dir: "content/blogs",
  docs: {
    schema: frontmatterSchema.extend({
      updatedAt: dateString,
      createdAt: dateString,
      tags: z.array(z.string()).optional(),
      thumbnail: z.string().optional().default("/assets/blog-placeholder.webp"),
      banner: z.string().optional(),
      views: z.number().optional(),
    }),
  },
});

export const project = defineCollections({
  dir: "content/projects",
  type: "doc",
  schema: frontmatterSchema.extend({
    updatedAt: dateString,
    createdAt: dateString,
    thumbnail: z.string().optional(),
    banner: z.string().optional(),
    links: z
      .object({
        github: z.string().optional(),
        live: z.string().optional(),
      })
      .optional(),
    category: z.string(),
    tools: z.array(z.string()).optional(),
    views: z.number().optional(),
  }),
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkAttributes as unknown as Pluggable],
  },
});
