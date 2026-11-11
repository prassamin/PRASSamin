"use client";
import { LuSignpost } from "react-icons/lu";
import { motion } from "framer-motion";
import { cn } from "@heroui/styles";
import { Link } from "@/components/link";

export default function NotFound() {
  return (
    <div className="layout flex min-h-screen flex-col items-center justify-center text-center text-white">
      <div className="before:transition-opacity rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm size-12 gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
        <LuSignpost className="size-5" />
      </div>
      <h1 className="h3 mt-4">Looks like you&apos;ve taken a wrong turn.</h1>
      <Link
        className="inline-block underline text-neutral-300 transition-colors decoration-[color-mix(in_srgb,currentColor_30%,#171717)] hover:decoration-current focus:decoration-current active:decoration-[color-mix(in_srgb,currentColor_65%,#171717)] mt-4"
        href="/"
      >
        <motion.p
          className={cn(
            "bg-[linear-gradient(110deg,#909090,35%,#fff,50%,#909090,75%,#909090)] bg-size-[200%_100%] bg-clip-text text-base text-transparent select-none",
          )}
          initial={{ backgroundPosition: "200% 0" }}
          animate={{ backgroundPosition: "-200% 0" }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          Back to Home
        </motion.p>
      </Link>
    </div>
  );
}
