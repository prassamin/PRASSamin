import { blog, project } from "~/.source";
import { loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

export const source = loader({
  baseUrl: "/blogs",
  source: {
    ...blog.toFumadocsSource(),
  },
});

export const projectSource = loader({
  baseUrl: "/projects",
  source: createMDXSource(project),
});
