"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useInView } from "motion/react";
import { useOwner } from "@/providers/owner-provider";
import { Tape } from "@/components/tape";
import { AnimatedSignature } from "./signature";

export const PolaroidCard: React.FC = () => {
  const { owner } = useOwner();
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, amount: 0.1 });

  return (
    <div className="w-full md:ml-14 max-w-84 shrink-0" ref={cardRef}>
      <div className="relative p-8 select-none">
        <Tape />

        {/* Front Card (Rotated -5deg) */}
        <div
          className="relative bg-black p-6 pb-20 border-neutral-800 border transition-transform duration-300 shadow-xl"
          style={{ zIndex: 2, transform: "rotate(-5deg)" }}
        >
          {/* Subtle gradient border */}
          <div className="isolate before:transition-opacity absolute inset-0 gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent pointer-events-none" />

          {/* Photo frame */}
          <figure className="isolate z-1 overflow-hidden select-none object-cover rounded-sm">
            <div className="relative w-full aspect-square overflow-hidden bg-neutral-900">
              {owner?.avatar_url && (
                <Image
                  src={owner?.avatar_url}
                  alt={owner.username}
                  fill
                  sizes="(max-width: 768px) 100vw, 350px"
                  className="h-full w-full object-cover"
                  priority
                />
              )}
            </div>
          </figure>

          {/* Signature — animated handwriting reveal */}
          <div className="absolute bottom-6 right-5 pointer-events-none select-none">
            <AnimatedSignature inView={inView} />
          </div>
        </div>

        {/* Back Card (Rotated 5deg) */}
        <div
          className="absolute inset-0 bg-black m-8 p-6 pb-20 border-neutral-800 border transition-transform duration-300 pointer-events-none shadow-md"
          style={{ zIndex: 1, transform: "rotate(5deg)" }}
        ></div>
      </div>
    </div>
  );
};
