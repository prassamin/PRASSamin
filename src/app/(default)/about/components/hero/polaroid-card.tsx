"use client";

import React from "react";
import Image from "next/image";
import { useOwner } from "@/providers/OwnerProvider";
import { Tape } from "./tape";

export const PolaroidCard: React.FC = () => {
  const { owner } = useOwner();
  return (
    <div className="w-full md:ml-14 max-w-[21rem] shrink-0">
      <div className="relative p-8 select-none">
        <Tape />

        {/* Front Card (Rotated -5deg) */}
        <div
          className="relative bg-black p-6 pb-20 border-neutral-800 border transition-transform duration-300 shadow-xl"
          style={{ zIndex: 2, transform: "rotate(-5deg)" }}
        >
          {/* Subtle gradient border */}
          <div className="isolate before:transition-opacity absolute inset-0 gradient-border gb-color-[linear-gradient(to_bottom_right,_rgba(23,_23,_23,_70%)_0%,_#525252_62%,_rgba(23,_23,_23,_70%)_100%)] border-1 border-transparent pointer-events-none" />

          {/* Photo frame */}
          <figure className="isolate z-[1] overflow-hidden select-none object-cover rounded-sm">
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

          {/* Signature */}
          <div
            className="absolute bottom-6 right-5 pointer-events-none"
            style={{ clipPath: "polygon(0% 0%, 105% 0%, 105% 100%, 0% 100%)" }}
          >
            <Image
              src="/assets/signature.svg"
              alt="Signature"
              width={114}
              height={39}
              className="w-[114px] h-[39px]"
            />
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
