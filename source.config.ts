import { z } from "zod";
import {
  defineDocs,
  frontmatterSchema,
  defineConfig,
  defineCollections,
} from "fumadocs-mdx/config";
import remarkAttributes from "remark-attributes";
import type { Pluggable } from "unified";

const thumbnailSchema = z.string().optional();

export const blog = defineDocs({
  dir: "content/blogs",
  docs: {
    schema: frontmatterSchema.extend({
      updatedAt: z.string(),
      createdAt: z.string(),
      tags: z.array(z.string()).optional(),
      thumbnail: z.string().optional(),
      banner: z.string().optional(),
      views: z.number().optional(),
    }),
  },
});

export const project = defineCollections({
  dir: "content/projects",
  type: "doc",
  schema: frontmatterSchema.extend({
    updatedAt: z.string(),
    createdAt: z.string(),
    thumbnail: thumbnailSchema,
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
