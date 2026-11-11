import { db } from "@/lib/db";
import { metatag } from "@/lib/metatag";
import { projectSource } from "@/lib/source";
import { notFound } from "next/navigation";
import { getMDXComponents, mdxComponents } from "@/mdx-components";
import { projectMeta } from "~/generated/mdx";
import { RailToc, type RailTocItem } from "@/components/rail-toc";
import { TrackView } from "@/components/track-view";
import { ProjectDetailBackground } from "../components/project-detail-background";
import ProjectsLayoutContainer from "../components/projects-layout-container";
import { Link } from "@/components/link";
import { LuEye, LuLink } from "react-icons/lu";
import Footer from "@/components/footer";
import { getProjects } from "@/lib/get-projects";
import ProjectsView from "../view";
import { BiSolidCategoryAlt } from "react-icons/bi";
import { SiGithub } from "react-icons/si";
import { getStack } from "@/lib/stacks";

type Props = Promise<{ slug?: string[] }>;

const ProjectPage = async ({ params }: { params: Props }) => {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    const projectsData = await getProjects({ limit: "all" });
    return (
      <>
        <ProjectsView initialProjects={projectsData.projects} />
        <Footer />
      </>
    );
  }

  const page = projectSource.getPage(slug);
  if (!page) notFound();

  const fSlug = page.slugs.join("/");

  // Total views from db
  const projectStat = await db.projectStat.findUnique({
    where: { slug: fSlug },
    select: { totalViews: true },
  });

  const viewsCount = projectStat?.totalViews || 0;

  const MDX = page.data.body;

  const tocItems: RailTocItem[] = projectMeta[fSlug]?.toc ?? [];

  return (
    <>
      <main className="relative min-h-screen bg-neutral-950 text-neutral-100">
        <section className="relative isolate">
          {/* Blueprint Wireframe & Crumpled Paper Background */}
          <ProjectDetailBackground />

          {/* Layout Container — same framing as the projects list page */}
          <ProjectsLayoutContainer bodyClassName="mx-0" blur={true}>
            <div className="layout pb-12 pt-[8.6rem] md:pb-20 md:pt-[9.6rem] relative z-10">
              {/* Project Title */}
              <h1 className="mt-6 leading-tight h3 sm:h2 font-bold font-rethink text-neutral-100">
                {page.data.title}
              </h1>

              {/* Project Description */}
              {page.data.description && (
                <p className="b1 mt-2 text-neutral-400 font-inter">
                  {page.data.description}
                </p>
              )}

              {/* Used Tools */}
              {page.data.tools && page.data.tools.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  {page.data.tools.map((tool) => {
                    const stack = getStack(tool);
                    const StackIcon = stack?.icon;
                    return (
                      <span
                        key={tool}
                        data-slot="badge"
                        className="inline-flex w-fit bg-muted/50 items-center justify-center whitespace-nowrap text-neutral-300 transition-[color,box-shadow] gap-1.5 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-[10px] md:text-xs font-medium capitalize gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)]"
                      >
                        {StackIcon && <StackIcon className="size-3.5" />}
                        {tool}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Meta Bar */}
              <div className="mt-9 py-4 border-y border-neutral-800 flex items-center flex-wrap gap-5">
                {/* Category */}
                <p className="c1 text-neutral-400 flex items-center gap-2 text-xs">
                  <BiSolidCategoryAlt className="size-4 text-neutral-600 shrink-0" />
                  <span>{page.data.category}</span>
                </p>

                {/* Views Count */}
                <p className="mr-auto c1 text-neutral-400 flex items-center gap-2 text-xs">
                  <LuEye className="size-4 text-neutral-600 shrink-0" />
                  <span>{viewsCount.toLocaleString()} views</span>
                </p>

                {/* Repository Link */}
                {page.data.links?.github && (
                  <Link
                    href={page.data.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-neutral-300 transition-colors hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] flex items-center gap-1.5 c1 group decoration-transparent"
                  >
                    <SiGithub className="size-3.5 text-neutral-500 group-hover:text-accent/75 group-focus-visible:text-accent/75 transition-colors shrink-0" />
                    <span className="-mb-0.5">Repository</span>
                  </Link>
                )}

                {/* Open Live Site Link */}
                {page.data.links?.live && (
                  <Link
                    href={page.data.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-neutral-300 transition-colors hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] flex items-center gap-1.5 c1 group decoration-transparent"
                  >
                    <LuLink className="size-3.5 text-neutral-500 group-hover:text-accent/75 group-focus-visible:text-accent/75 transition-colors shrink-0" />
                    <span className="-mb-0.5">Live Site</span>
                  </Link>
                )}
              </div>

              {/* Main Article & Sticky TOC Section */}
              <section className="mt-6 md:flex md:gap-8">
                <article className="mdx projects prose mx-auto mt-4 w-full min-w-0 flex-1 transition-colors dark:prose-invert max-w-none">
                  <MDX components={getMDXComponents(mdxComponents)} />
                </article>

                {/* Sticky Table of Contents */}
                <aside className="hidden md:block w-64 shrink-0 py-4">
                  {tocItems.length > 0 && (
                    <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-hidden">
                      <RailToc items={tocItems} className="w-full" />
                    </div>
                  )}
                </aside>
              </section>

              {/* Back to Projects */}
              <div className="mt-8 flex flex-col items-start gap-4">
                <Link
                  href="/projects"
                  className="inline-block underline text-neutral-300 transition-colors decoration-[color-mix(in_srgb,currentColor_30%,#171717)] hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] text-sm"
                >
                  ← Back to projects
                </Link>
              </div>
            </div>
          </ProjectsLayoutContainer>
        </section>

        <TrackView type="project" slug={fSlug} />
      </main>

      {/* Global Footer */}
      <Footer />
    </>
  );
};

export default ProjectPage;

export async function generateStaticParams() {
  return projectSource.generateParams();
}

export async function generateMetadata(props: { params: Props }) {
  const params = await props.params;
  const page = projectSource.getPage(params.slug);
  if (!page) notFound();
  return metatag({
    title: `${page?.data.title} | PRAS`,
    description: page?.data.description,
    image: page?.data.thumbnail,
    robots: "index, follow",
  });
}
