"use client";

import React from "react";
import Link from "next/link";
import { LuEye } from "react-icons/lu";
import type { QueryBlogs } from "@/lib/get-blogs";
import { Reveal } from "./reveal";

type RetroItem = QueryBlogs["blogs"][number] & { year: string };

interface Props {
  retros: RetroItem[];
}

export const AboutRetro: React.FC<Props> = ({ retros }) => {
  if (retros.length === 0) return null;

  return (
    <section className="overflow-x-hidden relative w-full" id="retro">
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none select-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Reveal>
        <div className="layout relative py-20 flex flex-col lg:flex-row lg:gap-24 gap-12">
        {/* Left column */}
        <div>
          <div className="isolate before:transition-opacity glass-icon size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm -rotate-5 gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
            {/* Trend Up Icon */}
            <svg
              className="size-[45%] text-neutral-300"
              fill="none"
              height="20"
              strokeWidth="1.3"
              viewBox="0 0 20 20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18.1255 16.2498C18.1255 16.4155 18.0596 16.5745 17.9424 16.6917C17.8252 16.8089 17.6662 16.8748 17.5005 16.8748H2.50049C2.33473 16.8748 2.17576 16.8089 2.05855 16.6917C1.94134 16.5745 1.87549 16.4155 1.87549 16.2498V3.74976C1.87549 3.584 1.94134 3.42502 2.05855 3.30781C2.17576 3.1906 2.33473 3.12476 2.50049 3.12476C2.66625 3.12476 2.82522 3.1906 2.94243 3.30781C3.05964 3.42502 3.12549 3.584 3.12549 3.74976V12.2412L7.0583 8.30757C7.11635 8.24946 7.18528 8.20336 7.26115 8.17191C7.33702 8.14045 7.41835 8.12426 7.50049 8.12426C7.58262 8.12426 7.66395 8.14045 7.73983 8.17191C7.8157 8.20336 7.88463 8.24946 7.94268 8.30757L10.0005 10.3662L14.1169 6.24976H12.5005C12.3347 6.24976 12.1758 6.18391 12.0585 6.0667C11.9413 5.94949 11.8755 5.79052 11.8755 5.62476C11.8755 5.459 11.9413 5.30002 12.0585 5.18281C12.1758 5.0656 12.3347 4.99976 12.5005 4.99976H15.6255C15.7912 4.99976 15.9502 5.0656 16.0674 5.18281C16.1846 5.30002 16.2505 5.459 16.2505 5.62476V8.74976C16.2505 8.91552 16.1846 9.07449 16.0674 9.1917C15.9502 9.30891 15.7912 9.37476 15.6255 9.37476C15.4597 9.37476 15.3008 9.30891 15.1835 9.1917C15.0663 9.07449 15.0005 8.91552 15.0005 8.74976V7.13335L10.4427 11.6919C10.3846 11.7501 10.3157 11.7962 10.2398 11.8276C10.164 11.8591 10.0826 11.8752 10.0005 11.8752C9.91835 11.8752 9.83702 11.8591 9.76115 11.8276C9.68528 11.7962 9.61635 11.7501 9.5583 11.6919L7.50049 9.63335L3.12549 14.0083V15.6248H17.5005C17.6662 15.6248 17.8252 15.6906 17.9424 15.8078C18.0596 15.925 18.1255 16.084 18.1255 16.2498Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h2 className="h2 mt-8">
            Learn about my growth
          </h2>
          <p className="b1 text-neutral-400 mt-6 max-w-lg">
            Every year, I share my progress both in career and personal life. Here&apos;s how it&apos;s going
          </p>
        </div>

        {/* Right column: Cards */}
        <div className="flex flex-col gap-6 relative">
          {/* Vertical timeline line */}
          <div
            className="shrink-0 h-full w-px absolute top-0 left-8 bg-neutral-900 pointer-events-none"
            data-orientation="vertical"
            role="none"
          />

          {retros.map((item) => (
            <div key={item.year} className="group">
              <Link
                className="block h-full rounded-md default-ring"
                href={item.url}
              >
                <div className="isolate relative px-6 py-9 rounded-xl border border-neutral-900 bg-neutral-925/80 hover:border-neutral-800 transition-all duration-300 overflow-hidden backdrop-blur-xs">
                  {/* Huge background Year watermarked */}
                  <span
                    className="absolute z-[-1] -right-4 -bottom-8 text-9xl font-rethink font-extrabold text-neutral-900 select-none pointer-events-none"
                    style={{
                      maskImage:
                        "linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 110%)",
                      WebkitMaskImage:
                        "linear-gradient(rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 110%)",
                      textShadow:
                        "-0.3px 0 rgba(82, 82, 82, 0.8), 0 0.3px rgba(82, 82, 82, 0.8), 0.3px 0 rgba(82, 82, 82, 0.8), 0 -0.3px rgba(82, 82, 82, 0.8)",
                    }}
                  >
                    {item.year}
                  </span>

                  {/* Views count */}
                  <div className="flex items-center gap-1.5 text-neutral-500">
                    <LuEye className="size-3.5 shrink-0" strokeWidth={2} />
                    <p className="c1 text-xs">{(item.views ?? 0).toLocaleString()} views</p>
                  </div>

                  {/* Title with subtle gradient hover */}
                  <h3 className="h5 mt-3 relative">
                    <span
                      aria-hidden="true"
                      className="bg-linear-to-r from-accent/30 via-accent/90 to-accent/30 box-decoration-clone group-hover:opacity-40 opacity-0 transition duration-300 text-transparent"
                    >
                      {item.title}
                    </span>
                    <span className="absolute left-0 top-0">
                      {item.title}
                    </span>
                  </h3>

                  {/* Description */}
                  <p className="b2 text-neutral-300 mt-2 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
        </div>
      </Reveal>
    </section>
  );
};
