"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@heroui/react";
import { useIsMobile } from "@/hooks/use-mobile";

export type DrawerPlacement = "right" | "left" | "top" | "bottom";

interface DrawerContextValue {
  isOpen: boolean;
  onClose: () => void;
  placement: DrawerPlacement;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

function useDrawerContext() {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("Drawer subcomponents must be used inside <Drawer>.");
  }
  return ctx;
}

/* ────────────────────────────────────────────────────────────────
 * Placement presets (enter/slide + drag axes)
 * ──────────────────────────────────────────────────────────────── */

const PLACEMENT_PANEL: Record<
  DrawerPlacement,
  { initial: Record<string, number | string>; exit: Record<string, number | string> }
> = {
  right: { initial: { x: "100%" }, exit: { x: "100%" } },
  left: { initial: { x: "-100%" }, exit: { x: "-100%" } },
  top: { initial: { y: "-100%" }, exit: { y: "-100%" } },
  bottom: { initial: { y: "100%" }, exit: { y: "100%" } },
};

const DRAG_AXIS: Partial<Record<DrawerPlacement, "x" | "y">> = {
  right: "x",
  left: "x",
  top: "y",
  bottom: "y",
};

const PANEL_POSITION: Record<DrawerPlacement, string> = {
  right: "top-0 right-0 h-full",
  left: "top-0 left-0 h-full",
  top: "top-0 inset-x-0",
  bottom: "bottom-0 inset-x-0",
};

/* ────────────────────────────────────────────────────────────────
 * Drawer root
 * ──────────────────────────────────────────────────────────────── */

export interface DrawerProps extends React.PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  /**
   * When true, ignores `placement` on small screens (max-width 767px)
   * and renders as a bottom sheet instead — the mobile pattern for
   * side drawers.
   */
  adaptive?: boolean;
  /** Extra classes for the panel surface itself. */
  className?: string;
  /** Backdrop variant: "dim" | "blur" | "transparent". */
  backdrop?: "dim" | "blur" | "transparent";
  /** Close when the backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;
  /** Enable drag-to-close (side placements). Default true. */
  dragToClose?: boolean;
  /** Drag threshold in px before closing on release. */
  dragThreshold?: number;
  /** Drag velocity threshold px/s before closing on release. */
  dragVelocity?: number;
  /** Renders children without a portal (for embedded usage). */
  portal?: boolean;
}

const DrawerRoot: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = "right",
  adaptive = false,
  className,
  backdrop = "blur",
  closeOnBackdrop = true,
  dragToClose = true,
  dragThreshold = 120,
  dragVelocity = 600,
  portal = true,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();

  // Bottom sheet on small screens when adaptive is enabled.
  const effectivePlacement: DrawerPlacement =
    adaptive && isMobile ? "bottom" : placement;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const panel = PLACEMENT_PANEL[effectivePlacement];
  const dragAxis = DRAG_AXIS[effectivePlacement];

  const payload = (
    <AnimatePresence>
      {isOpen && (
        <DrawerContext.Provider
          value={{ isOpen, onClose, placement: effectivePlacement }}
          key={`drawer-${effectivePlacement}`}
        >
          {/* Backdrop */}
          <motion.div
            aria-hidden="true"
            className={cn(
              "fixed inset-0 z-1000",
              backdrop === "dim" && "bg-black/60",
              backdrop === "blur" && "bg-black/60 backdrop-blur-sm",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed z-1001 flex flex-col overflow-hidden shadow-2xl outline-none",
              PANEL_POSITION[effectivePlacement],
              effectivePlacement === "right" &&
                "rounded-l-2xl border-l border-white/6 bg-neutral-900/85 backdrop-blur-2xl w-full sm:w-104 sm:max-w-[calc(100vw-2rem)]",
              effectivePlacement === "left" &&
                "rounded-r-2xl border-r border-white/6 bg-neutral-900/85 backdrop-blur-2xl w-full sm:w-104 sm:max-w-[calc(100vw-2rem)]",
              effectivePlacement === "top" &&
                "rounded-b-2xl border-b border-white/6 bg-neutral-900/85 backdrop-blur-2xl w-full max-h-[85dvh]",
              effectivePlacement === "bottom" &&
                "rounded-t-2xl border-t border-white/6 bg-neutral-900/85 backdrop-blur-2xl w-full max-h-[85dvh]",
              className,
            )}
            initial={{ ...panel.initial }}
            animate={{ x: 0, y: 0 }}
            exit={{ ...panel.exit }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            drag={dragToClose ? dragAxis : undefined}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={
              dragAxis === "x" ? { left: 0, right: 0.3 } : { top: 0, bottom: 0.3 }
            }
            onDragEnd={(_, info) => {
              if (dragAxis === "x") {
                if (info.offset.x > dragThreshold || info.velocity.x > dragVelocity) {
                  onClose();
                }
              } else if (info.offset.y > dragThreshold || info.velocity.y > dragVelocity) {
                onClose();
              }
            }}
            style={{ touchAction: "pan-y" }}
          >
            {children}
          </motion.div>
        </DrawerContext.Provider>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  if (portal && typeof document !== "undefined") {
    return createPortal(payload, document.body);
  }
  return payload;
};

/* ────────────────────────────────────────────────────────────────
 * Subcomponents — Header / Body / Footer / CloseButton
 * ──────────────────────────────────────────────────────────────── */

const DrawerHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      "flex shrink-0 items-center justify-between gap-3 border-b border-white/5 px-4 py-3 bg-white/3",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

const DrawerBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5", className)}
    {...props}
  >
    {children}
  </div>
);

const DrawerFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn("flex shrink-0 items-center gap-2 border-t border-white/5 px-4 py-3", className)}
    {...props}
  >
    {children}
  </div>
);

const DrawerCloseButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...props }) => {
  const { onClose } = useDrawerContext();
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close panel"
      className={cn(
        "absolute top-4 right-4 z-10 p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer",
        className,
      )}
      {...props}
    />
  );
};

/**
 * Reusable drawer in the HeroUI compound shape:
 *
 * <Drawer isOpen onClose placement="right">
 *   <Drawer.CloseButton />
 *   <Drawer.Header>…</Drawer.Header>
 *   <Drawer.Body>…</Drawer.Body>
 *   <Drawer.Footer>…</Drawer.Footer>
 * </Drawer>
 */
export const Drawer = Object.assign(DrawerRoot, {
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  CloseButton: DrawerCloseButton,
});