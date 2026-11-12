import { db } from "@/lib/db";
import { metatag } from "@/lib/metatag";
import { source } from "@/lib/source";
import { notFound } from "next/navigation";
import { getMDXComponents, mdxComponents } from "@/mdx-components";
import { RailToc, type RailTocItem } from "@/components/rail-toc";
import { BlogCard } from "@/app/(fuma)/blogs/components/blog-card";
import { blogMeta } from "~/generated/mdx";
import { TrackView } from "@/components/track-view";
import Image from "next/image";
import Link from "next/link";
import { LuBookOpen, LuEye } from "react-icons/lu";
import Footer from "@/components/footer";
import BlogsView from "../view";
import { getBlogs } from "@/lib/get-blogs";
import { getOwnerCached, toPublicOwner } from "@/lib/github";
import { TWITTER_USERNAME } from "@/constants";
import { getOrigin } from "@/lib/url";

type Props = Promise<{ slug?: string[] }>;

const BlogPage = async ({ params }: { params: Props }) => {
  const { slug } = await params;
  if (!slug || slug.length === 0) {
    const blogsData = await getBlogs({ limit: "all" });
    return <BlogsView blogs={blogsData.blogs} />;
  }

  const owner = toPublicOwner((await getOwnerCached()).owner);
  const origin = await getOrigin();

  const page = source.getPage(slug);
  if (!page) notFound();
  const fSlug = page.slugs.join("/");

  // Total views
  const blogStat = await db.blogStat.findUnique({
    where: { slug: fSlug },
    select: { totalViews: true },
  });

  page.data.views = blogStat?.totalViews || 0;
  const MDX = page.data.body;

  const readingTimeText = blogMeta[fSlug]?.readingTime || "-";

  const formattedDate = new Date(
    page.data.createdAt || Date.now(),
  ).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Related posts — prioritize shared tags, then fill with other posts
  const currentTags = (page.data.tags || []).map((t) => t.toLowerCase());
  const allBlogsData = await getBlogs({ limit: "all" });
  const otherPosts = allBlogsData.blogs.filter((b) => b.slug !== fSlug);
  const recommendations = [...otherPosts]
    .sort((a, b) => {
      const aShared =
        a.tags?.filter((t) => currentTags.includes(t.toLowerCase())).length ??
        0;
      const bShared =
        b.tags?.filter((t) => currentTags.includes(t.toLowerCase())).length ??
        0;
      return bShared - aShared;
    })
    .slice(0, 3);

  const tags: string[] = page.data.tags || [];

  const tocItems: RailTocItem[] = blogMeta[fSlug]?.toc ?? [];

  return (
    <>
      <main className="relative min-h-screen bg-neutral-950 text-neutral-100">
        <section className="relative isolate">
          {/* Ambient Banner Cover Image */}
          {page.data.banner || !page.data.thumbnail ? (
            <div className="absolute inset-x-0 top-0 h-72 md:h-96 overflow-hidden pointer-events-none -z-10">
              <figure className="relative w-full h-full">
                <Image
                  src={page.data.banner || page.data.thumbnail}
                  alt={page.data.title || "Banner"}
                  fill
                  priority
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-linear-to-b from-neutral-950/30 via-5% via-neutral-950/65 to-neutral-950" />
              </figure>
            </div>
          ) : (
            <div>
              <div
                aria-hidden="true"
                className="h-6.25 w-100 rounded-r-[50%] bg-linear-to-r from-accent via-accent to-[color-mix(in_srgb,var(--accent)_50%,var(--foreground))]/80 blur-[32px] absolute -top-4 -translate-y-1/2 rotate-45 origin-left -left-4 z-[-1]"
              />
              <div
                aria-hidden="true"
                className="h-100 w-162.5 rounded-full bg-linear-to-r from-accent-dark/30 to-accent-deep/30 blur-[150px] absolute top-0 -translate-y-full rotate-45 origin-left z-[-2] left-[15%]"
              />
            </div>
          )}

          {/* Main Layout Container */}
          <div className="layout pb-12 pt-32 md:pb-20 md:pt-65 relative z-10">
            {/* CHILD 0: Header Section */}
            <div className="pb-4">
              {/* Tags / Topics pills */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-neutral-100">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-lg px-2 py-0.5 text-sm font-medium transition bg-neutral-800 text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Title */}
              <h1 className="text-neutral-100 mt-6 leading-tight h3 sm:h2">
                {page.data.title}
              </h1>

              {/* Description */}
              {page.data.description && (
                <p className="b1 mt-2 text-neutral-400 font-inter">
                  {page.data.description}
                </p>
              )}

              {/* Author info */}
              <div className="mt-12 flex gap-3 items-center">
                <div className="size-10 rounded-full overflow-hidden relative ring-1 ring-neutral-800">
                  {owner?.avatar_url ? (
                    <Image
                      src={owner.avatar_url}
                      alt={owner.name || owner.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/pras.jpg"
                      alt="PRAS"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div>
                  <p className="b1 text-neutral-100 font-medium">
                    {owner?.name || owner?.username || "PRAS Samin"}
                  </p>
                  <p className="c1 text-neutral-400 mt-0.5">{formattedDate}</p>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-12 py-4 border-y border-neutral-800 flex items-center gap-5 flex-wrap">
                <p className="c1 text-neutral-300 flex items-center gap-2">
                  <LuEye className="size-4 text-neutral-500" />
                  <span>{page.data.views || 0} views</span>
                </p>
                <p className="c1 text-neutral-300 flex items-center gap-2 ml-auto">
                  <LuBookOpen className="size-4 text-neutral-500" />
                  <span>{readingTimeText}</span>
                </p>
              </div>
            </div>

            {/* CHILD 1: Main Article & TOC Sidebar */}
            <section className="mt-6 md:flex md:gap-8">
              <article className="mdx prose mx-auto mt-4 w-full min-w-0 flex-1 transition-colors dark:prose-invert max-w-none">
                <MDX components={getMDXComponents(mdxComponents)} />
              </article>

              <aside className="hidden md:block w-64 shrink-0 py-4">
                {tocItems.length > 0 && (
                  <div className="sticky top-36 max-h-[calc(100vh-10rem)] overflow-hidden">
                    <RailToc items={tocItems} className="w-full" />
                  </div>
                )}
              </aside>
            </section>

            {/* CHILD 3: Share on Twitter / X Button */}
            <div className="flex items-center">
              <a
                className="relative group px-5 py-3 rounded-xl backdrop-blur-sm border border-transparent inline-flex items-center gap-2 mt-4 cursor-pointer bg-neutral-900/40 hover:bg-neutral-900/70 transition text-sm text-neutral-300 gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)]"
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`${origin}/blog/${fSlug}`)}&text=${encodeURIComponent(`I just read an article about ${page.data.title}${TWITTER_USERNAME && ` by @${TWITTER_USERNAME}`}.\n\n`)}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span>Share this article on</span>
                <svg
                  className="size-3.5 fill-current ml-0.5 text-neutral-300 group-hover:text-white transition"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>

            {/* CHILD 7: Recommendations Section */}
            <div className="mt-20">
              <h3 className="h3 text-neutral-100 font-bold leading-snug">
                <span>Other posts that you </span>
                <span className="inline-flex items-center gap-2 whitespace-nowrap align-baseline">
                  <span>might</span>
                  <span className="text-neutral-600 relative inline-block">
                    like
                    <svg
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-full"
                      fill="none"
                      height="6"
                      viewBox="0 0 59 6"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.64551 2.13477C19.9663 2.33536 38.4441 2.4829 56.7064 4.00476"
                        stroke="white"
                        strokeLinecap="round"
                        strokeWidth="3"
                      />
                    </svg>
                  </span>
                  <span className="font-vectra! text-accent font-black text-5xl ml-1 mt-5 leading-none inline-block">
                    love
                  </span>
                </span>
              </h3>
              <ul className="mt-4 flex flex-col divide-y divide-neutral-900">
                {recommendations.map((post) => (
                  <li key={post.slug} className="w-full py-3">
                    <BlogCard post={post} />
                  </li>
                ))}
              </ul>
            </div>

            {/* CHILD 8: Back to Blog Link */}
            <div className="mt-12 flex flex-col items-start gap-4">
              <Link
                className="inline-block underline text-neutral-300 transition-colors decoration-[color-mix(in_srgb,currentColor_30%,#171717)] hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] text-sm"
                href="/blog"
              >
                ← Back to blog
              </Link>
            </div>
          </div>
        </section>

        <TrackView type="blog" slug={fSlug} />
      </main>
      <Footer />
    </>
  );
};

export default BlogPage;

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  if (page.slugs.length === 0) {
    return metatag({
      title: `Blogs`,
      robots: "index, follow",
    });
  }

  return metatag({
    title: `${page.data.title}`,
    description: page.data.description,
    image: page.data.thumbnail,
    robots: "index, follow",
  });
}
