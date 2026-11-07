"use client";

import React, { useRef, useState } from "react";
import { LuArrowRight, LuHeart } from "react-icons/lu";
import { Spinner, Switch, toast } from "@heroui/react";
import { Reveal } from "@/components/reveal";
import { PenSwoopUnderline } from "@/components/pen-swoop-underline";
import { Tape } from "@/components/tape";
import { SupportWatermark } from "./components/watermark";
import { DONATION_MODES } from "@/constants/env";
import { cn } from "@heroui/react";
import { motion } from "framer-motion";

const PRESET_AMOUNTS = [5, 10, 25, 50];
type DonationMode = "once" | "monthly";

const DEFAULT_MODE: DonationMode = DONATION_MODES.monthly
  ? "monthly"
  : "once";

export default function DonatePage() {
  const [mode, setMode] = useState<DonationMode>(DEFAULT_MODE);
  const [amount, setAmount] = useState<number | "">(10);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setCursorPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const displayAmount = amount === "" ? customAmount : String(amount);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalAmount = amount === "" ? parseFloat(customAmount) : amount;
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      toast.danger("Please choose or enter a valid amount.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/donate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          name,
          email,
          message,
          socialUrl,
          recurring: mode === "monthly",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Something went wrong.");
      }
    } catch (error: any) {
      toast.danger(error.message);
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full h-11 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 text-sm text-foreground placeholder:text-neutral-500 outline-none transition-colors focus:border-accent/50 focus:ring-1 focus:ring-accent/30";

  return (
    <div className="relative min-h-screen overflow-hidden pt-28 md:pt-36 pb-12 md:pb-20">
      {/* Dot-grid paper texture */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.06) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Watermark typography (hand-drawn path) */}
      <SupportWatermark />

      <div className="layout relative z-10 max-w-2xl">
        <Reveal>
          <div className="text-center mb-12 flex flex-col items-center">
            <div className="isolate before:transition-opacity size-11 rounded-xl flex items-center justify-center relative bg-white/5 backdrop-blur-sm gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
              <LuHeart className="size-[45%] text-neutral-300" />
            </div>

            <h1 className="mt-5 h2 sm:h1 font-bold font-rethink text-white">
              Support my{" "}
              <span className="relative inline-block bg-linear-to-br from-accent/30 via-accent/90 to-accent/30 bg-clip-text text-transparent">
                work
                <PenSwoopUnderline />
              </span>
            </h1>

            <p className="b1 mt-3">
              <span className="transition-colors bg-linear-to-r from-neutral-300/35 via-neutral-300/90 to-neutral-300/35 bg-clip-text text-transparent">
                Supporting the work behind the things I ship.
              </span>
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            {/* Offset paper back-layer */}
            <div
              className="absolute inset-0 m-5 rounded-2xl border border-neutral-900 bg-neutral-925/80"
              style={{ transform: "rotate(2deg)" }}
              aria-hidden="true"
            />

            {/* Pinned pledge card */}
            <form
              onSubmit={handleDonate}
              className="relative rounded-2xl border border-neutral-800 bg-neutral-925/90 shadow-2xl overflow-visible"
            >
              {/* Hand-drawn tape */}
              <Tape className="absolute z-20 -top-4 -left-6 w-24! h-7! opacity-80 -rotate-12" />

              {/* Top highlight line */}
              <div
                className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(0,0,0,0)_5%,rgba(255,255,255,0.5)_35%,rgb(255,255,255)_50%,rgba(255,255,255,0.5)_65%,rgba(0,0,0,0)_95%)]"
                aria-hidden="true"
              />

              <div className="relative p-6 md:p-8 space-y-7">
                {/* Donation Mode — switch only when both modes are configured */}
                {DONATION_MODES.once && DONATION_MODES.monthly && (
                  <div className="flex items-center justify-end">
                    <Switch
                      isSelected={mode === "monthly"}
                      onChange={(selected) =>
                        setMode(selected ? "monthly" : "once")
                      }
                      aria-label="Monthly donation"
                    >
                      <Switch.Content>
                        <Switch.Control>
                          <Switch.Thumb />
                        </Switch.Control>
                        <span className="text-sm font-medium text-neutral-300">
                          Monthly
                        </span>
                      </Switch.Content>
                    </Switch>
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-3">
                  <span className="block text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Amount
                  </span>
                  <div className="grid grid-cols-4 gap-2.5">
                    {PRESET_AMOUNTS.map((value) => {
                      const isSelected = amount === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setAmount(value);
                            setCustomAmount("");
                          }}
                          className={cn(
                            "h-14 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1",
                            isSelected
                              ? "bg-accent/15 border-transparent text-accent"
                              : "border-neutral-800 bg-white/2 text-neutral-300 hover:border-neutral-700 hover:text-white",
                          )}
                        >
                          <span>${value}</span>
                          {mode === "monthly" && (
                            <span className="text-[10px] font-medium text-neutral-500">
                              /mo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500">
                      $
                    </span>
                    <input
                      type="number"
                      min={1}
                      step={1}
                      placeholder="Custom amount"
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount("");
                      }}
                      className={cn(
                        inputClass,
                        "pl-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                      )}
                    />
                  </div>
                </div>

                {/* Dashed divider with heart note */}
                <div
                  className="relative flex items-center gap-3"
                  aria-hidden="true"
                >
                  <div className="h-px flex-1 border-t border-dashed border-neutral-800" />
                  <LuHeart className="size-3.5 text-neutral-600" />
                  <div className="h-px flex-1 border-t border-dashed border-neutral-800" />
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <span className="block text-xs font-medium text-neutral-300 uppercase tracking-wider">
                    Your details{" "}
                    <span className="text-neutral-500">(optional)</span>
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <textarea
                    placeholder="Leave a message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    className={cn(inputClass, "h-auto py-3 resize-none")}
                  />
                  <input
                    type="url"
                    placeholder="Social / profile URL"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <button
                  ref={btnRef}
                  type="submit"
                  disabled={isLoading}
                  onMouseMove={handleMouseMove}
                  style={
                    {
                      "--cursorX": `${cursorPos.x}px`,
                      "--cursorY": `${cursorPos.y}px`,
                    } as React.CSSProperties
                  }
                  className="group relative bg-[rgba(112,255,195,0.06)] w-full px-6 py-3.5 rounded-xl backdrop-blur-sm border border-transparent inline-flex items-center justify-center gap-3 text-white font-rethink text-sm font-medium transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Gradient border rotating with cursor */}
                  <motion.div
                    className="pointer-events-none select-none absolute -inset-1 p-px composite-exclude group-active:opacity-80 transition-opacity overflow-hidden"
                    style={{ borderRadius: "13px" }}
                  >
                    <motion.div
                      className="h-400"
                      style={{
                        transform:
                          "translate(calc(var(--cursorX) - 50%), calc(var(--cursorY) - 50%)) rotate(80deg)",
                        background:
                          "#242424 radial-gradient(ellipse at center center, rgba(112, 255, 195, 0.45), rgba(40, 40, 40, 100%) 24%)",
                      }}
                    />
                  </motion.div>

                  <motion.p
                    className={cn(
                      "bg-[linear-gradient(110deg,#909090,35%,#fff,50%,#909090,75%,#909090)] bg-size-[200%_100%] bg-clip-text text-base text-transparent select-none",
                    )}
                    initial={{ backgroundPosition: "200% 0" }}
                    animate={{ backgroundPosition: "-200% 0" }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "linear",
                    }}
                  >
                    <span>Donate ${displayAmount || "0"}{mode === "monthly" ? "/mo" : ""}</span>
                  </motion.p>

                  {/* Glass Icon with Arrow */}
                  <span className="isolate before:transition-opacity size-6 rounded-lg flex items-center justify-center relative bg-white/5 backdrop-blur-sm z-10 gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] border border-transparent">
                    <LuArrowRight className="text-accent-300 group-hover:translate-x-0.5 transition-transform duration-200" />
                  </span>
                </button>
              </div>
            </form>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-center text-xs text-neutral-500 mt-6">
            Payments are processed securely by Polar. You&apos;ll be redirected
            to checkout to complete the donation.
          </p>
        </Reveal>
      </div>
    </div>
  );
}
