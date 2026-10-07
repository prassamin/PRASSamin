"use client";
import { cn } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Github } from "./icons";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "@heroui/react";
import axios, { AxiosError } from "axios";

export const GithubOAuthButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const calledRef = useRef(false);

  const handleSignIn = async (code: string) => {
    try {
      setIsAuthenticating(true);
      const res = await axios.get(`/api/auth/github/callback`, {
        params: {
          code,
        },
        timeout: 15000,
      });

      toast.success(res.data.message);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data.message) {
        toast.danger(error.response?.data.message);
      }
      toast.danger("Something went wrong");
    } finally {
      setIsAuthenticating(false);

      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState(null, "", url.toString());
    }
  };

  useEffect(() => {
    const code = searchParams.get("code");
    if (code && !calledRef.current) {
      calledRef.current = true;
      handleSignIn(code);
    }
  }, [searchParams]);

  return (
    <button
      className={cn(
        "flex items-center justify-center w-full gap-3 rounded-lg border border-muted-foreground/20 px-4 py-2 text-sm font-medium shadow-md transition-all active:shadow-xs focus:ring-2 bg-muted text-foreground hover:bg-muted/70 focus:ring-muted-foreground/30 focus:bg-muted/70 [&_svg]:size-6 font-sans cursor-pointer",
        className,
      )}
      onClick={async () => {
        setIsAuthenticating(true);
        await router.push("/api/auth/github");
      }}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {isAuthenticating ? <Loader2 className="animate-spin" /> : <Github />}
        <span className="w-full capitalize">Github</span>
      </div>
    </button>
  );
};
