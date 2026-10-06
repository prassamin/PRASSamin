"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  Briefcase,
  FolderKanban,
  MessageSquareQuote,
  LogOut,
  X,
} from "lucide-react";
import { Avatar, Chip } from "@heroui/react";
import { cn } from "@heroui/react";
import { UserType } from "@/types";
import { LuUser } from "react-icons/lu";
import { Tooltip } from "@/components/tooltip";
import { motion, AnimatePresence } from "motion/react";

interface AdminSidebarProps {
  user: UserType | null;
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
}

const mainNavItems: {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Educations",
    href: "/admin/educations",
    icon: GraduationCap,
  },
  {
    title: "Experiences",
    href: "/admin/experiences",
    icon: Briefcase,
  },
  {
    title: "Storage",
    href: "/admin/storage",
    icon: FolderKanban,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: MessageSquareQuote,
  },
];

interface SidebarInnerProps {
  user: UserType | null;
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

const SidebarInner: React.FC<SidebarInnerProps> = ({
  user,
  isCollapsed = false,
  onItemClick,
}) => {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col justify-between">
      {/* Top: User Profile Header */}
      <div>
        <div
          className={cn(
            "flex items-center pb-8",
            isCollapsed ? "justify-center px-0" : "px-2",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Avatar size="md" className="shrink-0 ring-1 ring-border shadow-lg">
              <Avatar.Image src={user?.avatar_url} />
              <Avatar.Fallback>
                <LuUser />
              </Avatar.Fallback>
            </Avatar>

            {!isCollapsed && (
              <div className="min-w-0 flex-1 overflow-hidden transition-opacity duration-200">
                <p className="truncate text-sm font-semibold text-foreground font-rethink">
                  {user?.name || "John Doe"}
                </p>
                <p className="truncate text-xs text-muted-foreground capitalize">
                  {user?.role || "Admin"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="flex flex-col gap-1.5">
          {mainNavItems.map((item) => {
            const isActive = pathname
              ? item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
              : false;

            const linkItem = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "group flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                  isCollapsed
                    ? "size-11 justify-center p-0 mx-auto"
                    : "justify-between px-3.5 py-2.5 w-full",
                  isActive
                    ? "bg-secondary text-foreground font-semibold shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "gap-3",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-5 transition-colors shrink-0",
                      isActive
                        ? "text-accent"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>

                {!isCollapsed && item?.badge && (
                  <Chip
                    size="sm"
                    variant="soft"
                    className="h-5 px-2 text-[10px] font-semibold bg-accent/15 text-accent border-0"
                  >
                    {item?.badge}
                  </Chip>
                )}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href} content={item.title} placement="right">
                  <div>{linkItem}</div>
                </Tooltip>
              );
            }

            return linkItem;
          })}
        </nav>
      </div>

      {/* Bottom Item: Log out */}
      <div className="pt-4">
        {(() => {
          const logOutLink = (
            <Link
              href="/api/auth/signout"
              onClick={onItemClick}
              className={cn(
                "group flex items-center rounded-xl text-sm font-medium transition-colors",
                isCollapsed
                  ? "size-11 justify-center p-0 mx-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  : "gap-3 px-3.5 py-2.5 w-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
              )}
            >
              <LogOut className="size-5 shrink-0" />
              {!isCollapsed && <span>Log out</span>}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip content="Log out" placement="right">
                <div>{logOutLink}</div>
              </Tooltip>
            );
          }

          return logOutLink;
        })()}
      </div>
    </div>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  isOpen,
  isCollapsed,
  onClose,
}) => {
  return (
    <>
      {/* Desktop Sidebar: Animated width collapse/expand */}
      <aside
        className={cn(
          "hidden lg:flex flex-col justify-between bg-transparent py-6 transition-[width] duration-300 ease-in-out",
          isCollapsed ? "w-20 px-3" : "w-64 px-4",
        )}
      >
        <SidebarInner user={user} isCollapsed={isCollapsed} />
      </aside>

      {/* Mobile Drawer using pure Framer Motion for full enter/exit animation control */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop Fade */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={onClose}
              className="fixed inset-0 bg-background/80 backdrop-blur-md"
            />

            {/* Slide-out Drawer Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                duration: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="fixed top-0 bottom-0 left-0 z-10 flex h-full w-72 max-w-[85vw] flex-col justify-between border-r border-border bg-sidebar/95 p-5 shadow-2xl backdrop-blur-2xl rounded-r-2xl"
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Drawer"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>

              <SidebarInner
                user={user}
                isCollapsed={false}
                onItemClick={onClose}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;
