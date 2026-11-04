import Image from "next/image";
import { GithubOAuthButton } from "@/components/GithubOAuthButton";
import { Info } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { Link } from "@/components/Link";
import { metatag } from "@/lib/metatag";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="bg-card/80 w-full max-w-[95%] lg:max-w-4xl h-[80vh] rounded-2xl shadow-lg grid md:grid-cols-2 grid-rows-2 md:grid-rows-none overflow-hidden relative">
      {/* Left Section (Anime Collage) */}
      <div className="relative">
        <div className="absolute inset-0 bg-linear-to-t from-card via-card/60 to-card/50 z-10" />
        <Image
          src="/assets/anime_collage.png"
          width={1000}
          height={1000}
          className="w-full h-full object-cover object-center"
          style={{
            maskImage:
              "radial-gradient(circle, rgba(0, 0, 0, 1) 40%, rgba(0, 0, 0, 0) 100%)",
          }}
          alt="Anime"
        />

        <Tooltip
          noDelay
          content={
            <span className="mt-24 px-3 py-2 text-sm text-foreground/80 bg-card/90 border-border/50">
              This background image is a custom collage featuring my favorite
              anime characters. Since this website is a reflection of my
              personality, I wanted to incorporate elements that resonate with
              me, creating a unique and personal touch.
            </span>
          }
        >
          <Info className="text-foreground/70 absolute top-4 left-4 z-10 cursor-pointer" />
        </Tooltip>
      </div>

      {/* Right Section (Login Content) */}
      <div className="flex flex-col items-center justify-evenly md:justify-center gap-0 md:gap-16 px-8 md:px-10 space-y-2 w-full relative">
        <div className="flex flex-col gap-2 items-center justify-center">
          <h2 className="text-3xl font-bold text-center">
            Welcome
            {/* <span className="line-through opacity-5">to</span> */}{" "}
            <Link href={"/"}>
              <span className="font-frozito text-transparent bg-clip-text bg-linear-to-r from-theme-primary to-theme-secondary">
                PRAS
              </span>
            </Link>
          </h2>
          {/* <p className="text-gray-600 text-center">
                Please authenticate to continue.
              </p> */}
          <p className="text-gray-600 text-center">
            Please authenticate as admin.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full items-center justify-center">
          <Suspense>
            <GithubOAuthButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export const generateMetadata = () => {
  return metatag({
    title: "Sign In | PRAS",
    robots: "noindex, nofollow",
  });
};
