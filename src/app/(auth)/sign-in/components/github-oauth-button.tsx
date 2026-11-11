"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@heroui/react";
import { LuArrowRight, LuLoaderCircle } from "react-icons/lu";
import { FaGithub } from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/hooks/use-router";
import { toast } from "@heroui/react";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_request: "Invalid authentication request.",
  unauthorized: "You are not authorized to access the admin.",
  github_failed: "GitHub authentication failed. Please try again.",
};

export const GithubOAuthButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledRef = useRef(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Report any OAuth error the callback route sent back (?error=...).
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;

    toast.danger(ERROR_MESSAGES[error] || "Authentication failed.");
    const url = new URL(window.location.href);
    url.searchParams.delete("error");
    window.history.replaceState(null, "", url.toString());
  }, [searchParams]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code || calledRef.current) return;

    calledRef.current = true;
    setIsAuthenticating(true);

    // Full page navigation — the callback route sets the session cookie
    // and 302-redirects to /admin on success (or back to /sign-in?error=…).
    window.location.assign(
      `/api/auth/github/callback?code=${encodeURIComponent(code)}`,
    );
  }, [searchParams]);

  return (
    <button
      ref={btnRef}
      type="button"
      disabled={isAuthenticating}
      onMouseMove={handleMouseMove}
      onClick={async () => {
        setIsAuthenticating(true);
        await router.push("/api/auth/github");
      }}
      className={cn(
        "group relative w-full h-13 px-3 rounded-xl border border-white/10 bg-white/4 text-foreground font-medium text-sm transition-all duration-200 overflow-hidden cursor-pointer",
        "hover:border-accent/20 hover:bg-white/[0.07] hover:shadow-lg hover:shadow-accent/5",
        "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
      {...props}
    >
      {/* Magnetic spotlight glow that tracks cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(140px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(255, 255, 255, 0.08), transparent 70%)`,
        }}
        aria-hidden="true"
      />

      {/* Button content */}
      <div className="relative z-10 flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-white/6 border border-white/8 flex items-center justify-center text-white shrink-0 group-hover:border-white/15 transition-colors">
            {isAuthenticating ? (
              <LuLoaderCircle className="size-4 animate-spin text-accent" />
            ) : (
              <FaGithub className="size-4.5" />
            )}
          </div>
          <span className="font-medium text-neutral-100 tracking-tight">
            {isAuthenticating ? "Connecting to GitHub..." : "Continue with GitHub"}
          </span>
        </div>

        <div className="flex items-center justify-center size-7 rounded-lg text-neutral-400 group-hover:text-white transition-colors">
          <LuArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};
