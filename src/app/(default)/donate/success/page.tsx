import { Link } from "@/components/Link";
import { LuArrowRight, LuHeart } from "react-icons/lu";

export default function DonateSuccessPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-24">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-80 w-[30rem] rounded-full bg-accent/[0.04] blur-3xl" />

      <div className="layout relative z-10 max-w-md text-center">
        <div className="isolate before:transition-opacity size-12 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm mx-auto gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
          <LuHeart className="size-[45%] text-accent" />
        </div>

        <h1 className="mt-6 h3 font-bold font-rethink text-white">Thank you</h1>
        <p className="b1 text-neutral-400 mt-3 leading-relaxed">
          Your support means a lot — it keeps this site, the open-source tools,
          and the writing going.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold px-6 h-11 transition-all duration-200 hover:bg-accent/90"
          >
            Back to home
            <LuArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
