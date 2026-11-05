"use client";

import React from "react";
import { DiRedis, DiNodejsSmall } from "react-icons/di";
import { BiLogoTypescript, BiLogoGoLang, BiLogoPostgresql } from "react-icons/bi";
import { SiTailwindcss, SiNextdotjs } from "react-icons/si";
import { Tooltip } from "@/components/ui/tooltip";
import { Link } from "@/components/Link";
import { cn } from "@heroui/styles";

type IconType = React.SVGProps<SVGSVGElement>;
const STACKS = [
  {
    name: "Next.js",
    Icon: ({ className, ...props }: IconType) => (
      <SiNextdotjs className={cn("size-6", className)} {...props} />
    ),
    description: (
      <>
        My framework for everything that ships to a browser: static generation
        when I can, server code when I must, and one deploy pipeline from idea
        to production with the App Router.
      </>
    ),
    href: "https://nextjs.org",
  },
  {
    name: "TypeScript",
    Icon: ({ className, ...props }: IconType) => (
      <BiLogoTypescript className={cn("size-7.5", className)} {...props} />
    ),
    description: (
      <>
        The language I reach for by default. Types are the cheapest form of
        documentation, and they make refactoring feel like a safety net instead
        of a gamble.
      </>
    ),
    href: "https://www.typescriptlang.org",
  },
  {
    name: "Tailwind CSS",
    Icon: ({ className, ...props }: IconType) => (
      <SiTailwindcss className={cn("size-9", className)} {...props} />
    ),
    description: (
      <>
        Utility-first CSS that keeps my styling consistent and my bundle lean. I
        love how fast iteration feels when I never have to invent class names.
      </>
    ),
    href: "https://tailwindcss.com",
  },
  {
    name: "Node.js",
    Icon: ({ className, ...props }: IconType) => (
      <DiNodejsSmall className={cn("size-7.5", className)} {...props} />
    ),
    description: (
      <>
        My backend of choice: from API routes to CLIs, Node lets me share one
        language across the whole stack. Streams, event loop, and the largest
        ecosystem out there.
      </>
    ),
    href: "https://nodejs.org",
  },
  {
    name: "Go",
    Icon: ({ className, ...props }: IconType) => (
      <BiLogoGoLang className={cn("size-14", className)} {...props} />
    ),
    description: (
      <>
        My language for backend services and fast, single-binary CLI tools.
        It just feels honest: simple, compiled, and quick to ship. Static
        typing without the ceremony.
      </>
    ),
    href: "https://go.dev",
  },
  {
    name: "Redis",
    Icon: ({ className, ...props }: IconType) => (
      <DiRedis className={cn("size-10", className)} {...props} />
    ),
    description: (
      <>
        Where I keep the fast data: caching, queues, and realtime state.
        Rock-solid and a joy to operate. When in doubt, reach for Redis.
      </>
    ),
    href: "https://redis.io",
  },
  {
    name: "PostgreSQL",
    Icon: ({ className, ...props }: IconType) => (
      <BiLogoPostgresql className={cn("size-7", className)} {...props} />
    ),
    description: (
      <>
        My database of choice for anything that needs to live forever:
        relational integrity, rich queries, and extensions that keep up
        with whatever I throw at it.
      </>
    ),
    href: "https://www.postgresql.org",
  },
];

export const TechStack: React.FC = () => {
  return (
    <div className="mt-6 flex items-center gap-4 md:gap-6 flex-wrap">
      {STACKS.map(({ name, Icon, description, href }) => (
        <Tooltip
          key={name}
          delay={100}
          placement="top"
          showArrow
          content={
            <div className="max-w-xs p-1.5 break-normal">
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-neutral-300">{<Icon className="size-5"/>}</span>
                <div className="flex items-center gap-0.5">
                  {href ? (
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block underline text-neutral-300 transition-colors decoration-[color-mix(in_srgb,_currentColor_30%,_#171717)] hover:decoration-current focus:decoration-current default-ring b1 font-semibold cursor-newtab"
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="b1 font-semibold text-neutral-200">
                      {name}
                    </span>
                  )}
                </div>
              </div>
              <p className="b2 text-neutral-300 mt-1.5 leading-relaxed">
                {description}
              </p>
            </div>
          }
        >
          <button
            className="default-ring rounded-lg text-neutral-400 hover:text-white transition-colors duration-200 focus:outline-none"
            aria-label={name}
          >
            {<Icon/>}
          </button>
        </Tooltip>
      ))}
    </div>
  );
};
