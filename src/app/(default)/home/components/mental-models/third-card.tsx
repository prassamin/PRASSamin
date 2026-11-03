"use client";

import { Link } from "@/components/Link";
import { cardItemVariants } from "./motion";
import { motion, type Variants } from "framer-motion";

export const ThirdCard = () => {
  return (
    <motion.div variants={cardItemVariants as Variants} className="z-10">
      <Link
        className="group aspect-square py-10 px-8 rounded-xl bg-neutral-950 border border-neutral-900 text-left flex flex-col justify-end overflow-hidden transition duration-500 hover:brightness-[150%] w-80 lg:rotate-[4deg]"
        href="/#featured-posts"
        style={
          {
            background:
              "radial-gradient(ellipse at 50% 38%, #1c1c1c 0%, #0a0a0a 75%)",
            boxShadow: "0 0 100px 20px rgba(0, 0, 0, 0.35) inset",
          } as React.CSSProperties
        }
      >
        <div className="relative h-[7.5rem] grid grid-cols-[repeat(2,3.5rem)] gap-2 mb-auto">
          <div className="absolute inset-0 grid grid-cols-[repeat(6,3.5rem)] grid-rows-[repeat(3,3.5rem)] gap-2 opacity-10 -translate-y-[4rem] -translate-x-[4rem] pointer-events-none">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="relative isolate before:transition-opacity w-14 h-14 rounded-2xl gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
              />
            ))}
          </div>
          <div
            className="relative isolate before:transition-opacity w-14 h-14 rounded-2xl animate-block-1 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
            style={
              {
                boxShadow:
                  "rgba(255, 255, 255, 0.14) 0px 0px 15px inset, rgba(255, 255, 255, 0.03) 0px 27px 40px",
              } as React.CSSProperties
            }
          />
          <div
            className="relative isolate before:transition-opacity w-14 h-14 rounded-2xl animate-block-2 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
            style={
              {
                boxShadow:
                  "rgba(255, 255, 255, 0.14) 0px 0px 15px inset, rgba(255, 255, 255, 0.03) 0px 27px 40px",
              } as React.CSSProperties
            }
          />
          <div
            className="relative isolate before:transition-opacity w-14 h-14 rounded-2xl animate-block-3 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
            style={
              {
                boxShadow:
                  "rgba(255, 255, 255, 0.14) 0px 0px 15px inset, rgba(255, 255, 255, 0.03) 0px 27px 40px",
              } as React.CSSProperties
            }
          />
          <div
            className="relative isolate before:transition-opacity w-14 h-14 rounded-2xl animate-block-4 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent"
            style={
              {
                boxShadow:
                  "rgba(255, 255, 255, 0.14) 0px 0px 15px inset, rgba(255, 255, 255, 0.03) 0px 27px 40px",
              } as React.CSSProperties
            }
          />
        </div>
        <h2 className="underline decoration-transparent group-hover:decoration-current group-focus:decoration-current transition-colors duration-200 text-2xl sm:text-[1.75rem] font-bold tracking-tight text-white leading-tight">
          And More!
        </h2>
        <p className="b2 text-neutral-500 mt-2">
          Thoughts and mental models about full-stack development.
        </p>
      </Link>
    </motion.div>
  );
};
