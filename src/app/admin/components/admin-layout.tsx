"use client";

import React, { useState, useEffect } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { UserType } from "@/types";
import { MdxStudioProvider } from "@/mdx-studio";
import { AnimatedSidebarProvider } from "@/components/ui/animated-sidebar";

interface AdminLayoutProps {
  user: UserType | null;
  children: React.ReactNode;
  variant?: "sidebar" | "floating";
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  children,
  variant = "sidebar",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Restore collapsed state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_sidebar_collapsed");
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsCollapsed(!open);
    try {
      localStorage.setItem("admin_sidebar_collapsed", String(!open));
    } catch {}
  };

  return (
    <MdxStudioProvider>
      <AnimatedSidebarProvider
        open={!isCollapsed}
        onOpenChange={handleOpenChange}
        openMobile={mobileDrawerOpen}
        onOpenMobileChange={setMobileDrawerOpen}
      >
        <div
          data-lenis-prevent
          className="relative flex h-screen w-screen overflow-hidden bg-background text-foreground"
        >
          {/* Background Dot Grid matching Landing Page */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 h-full w-full select-none"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255, 255, 255, 0.06) 1.2px, transparent 1.2px)",
              backgroundSize: "36px 36px",
            }}
          />

          {/* Subtle Top-Right Ambient Glow */}
          <div
            className="pointer-events-none absolute -top-40 right-0 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-[120px]"
            aria-hidden="true"
          />

          {/* Animated Sidebar */}
          <AdminSidebar user={user} variant={variant} />

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
            {/* Header with Mobile Menu Button & Desktop Toggle */}
            <AdminHeader user={user} />

            {/* Scrollable Main Body */}
            <main
              data-lenis-prevent
              className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 sm:px-8"
            >
              {children}
            </main>
          </div>
        </div>
      </AnimatedSidebarProvider>
    </MdxStudioProvider>
  );
};

export default AdminLayout;
