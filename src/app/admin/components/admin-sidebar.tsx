"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LuLayoutDashboard,
  LuGraduationCap,
  LuBriefcase,
  LuFolderKanban,
  LuMessageSquareQuote,
  LuBookOpen,
  LuFolderOpen,
  LuLogOut,
  LuKeyRound,
  LuBoxes,
  LuActivity,
  LuUser,
  LuPlug,
} from "react-icons/lu";
import { VscMcp } from "react-icons/vsc";
import { LuInfo } from "react-icons/lu";
import { Avatar, Chip } from "@heroui/react";
import { cn } from "@heroui/react";
import { UserType } from "@/types";
import { motion } from "framer-motion";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarFooter,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarHeader,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuSub,
  AnimatedSidebarMenuSubButton,
  AnimatedSidebarMenuSubItem,
  AnimatedSidebarRail,
  useAnimatedSidebarPanel,
} from "@/components/ui/animated-sidebar";

interface AdminSidebarProps {
  user: UserType | null;
  isOpen?: boolean;
  isCollapsed?: boolean;
  variant?: "sidebar" | "floating";
  onClose?: () => void;
}

interface NavSubItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavSubItem[];
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LuLayoutDashboard,
  },
  {
    title: "Educations",
    href: "/admin/educations",
    icon: LuGraduationCap,
  },
  {
    title: "Experiences",
    href: "/admin/experiences",
    icon: LuBriefcase,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: LuBookOpen,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: LuFolderOpen,
  },
  {
    title: "Storage",
    href: "/admin/storage",
    icon: LuFolderKanban,
  },
  {
    title: "Testimonials",
    href: "/admin/testimonials",
    icon: LuMessageSquareQuote,
  },
  {
    title: "MCP",
    href: "/admin/mcp",
    icon: VscMcp,
    children: [
      {
        title: "Connect",
        href: "/admin/mcp/connect",
        icon: LuPlug,
      },
      {
        title: "Tokens",
        href: "/admin/mcp/tokens",
        icon: LuKeyRound,
      },
    ],
  },
];

const AdminSidebarUserProfile: React.FC<{ user: UserType | null }> = ({
  user,
}) => {
  const { collapsed } = useAnimatedSidebarPanel();

  return (
    <div
      className={cn(
        "flex items-center gap-3 min-w-0 transition-all duration-200",
        collapsed ? "justify-center px-0 py-1" : "px-2 py-1",
      )}
    >
      <Avatar size="md" className="shrink-0 ring-1 ring-border shadow-lg">
        <Avatar.Image src={user?.avatar_url} />
        <Avatar.Fallback>
          <LuUser />
        </Avatar.Fallback>
      </Avatar>

      <motion.div
        initial={false}
        animate={{
          opacity: collapsed ? 0 : 1,
          x: collapsed ? -6 : 0,
        }}
        transition={{ duration: 0.16 }}
        className={cn(
          "min-w-0 flex-1 overflow-hidden",
          collapsed && "pointer-events-none hidden",
        )}
      >
        <p className="truncate text-sm font-semibold text-foreground font-rethink">
          {user?.name || "John Doe"}
        </p>
        <p className="truncate text-xs text-muted-foreground capitalize">
          {user?.role || "Admin"}
        </p>
      </motion.div>
    </div>
  );
};

const AdminSidebarLogout: React.FC = () => {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redirect: "/" }),
        credentials: "include",
      });
      window.location.href = "/";
    } catch {
      window.location.href = "/";
    }
  };

  return (
    <AnimatedSidebarMenuButton
      onClick={handleLogout}
      icon={<LuLogOut className="size-4.5 shrink-0" />}
      className="text-muted-foreground hover:bg-destructive/10 text-[15px] hover:text-destructive transition-colors"
    >
      Log out
    </AnimatedSidebarMenuButton>
  );
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  variant = "sidebar",
}) => {
  const pathname = usePathname();

  // Track expanded accordion sub-menus
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    mainNavItems.forEach((item) => {
      if (item.children) {
        const matches =
          pathname === item.href ||
          item.children.some(
            (child) =>
              pathname === child.href || pathname.startsWith(child.href + "/"),
          );
        if (matches) {
          initial[item.href] = true;
        }
      }
    });
    return initial;
  });

  useEffect(() => {
    mainNavItems.forEach((item) => {
      if (item.children) {
        const matches =
          pathname === item.href ||
          item.children.some(
            (child) =>
              pathname === child.href || pathname.startsWith(child.href + "/"),
          );
        if (matches) {
          setOpenMenus((prev) =>
            prev[item.href] ? prev : { ...prev, [item.href]: true },
          );
        }
      }
    });
  }, [pathname]);

  const toggleMenu = (href: string) => {
    setOpenMenus((prev) => {
      const isCurrentlyOpen =
        prev[href] !== undefined
          ? prev[href]
          : pathname === href || pathname.startsWith(href + "/");
      return {
        ...prev,
        [href]: !isCurrentlyOpen,
      };
    });
  };

  return (
    <AnimatedSidebar
      variant={variant}
      collapsible="icon"
      className="md:bg-transparent pl-1"
      panelClassName="border-none"
    >
      <AnimatedSidebarHeader className="pb-4 pt-5 px-3">
        <AdminSidebarUserProfile user={user} />
      </AnimatedSidebarHeader>

      <AnimatedSidebarContent>
        <AnimatedSidebarGroup>
          <AnimatedSidebarGroupContent>
            <AnimatedSidebarMenu className="gap-2">
              {mainNavItems.map((item) => {
                const hasChildren = Boolean(
                  item.children && item.children.length > 0,
                );

                if (hasChildren) {
                  const isParentActive = item.children!.some(
                    (child) =>
                      pathname === child.href ||
                      pathname.startsWith(child.href + "/"),
                  );
                  const isOpen =
                    openMenus[item.href] !== undefined
                      ? openMenus[item.href]
                      : isParentActive;

                  return (
                    <AnimatedSidebarMenuItem key={item.href}>
                      <AnimatedSidebarMenuButton
                        isActive={isParentActive}
                        ariaExpanded={isOpen}
                        className="text-[15px]"
                        onSelect={() => toggleMenu(item.href)}
                        icon={
                          <item.icon
                            className={cn(
                              "size-4.5 transition-colors",
                              isParentActive ? "text-accent" : "",
                            )}
                          />
                        }
                        badge={
                          item.badge ? (
                            <Chip
                              size="sm"
                              variant="soft"
                              className="h-5 px-2 text-[10px] font-semibold bg-accent/15 text-accent border-0"
                            >
                              {item.badge}
                            </Chip>
                          ) : undefined
                        }
                      >
                        {item.title}
                      </AnimatedSidebarMenuButton>

                      <AnimatedSidebarMenuSub open={isOpen}>
                        {item.children!.map((subItem) => {
                          const isSubActive = pathname === subItem.href;
                          const SubIcon = subItem.icon;
                          return (
                            <AnimatedSidebarMenuSubItem key={subItem.href}>
                              <AnimatedSidebarMenuSubButton
                                href={subItem.href}
                                isActive={isSubActive}
                                icon={
                                  SubIcon ? (
                                    <SubIcon
                                      className={cn(
                                        "size-3.5 transition-colors",
                                        isSubActive ? "text-accent" : "",
                                      )}
                                    />
                                  ) : undefined
                                }
                              >
                                {subItem.title}
                              </AnimatedSidebarMenuSubButton>
                            </AnimatedSidebarMenuSubItem>
                          );
                        })}
                      </AnimatedSidebarMenuSub>
                    </AnimatedSidebarMenuItem>
                  );
                }

                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                return (
                  <AnimatedSidebarMenuItem key={item.href}>
                    <AnimatedSidebarMenuButton
                      href={item.href}
                      className="text-[15px]"
                      isActive={isActive}
                      icon={
                        <item.icon
                          className={cn(
                            "size-4.5 transition-colors",
                            isActive ? "text-accent" : "",
                          )}
                        />
                      }
                      badge={
                        item.badge ? (
                          <Chip
                            size="sm"
                            variant="soft"
                            className="h-5 px-2 text-[10px] font-semibold bg-accent/15 text-accent border-0"
                          >
                            {item.badge}
                          </Chip>
                        ) : undefined
                      }
                    >
                      {item.title}
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                );
              })}
            </AnimatedSidebarMenu>
          </AnimatedSidebarGroupContent>
        </AnimatedSidebarGroup>
      </AnimatedSidebarContent>

      <AnimatedSidebarFooter className="border-none pb-4">
        <AdminSidebarLogout />
      </AnimatedSidebarFooter>

      <AnimatedSidebarRail />
    </AnimatedSidebar>
  );
};

export default AdminSidebar;
