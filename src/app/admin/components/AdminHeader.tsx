"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ExternalLink,
} from "lucide-react";
import { UserType } from "@/types";

interface AdminHeaderProps {
  user: UserType | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobileDrawer: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  isCollapsed,
  onToggleCollapse,
  onOpenMobileDrawer,
}) => {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = user?.name ? user.name.split(" ")[0] : "John";

  return (
    <header className="flex h-20 w-full items-center justify-between px-6 sm:px-8 bg-transparent">
      {/* Left: Mobile Menu Button / Desktop Collapse Toggle + Greeting */}
      <div className="flex items-center gap-3">
        {/* Mobile Only: Hamburger Menu Button for Sidedrawer */}
        <button
          type="button"
          onClick={onOpenMobileDrawer}
          aria-label="Open Menu Drawer"
          className="flex lg:hidden rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop Only: Expand / Collapse Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="hidden lg:flex rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </button>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-rethink">
          {greeting}, {firstName}
        </h1>
      </div>
    </header>
  );
};

export default AdminHeader;
