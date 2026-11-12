"use client";
import React, { useEffect, useState } from "react";
import { useShortcuts } from "@keybindy/react";
import axios from "axios";
import { Spinner, toast } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/hooks/use-router";
import { useOwner } from "./owner-provider";

export const GlobalKeyBindingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isSignOutProcessing, setIsSignOutProcessing] = useState(false);
  const router = useRouter();
  const { owner } = useOwner();

  useEffect(() => {
    const guard = (e: KeyboardEvent) => {
      if (typeof e.code === "undefined") {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener("keydown", guard, true);
    window.addEventListener("keyup", guard, true);
    return () => {
      window.removeEventListener("keydown", guard, true);
      window.removeEventListener("keyup", guard, true);
    };
  }, []);

  useShortcuts(
    [
      {
        keys: ["Ctrl", "Q"],
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
      },
      {
        keys: ["Ctrl", "S"],
        handler: async () => {
          router.push("/sign-in");
        },
      },
      {
        keys: ["G"],
        handler: async () => {
          router.push(`https://github.com/${owner?.username}`);
        },
      },
      {
        keys: [["Ctrl", "A"]],
        handler: () => {
          router.push("/admin");
        },
      },
    ],
    {
      beforeEach: (_, e) => {
        e.preventDefault();
      },
      ignoreInputs: true,
    },
  );

  return (
    <>
      {children}
      <AnimatePresence>
        {isSignOutProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-51"
          >
            <div className="px-4 py-2.5 bg-muted/50 backdrop-blur-sm border border-transparent gradient-border gb-color-[linear-gradient(to_bottom_right,rgba(23,23,23,70%)_0%,#525252_62%,rgba(23,23,23,70%)_100%)] shadow-lg rounded-xl flex items-center gap-2.5 group">
              <Spinner size="sm" />
              <span className="text-sm font-medium text-foreground/90">
                Signing out...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
