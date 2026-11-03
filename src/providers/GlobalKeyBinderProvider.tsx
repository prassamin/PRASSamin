"use client";
import React, { useEffect, useState } from "react";
import { Keybindy, KeybindyShortcut, useKeybindy } from "@keybindy/react";
import axios from "axios";
import { toast } from "@heroui/react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useRouter as useRouterWithProgress } from "@/hooks/useRouter";
import { usePathname } from "next/navigation";
import { Banner } from "fumadocs-ui/components/banner";

export const isTypingInFormElement = () => {
  if (typeof document === "undefined") return false;
  const activeElement = document.activeElement;
  const tagName = activeElement?.tagName?.toLowerCase();
  const isInput =
    tagName === "input" || tagName === "textarea" || tagName === "select";
  const isContentEditable =
    activeElement?.getAttribute("contenteditable") === "true";
  return isInput || isContentEditable;
};

const GlobalKeyBinderProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSignOutProcessing, setIsSignOutProcessing] = useState(false);
  const router = useRouter();
  const routerWithProgress = useRouterWithProgress();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const shortcuts: KeybindyShortcut[] = [
    {
      keys: ["Ctrl", "Shift", "Q"],
      handler: async () => {
        setIsSignOutProcessing(true);
        try {
          await axios.post("/api/auth/signout", {
            redirect: "/",
          });
          router.push("/");
        } catch (e) {
          toast.danger("Failed to sign out");
        } finally {
          setIsSignOutProcessing(false);
        }
      },
      options: {
        data: {
          description: "Sign out",
        },
      },
    },
    {
      keys: ["Ctrl", "Shift", "S"],
      handler: async () => {
        routerWithProgress.push("/signin");
      },
      options: {
        data: {
          description: "Navigate to sign in page",
        },
      },
    },
    {
      keys: ["G"],
      handler: async () => {
        if (isTypingInFormElement()) return;
        routerWithProgress.push("https://github.com/prassamin");
      },
      options: {
        data: {
          description: "Open PRAS GitHub",
        },
      },
    },
    {
      keys: [["Ctrl", "Shift", "A"]],
      handler: () => {
        routerWithProgress.push("/admin");
      },
      options: {
        preventDefault: true,
        data: {
          description: "Navigate to admin panel",
          hidden: mounted && !pathname.startsWith("/admin") ? true : false,
        },
      },
    },
  ];

  const formatKey = (key: string) => {
    const isMac =
      typeof navigator !== "undefined" && /Mac/.test(navigator.userAgent);
    switch (key.toLowerCase()) {
      case "meta":
        return isMac ? "⌘" : "Win";
      case "ctrl":
        return "Ctrl";
      case "shift":
        return "⇧";
      case "alt":
        return isMac ? "⌥" : "Alt";
      case "enter":
        return "↵";
      case "arrow right":
        return "↬";
      case "arrow left":
        return "↫";
      default:
        return key.toUpperCase();
    }
  };

  return (
    <Keybindy shortcuts={shortcuts}>
      {children}
      <AnimatePresence>
        {isSignOutProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[51]"
          >
            <div className="px-4 py-2.5 bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg rounded-xl flex items-center gap-2.5 transition-all duration-300 hover:shadow-xl hover:bg-background/100 group">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm font-medium text-foreground/90">
                Signing out...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Keybindy>
  );
};

export default GlobalKeyBinderProvider;
