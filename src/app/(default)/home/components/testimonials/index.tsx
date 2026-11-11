"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link } from "@/components/link";
import {
  LuLaptop as Laptop,
  LuPencilLine as PencilLine,
  LuGraduationCap as GraduationCap,
  LuArrowLeft as ArrowLeft,
  LuArrowRight as ArrowRight,
} from "react-icons/lu";
import { motion, type Variants } from "framer-motion";
import { BackgroundText } from "./background-text";
import { Arrow } from "./arrow";
import { cn } from "@heroui/react";
import MDXContent from "@/components/mdx/mdx-content";
import type { TestimonialType } from "@/types";

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  isGuestBookLink?: boolean;
  avatar: string;
}

interface TestimonialsProps {
  testimonials?: TestimonialType[];
}

interface TestimonialCardProps {
  category: string;
  icon: React.ReactNode;
  testimonials: TestimonialItem[];
  initialIndex?: number;
  className?: string;
  autoPlayInterval?: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  category,
  icon,
  testimonials,
  initialIndex = 0,
  className = "",
  autoPlayInterval = 6000,
}) => {
  const safeInitialIndex =
    testimonials.length > 0
      ? Math.min(Math.max(0, initialIndex), testimonials.length - 1)
      : 0;
  const [index, setIndex] = useState(safeInitialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const hasMultiple = testimonials.length > 1;

  useEffect(() => {
    if (index >= testimonials.length && testimonials.length > 0) {
      setIndex(0);
    }
  }, [testimonials.length, index]);

  const handlePrev = () => {
    setIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!hasMultiple || isPaused || autoPlayInterval <= 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, autoPlayInterval, testimonials.length]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-900 bg-neutral-925 min-h-87.5 sm:min-h-92.5 h-full",
        className,
      )}
    >
      {/* Top Header Tag */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <p className="c1 text-neutral-400 uppercase flex items-center gap-1.5 text-xs tracking-wider font-mono">
          {category}
          {icon}
        </p>
      </div>

      {/* Prev / Next Carousel Controls */}
      {hasMultiple && (
        <div className="absolute top-5.25 right-5.5 z-10 flex items-center gap-0.5 bg-white/5 backdrop-blur-sm p-0.5 rounded-md border border-white/5">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="transition-colors p-1 rounded hover:bg-white/8 text-neutral-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="transition-colors p-1 rounded hover:bg-white/8 text-neutral-400 hover:text-white cursor-pointer"
          >
            <ArrowRight className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Edge gradient masks */}
      <div className="absolute inset-y-0 left-0 w-5 rounded-l-xl bg-linear-to-r from-neutral-925 to-neutral-925/20 pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-5 rounded-r-xl bg-linear-to-l from-neutral-925 to-neutral-925/20 pointer-events-none z-10" />

      {/* Carousel Track with all testimonials placed side-by-side */}
      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
        <motion.div
          className="flex h-full w-full"
          animate={{ x: `-${index * 100}%` }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name + i}
              className="flex min-w-full w-full shrink-0 flex-col justify-between h-full p-6 pt-14"
            >
              <div className="flex-1">
                <MDXContent
                  content={t.quote}
                  className="b2 text-neutral-300 text-sm leading-relaxed mt-2 [&_p]:my-0"
                />
              </div>
              {/* Author Footer */}
              <div className="flex items-center gap-3 mt-auto pt-6">
                <div className="relative size-9 shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="overflow-hidden select-none pointer-events-none object-cover size-9 rounded-full bg-neutral-900 border border-neutral-800"
                  />
                </div>
                <div className="min-w-0">
                  <p className="s2 text-white text-sm font-semibold truncate font-rethink">
                    {t.name}
                  </p>
                  <p className="c1 text-neutral-400 text-xs mt-0.5 truncate">
                    {t.isGuestBookLink ? (
                      <>
                        via{" "}
                        <Link
                          href="/guestbook"
                          className="inline-block underline text-neutral-300 hover:text-white transition-colors"
                        >
                          Guest Book
                        </Link>
                      </>
                    ) : (
                      t.role
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export const Testimonials: React.FC<TestimonialsProps> = ({
  testimonials = [],
}) => {
  // Map DB testimonials by category → card. Each card gets its matching items;
  // falls back to an empty list if none exist for that category.
  const softwareEngineerTestimonials: TestimonialItem[] = testimonials
    .filter((t) => t.category === "SOFTWARE_ENGINEER")
    .map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatar: t.avatar || "/assets/avatar.svg",
    }));

  const writerTestimonials: TestimonialItem[] = testimonials
    .filter((t) => t.category === "GUESTBOOK")
    .map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      isGuestBookLink: true,
      avatar: t.avatar || "/assets/avatar.svg",
    }));

  const mentorTestimonials: TestimonialItem[] = testimonials
    .filter((t) => t.category === "MENTOR")
    .map((t) => ({
      quote: t.quote,
      name: t.name,
      role: t.role,
      avatar: t.avatar || "/assets/avatar.svg",
    }));

  return (
    <motion.section
      id="testimonials"
      className="relative overflow-hidden w-full"
      variants={sectionVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {/* Background Dot Grid */}
      <div
        className="absolute inset-0 -z-10 h-full w-full pointer-events-none select-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Giant "Testimonials" Background Typography SVG */}
      <BackgroundText />

      <div className="layout py-12 md:py-20 flex flex-col items-center">
        {/* Header: "Some good words" */}
        <motion.div variants={titleVariants} className="relative">
          <h2 className="h3 sm:h2 font-vectra!">Some good words</h2>
          <svg
            className="absolute right-0 z-[-1] bottom-1 stroke-neutral-300 w-44.5 sm:w-56 pointer-events-none select-none"
            width="224"
            height="3"
            viewBox="0 0 224 3"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0.500244 1.63051C8.87551 2.3919 17.451 1.9251 25.8672 1.9251C68.0427 1.9251 110.216 1.63051 152.391 1.63051C171.006 1.63051 189.616 1.33593 208.231 1.33593C212.099 1.33593 215.967 1.36279 219.835 1.33593C220.447 1.33168 222.926 0.77558 223.206 1.33593"
              strokeWidth="0.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>

        <div
          className={cn(
            "grid grid-cols-1 gap-8 lg:grid-cols-3 items-center mt-20 relative",
          )}
        >
          {/* Hand-drawn Dashed Arrow pointing to 3rd card */}
          <Arrow />

          {/* Card 1: As a Software Engineer */}
          {softwareEngineerTestimonials.length > 0 && (
            <motion.div variants={cardItemVariants} className="h-full">
              <TestimonialCard
                category="as a Software Engineer"
                icon={<Laptop className="size-4" strokeWidth={1} />}
                testimonials={softwareEngineerTestimonials}
                initialIndex={1} // Shows latest (matches Image 1)
                autoPlayInterval={5000}
                className="lg:-rotate-2 lg:mt-1.5"
              />
            </motion.div>
          )}

          {/* Card 2: As a Writer */}
          {writerTestimonials.length > 0 && (
            <motion.div variants={cardItemVariants} className="h-full">
              <TestimonialCard
                category="as a Writer"
                icon={<PencilLine className="size-4" strokeWidth={1} />}
                testimonials={writerTestimonials}
                initialIndex={0}
                autoPlayInterval={6500}
                className="lg:rotate-0"
              />
            </motion.div>
          )}

          {/* Card 3: As a Mentor */}
          {mentorTestimonials.length > 0 && (
            <motion.div variants={cardItemVariants} className="h-full">
              <TestimonialCard
                category="as a Mentor"
                icon={<GraduationCap className="size-4" strokeWidth={1} />}
                testimonials={mentorTestimonials}
                initialIndex={0}
                className="lg:rotate-2 lg:mt-1.5"
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
};

export default Testimonials;
