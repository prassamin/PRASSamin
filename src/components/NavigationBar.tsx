"use client";

import React, { useState, useEffect, useRef, FC } from "react";
import { Link } from "@/components/Link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Image } from "./Image";
import { RiHome9Line } from "react-icons/ri";
import {
  LuBookText,
  LuFolderOpen,
  LuCircleUser,
  LuNotebook,
  LuListTodo,
  LuBookUser,
  LuChevronDown,
  LuX,
  LuHeart,
} from "react-icons/lu";

const NavigationBar: FC<React.ComponentPropsWithoutRef<"header">> = ({
  className,
  ...props
}) => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);

  // Close menus when pathname changes
  useEffect(() => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dim header slightly on scroll down
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > 80 && window.scrollY > lastScrollY) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/projects", label: "Projects" },
    { href: "/about", label: "About" },
  ];

  const mobileLinks = [
    {
      href: "/",
      label: "Home",
      description: "Welcome to my site",
      icon: RiHome9Line,
    },
    {
      href: "/blog",
      label: "Blog",
      description: "Mental models & tutorials",
      icon: LuBookText,
    },
    {
      href: "/projects",
      label: "Projects",
      description: "Showcase of what I've built",
      icon: LuFolderOpen,
    },
    {
      href: "/about",
      label: "About",
      description: "Learn more about me",
      icon: LuCircleUser,
    },
    {
      href: "/bucket-list",
      label: "Bucket List",
      description: "Things to do at least once",
      icon: LuListTodo,
    },
    {
      href: "/shorts",
      label: "Shorts",
      description: "Personal notes & insights",
      icon: LuNotebook,
    },
    {
      href: "/guestbook",
      label: "Guest Book",
      description: "Leave me a message",
      icon: LuBookUser,
    },
    {
      href: "/donate",
      label: "Donate",
      description: "Support my work",
      icon: LuHeart,
    },
  ];

  return (
    <>
      {/* Backdrop overlay when Mega Menu is open to dismiss on outside click */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            aria-hidden="true"
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 z-40 bg-transparent pointer-events-auto"
          />
        )}
      </AnimatePresence>

      <header
        ref={headerRef}
        className={`pointer-events-none fixed top-0 inset-x-0 z-50 transition-opacity duration-300 ${
          isScrolled && !isMoreOpen
            ? "opacity-40 hover:opacity-100"
            : "opacity-100"
        } ${className || ""}`}
        id="header"
        {...props}
      >
        {/* Mobile Header Nav (<570px) */}
        <div className="flex min-[570px]:hidden mt-8 w-full text-sm md:text-base pointer-events-none px-4 justify-end relative">
          <div className="bg-neutral-800/70 backdrop-blur-sm rounded-lg pointer-events-auto">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="py-2 pl-4 pr-3 group font-rethink text-neutral-300 hover:text-neutral-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              Menu
              <LuChevronDown
                className={`mt-0.5 size-3.5 transition-transform duration-200 ${
                  isMobileMenuOpen
                    ? "rotate-180 text-neutral-400 hover:text-neutral-300"
                    : "text-neutral-500 group-hover:text-neutral-400"
                }`}
              />
            </button>
          </div>

          {/* Mobile Popover Dropdown */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                key="mobile-nav-menu"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full right-4 mt-2 z-50 rounded-xl bg-neutral-900/90 shadow-2xl outline-none backdrop-blur-md border border-neutral-800 p-3 grid gap-2 w-fit grid-cols-1 *:w-75 pointer-events-auto max-h-[80vh] overflow-y-auto"
              >
                <div className="flex flex-col gap-2">
                  {mobileLinks.map((link, i) => (
                    <Link
                      key={i}
                      className="group/header-link p-3 rounded-xl bg-neutral-925/70 w-full flex items-start gap-3 transition-colors hover:bg-neutral-925"
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="mt-0.5 p-2.5 bg-neutral-900 text-neutral-300 rounded-lg [&>svg]:size-4">
                        <link.icon />
                      </div>
                      <div className="grow">
                        <p className="b1 font-rethink font-medium text-white underline decoration-transparent group-hover/header-link:decoration-neutral-200">
                          {link.label}
                        </p>
                        <p className="c1 text-neutral-400 mt-0.5">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Desktop Centered Floating Frosted Nav (>=570px) */}
        <>
          <nav className="hidden min-[570px]:flex pointer-events-auto mt-8 px-3 rounded-lg bg-neutral-800/60  w-fit mx-auto text-sm md:text-base">
            <ul className="flex items-center gap-4">
              {primaryLinks.map((link, index) => {
                const isActive = (href: string) => {
                  if (href === "/") return pathname === "/";
                  return pathname.startsWith(href);
                };
                return (
                  <Link
                    key={index}
                    className={`py-3 px-2 font-rethink transition-colors ${
                      isActive(link.href)
                        ? "text-accent-300 hover:text-accent-300"
                        : "text-neutral-200 hover:text-neutral-50"
                    }`}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {/* Divider */}
              <div className="w-px bg-neutral-500 h-4.5" />

              {/* More Menu Dropdown Trigger */}
              <li>
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className={`py-3 px-2 group font-rethink transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                    isMoreOpen
                      ? "text-neutral-200 hover:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-400"
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  More
                  <LuChevronDown
                    className={`mt-0.5 size-3.5 transition-transform duration-200 ${
                      isMoreOpen
                        ? "rotate-180 text-neutral-400 hover:text-neutral-300"
                        : "text-neutral-500 group-hover:text-neutral-400"
                    }`}
                  />
                </button>
              </li>
            </ul>
          </nav>

          {/* Desktop Mega Menu Dropdown Popover */}
          <AnimatePresence>
            {isMoreOpen && (
              <motion.div
                key="desktop-more-menu"
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ minWidth: "max-content" }}
                className="absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-neutral-900/85 outline-none backdrop-blur-sm border border-neutral-900 p-3 grid gap-2 w-fit grid-cols-2 pointer-events-auto"
              >
                {/* Column 1: Bucket List */}
                <Link
                  className="group/header-link w-60 flex flex-col justify-end p-5 rounded-xl relative overflow-hidden"
                  href="/bucket-list"
                  onClick={() => setIsMoreOpen(false)}
                >
                  <div className="absolute inset-0 z-[-1] rounded-xl overflow-hidden pointer-events-none">
                    <figure className="isolate absolute inset-0 z-[-1] overflow-hidden select-none pointer-events-none group-hover/header-link:scale-110 transition-transform duration-300 ease-in-out">
                      <Image
                        alt="Stedium"
                        mode="progressive"
                        className="h-full w-full object-cover"
                        src="/assets/bucket-list-thumbnail.webp"
                      />
                    </figure>
                  </div>
                  <div className="rounded-[11px] bg-linear-to-b from-neutral-925/25 to-neutral-925/50 absolute inset-0 z-[-1] group-hover/header-link:opacity-65 opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <p className="b1 font-rethink font-semibold text-white underline decoration-transparent group-hover/header-link:decoration-neutral-200 transition-colors">
                    Bucket List
                  </p>
                  <p className="c1 text-neutral-400 mt-1">
                    Things to do at least once
                  </p>
                </Link>

                {/* Column 2: Stacked Quick Links (Shorts, Guest Book) */}
                <div className="w-60 flex flex-col gap-2">
                  {[
                    {
                      label: "Shorts",
                      href: "/shorts",
                      description: "Personal notes & insights",
                      icon: LuNotebook,
                    },
                    {
                      label: "Guest Book",
                      href: "/guest-book",
                      description: "Leave me a message",
                      icon: LuBookUser,
                    },
                    {
                      label: "Donate",
                      href: "/donate",
                      description: "Support my work",
                      icon: LuHeart,
                    },
                  ].map((link, index) => (
                    <Link
                      key={index}
                      className="group/header-link flex-1 p-3.5 rounded-xl bg-neutral-925 w-full flex items-center gap-3 transition-colors hover:bg-neutral-925/70"
                      href={link.href}
                      onClick={() => setIsMoreOpen(false)}
                    >
                      <div className="p-3 bg-neutral-800/60 text-neutral-300 rounded-xl [&>svg]:size-4 [&>svg]:stroke-1">
                        <link.icon />
                      </div>
                      <div className="grow">
                        <div className="flex items-center gap-2 justify-between">
                          <p className="b1 text-neutral-300 font-rethink underline decoration-transparent group-hover/header-link:decoration-neutral-200 transition-colors">
                            {link.label}
                          </p>
                        </div>
                        <p className="c1 text-neutral-500 mt-0.5">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      </header>
    </>
  );
};

export default NavigationBar;
