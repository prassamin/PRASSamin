"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { cn } from "@heroui/react";
import { LuChevronRight } from "react-icons/lu";
import { Drawer } from "@/components/ui/drawer";

const MotionLink = motion.create(Link);

export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const SPRING_LAYOUT = {
  type: "spring",
  stiffness: 350,
  damping: 30,
} as const;
export const SPRING_PRESS = {
  type: "spring",
  stiffness: 400,
  damping: 25,
} as const;

type SidebarState = "expanded" | "collapsed";

const MOBILE_QUERY = "(max-width: 767px)";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

// Critically-damped desktop rail spring transition
const SIDEBAR_MORPH_TRANSITION = {
  type: "spring",
  stiffness: 380,
  damping: 35,
  mass: 0.75,
} as const;

const LABEL_ENTER_TRANSITION = {
  duration: 0.2,
  delay: 0.08,
  ease: EASE_OUT,
} as const;

const LABEL_EXIT_TRANSITION = {
  duration: 0.12,
  ease: EASE_OUT,
} as const;

const REDUCED_TRANSITION = {
  duration: 0.16,
  ease: EASE_OUT,
} as const;

function subscribeToMobileQuery(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}

function getServerMobileSnapshot() {
  return false;
}

function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobileQuery,
    getMobileSnapshot,
    getServerMobileSnapshot,
  );
}

interface AnimatedSidebarContextValue {
  isMobile: boolean;
  layoutId: string;
  open: boolean;
  openMobile: boolean;
  reduce: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: SidebarState;
  toggleSidebar: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const AnimatedSidebarContext =
  createContext<AnimatedSidebarContextValue | null>(null);

interface AnimatedSidebarPanelContextValue {
  collapsed: boolean;
  isFloating?: boolean;
}

const AnimatedSidebarPanelContext =
  createContext<AnimatedSidebarPanelContextValue | null>(null);

export function useAnimatedSidebar() {
  const context = useContext(AnimatedSidebarContext);
  if (!context) {
    throw new Error(
      "useAnimatedSidebar must be used inside AnimatedSidebarProvider.",
    );
  }
  return context;
}

export function useAnimatedSidebarPanel() {
  const context = useContext(AnimatedSidebarPanelContext);
  if (!context) {
    throw new Error(
      "Animated Sidebar parts must be used inside AnimatedSidebar.",
    );
  }
  return context;
}

type SidebarProviderStyle = CSSProperties & {
  "--sidebar-width"?: string;
  "--sidebar-width-icon"?: string;
  "--sidebar-width-mobile"?: string;
};

export interface AnimatedSidebarProviderProps
  extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  style?: SidebarProviderStyle;
}

export function AnimatedSidebarProvider({
  children,
  open,
  defaultOpen = true,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  className,
  style,
  ...props
}: AnimatedSidebarProviderProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const [internalOpenMobile, setInternalOpenMobile] =
    useState(defaultOpenMobile);
  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const desktopOpen = open ?? internalOpen;
  const mobileOpen = openMobile ?? internalOpenMobile;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  const setOpenMobile = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === undefined) setInternalOpenMobile(nextOpen);
      onOpenMobileChange?.(nextOpen);
    },
    [onOpenMobileChange, openMobile],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(!mobileOpen);
    else setOpen(!desktopOpen);
  }, [desktopOpen, isMobile, mobileOpen, setOpen, setOpenMobile]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [toggleSidebar]);

  return (
    <AnimatedSidebarContext.Provider
      value={{
        isMobile,
        layoutId: `${generatedId}-active`,
        open: desktopOpen,
        openMobile: mobileOpen,
        reduce,
        setOpen,
        setOpenMobile,
        state: desktopOpen ? "expanded" : "collapsed",
        toggleSidebar,
        triggerRef,
      }}
    >
      <div
        {...props}
        data-slot="sidebar-wrapper"
        data-state={desktopOpen ? "expanded" : "collapsed"}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.25rem",
          "--sidebar-width-mobile": "18rem",
          ...style,
        }}
        className={cn(
          "group/sidebar-wrapper flex min-h-svh w-full min-w-0",
          className,
        )}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  );
}

function DrawerSidebar({
  isOpen,
  onClose,
  children,
  className,
  panelClassName,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="left"
      className={cn(
        "w-72 max-w-[85vw] p-0 sm:w-72 border-r border-border",
        className,
        panelClassName,
      )}
    >
      <Drawer.CloseButton className="top-4 right-4 z-20" />
      <AnimatedSidebarPanelContext.Provider
        value={{ collapsed: false, isFloating: true }}
      >
        <div className="flex h-full w-full flex-col justify-between overflow-hidden">
          {children}
        </div>
      </AnimatedSidebarPanelContext.Provider>
    </Drawer>
  );
}

export interface AnimatedSidebarProps
  extends Omit<HTMLMotionProps<"aside">, "children"> {
  children?: ReactNode;
  ariaLabel?: string;
  panelClassName?: string;
  variant?: "sidebar" | "floating";
  collapsible?: "icon" | "none";
}

export const AnimatedSidebar = forwardRef<HTMLElement, AnimatedSidebarProps>(
  function AnimatedSidebar(
    {
      ariaLabel: ariaLabelProp,
      children,
      className,
      panelClassName,
      style,
      variant = "sidebar",
      ...props
    },
    forwardedRef,
  ) {
    const context = useAnimatedSidebar();
    const ariaLabel = ariaLabelProp ?? "Sidebar";
    const isFloating = variant === "floating" || context.isMobile;

    if (isFloating) {
      const isOpen = context.isMobile ? context.openMobile : context.open;
      const handleClose = () => {
        if (context.isMobile) {
          context.setOpenMobile(false);
        } else {
          context.setOpen(false);
        }
      };

      return (
        <DrawerSidebar
          isOpen={isOpen}
          onClose={handleClose}
          className={className}
          panelClassName={panelClassName}
        >
          {children}
        </DrawerSidebar>
      );
    }

    const collapsed = !context.open;
    const width = collapsed
      ? "var(--sidebar-width-icon)"
      : "var(--sidebar-width)";

    return (
      <motion.aside
        {...props}
        ref={forwardedRef}
        initial={false}
        aria-label={ariaLabel}
        data-slot="sidebar"
        data-state={collapsed ? "collapsed" : "expanded"}
        animate={{ width }}
        transition={context.reduce ? { duration: 0 } : SIDEBAR_MORPH_TRANSITION}
        style={style}
        className={cn(
          "group/sidebar relative hidden h-auto shrink-0 md:block will-change-[width] peer",
          className,
        )}
      >
        <div
          className={cn(
            "sticky top-0 flex h-svh w-full flex-col overflow-hidden bg-background border-r border-border",
            panelClassName,
          )}
        >
          <AnimatedSidebarPanelContext.Provider
            value={{ collapsed, isFloating: false }}
          >
            {children}
          </AnimatedSidebarPanelContext.Provider>
        </div>
      </motion.aside>
    );
  },
);

export const AnimatedSidebarRail = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function AnimatedSidebarRail(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();

  return (
    <button
      {...props}
      ref={forwardedRef}
      type={type}
      aria-label={props["aria-label"] ?? "Toggle sidebar"}
      title="Toggle sidebar"
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 right-0 z-20 hidden w-4 translate-x-1/2 outline-none md:block",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-px after:bg-transparent after:transition-colors hover:after:bg-border",
        className,
      )}
    />
  );
});

export const AnimatedSidebarHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarHeader({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-header"
      className={cn("flex shrink-0 flex-col gap-2 p-3", className)}
    />
  );
});

export const AnimatedSidebarContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarContent({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden overscroll-contain px-2 py-2",
        className,
      )}
    />
  );
});

export const AnimatedSidebarFooter = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarFooter({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-footer"
      className={cn(
        "flex shrink-0 flex-col gap-2 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className,
      )}
    />
  );
});

export const AnimatedSidebarGroup = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroup({ className, ...props }, forwardedRef) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-group"
      className={cn("flex w-full min-w-0 flex-col px-1 py-1.5", className)}
    />
  );
});

export const AnimatedSidebarGroupContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(function AnimatedSidebarGroupContent(
  { className, ...props },
  forwardedRef,
) {
  return (
    <div
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-group-content"
      className={cn("w-full min-w-0", className)}
    />
  );
});

export const AnimatedSidebarMenu = forwardRef<
  HTMLUListElement,
  HTMLAttributes<HTMLUListElement>
>(function AnimatedSidebarMenu({ children, className, ...props }, forwardedRef) {
  return (
    <ul
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-menu"
      className={cn(
        "flex w-full min-w-0 list-none flex-col gap-0.5",
        className,
      )}
    >
      {children}
    </ul>
  );
});

export const AnimatedSidebarMenuItem = forwardRef<
  HTMLLIElement,
  HTMLMotionProps<"li">
>(function AnimatedSidebarMenuItem({ className, ...props }, forwardedRef) {
  return (
    <motion.li
      {...props}
      ref={forwardedRef}
      layout="position"
      transition={SPRING_LAYOUT}
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
    />
  );
});

export interface AnimatedSidebarMenuSubProps
  extends Omit<HTMLMotionProps<"ul">, "children"> {
  open: boolean;
  children?: ReactNode;
}

export const AnimatedSidebarMenuSub = forwardRef<
  HTMLUListElement,
  AnimatedSidebarMenuSubProps
>(function AnimatedSidebarMenuSub(
  { open, children, className, ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();

  return (
    <AnimatePresence initial={false}>
      {open && !panel.collapsed && (
        <motion.div
          key="sidebar-submenu-wrapper"
          initial={context.reduce ? false : { height: 0, opacity: 0 }}
          animate={
            context.reduce
              ? { opacity: 1 }
              : {
                  height: "auto",
                  opacity: 1,
                  transition: {
                    height: { duration: 0.28, ease: EASE_OUT },
                    opacity: { duration: 0.22, ease: EASE_OUT },
                  },
                }
          }
          exit={
            context.reduce
              ? { opacity: 0 }
              : {
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.38, ease: EASE_DRAWER },
                    opacity: { duration: 0.28, ease: EASE_OUT },
                  },
                }
          }
          className="overflow-hidden"
        >
          <motion.ul
            {...props}
            ref={forwardedRef}
            initial={context.reduce ? false : { y: -8, opacity: 0.7 }}
            animate={
              context.reduce
                ? {}
                : {
                    y: 0,
                    opacity: 1,
                    transition: { duration: 0.28, ease: EASE_OUT },
                  }
            }
            exit={
              context.reduce
                ? {}
                : {
                    y: -10,
                    opacity: 0,
                    transition: { duration: 0.32, ease: EASE_DRAWER },
                  }
            }
            data-slot="sidebar-menu-sub"
            className={cn(
              "relative mt-1 ml-5 flex min-w-0 flex-col gap-0.5 border-l border-border pl-3",
              className,
            )}
          >
            {children}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export const AnimatedSidebarMenuSubItem = forwardRef<
  HTMLLIElement,
  HTMLAttributes<HTMLLIElement>
>(function AnimatedSidebarMenuSubItem({ className, ...props }, forwardedRef) {
  return (
    <li
      {...props}
      ref={forwardedRef}
      data-slot="sidebar-menu-sub-item"
      className={cn("relative min-w-0", className)}
    />
  );
});

export interface AnimatedSidebarMenuSubButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  href?: string;
  isActive?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  onSelect?: () => void;
  className?: string;
}

export function AnimatedSidebarMenuSubButton({
  children,
  icon,
  href,
  isActive = false,
  disabled = false,
  closeOnSelect = true,
  target,
  rel,
  onClick,
  onSelect,
  className,
}: AnimatedSidebarMenuSubButtonProps) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();

  const select = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    onSelect?.();
    if (closeOnSelect && (context.isMobile || panel.isFloating)) {
      if (context.isMobile) context.setOpenMobile(false);
      else context.setOpen(false);
    }
  };

  const content = (
    <>
      <span
        aria-hidden="true"
        className="grid size-4 shrink-0 place-items-center"
      >
        {icon ?? <span className="size-1 rounded-full bg-current" />}
      </span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </>
  );

  const interactiveClassName = cn(
    "flex min-h-8 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-xs outline-none",
    "text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
    "focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring",
    isActive && "bg-muted/70 text-foreground font-semibold",
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  return href ? (
    <MotionLink
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </MotionLink>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}

export interface AnimatedSidebarMenuButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  isActive?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
  onClick?: (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  onSelect?: () => void;
  className?: string;
}

export function AnimatedSidebarMenuButton({
  children,
  icon,
  badge,
  href,
  isActive = false,
  ariaExpanded,
  disabled = false,
  closeOnSelect,
  target,
  rel,
  onClick,
  onSelect,
  className,
}: AnimatedSidebarMenuButtonProps) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();
  const textLabel = typeof children === "string" ? children : undefined;

  const select = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    onSelect?.();
    const shouldCloseOnSelect = closeOnSelect ?? ariaExpanded === undefined;
    if (shouldCloseOnSelect && (context.isMobile || panel.isFloating)) {
      if (context.isMobile) {
        context.setOpenMobile(false);
      } else {
        context.setOpen(false);
      }
    }
    if (ariaExpanded !== undefined && panel.collapsed && !context.isMobile) {
      context.setOpen(true);
    }
  };

  const content = (
    <>
      {isActive ? (
        <motion.span
          layoutId={context.layoutId}
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="absolute inset-0 rounded-xl bg-muted"
        />
      ) : null}
      {icon ? (
        <span
          aria-hidden="true"
          className="relative z-10 grid size-5 shrink-0 place-items-center"
        >
          {icon}
        </span>
      ) : null}
      <motion.span
        initial={false}
        animate={{
          opacity: panel.collapsed ? 0 : 1,
          x: panel.collapsed ? -4 : 0,
        }}
        transition={
          context.reduce
            ? REDUCED_TRANSITION
            : panel.collapsed
              ? LABEL_EXIT_TRANSITION
              : LABEL_ENTER_TRANSITION
        }
        aria-hidden={panel.collapsed}
        className={cn(
          "relative z-10 min-w-0 flex-1 truncate",
          panel.collapsed && "pointer-events-none",
        )}
      >
        {children}
      </motion.span>
      {badge && !panel.collapsed ? (
        <span className="relative z-10 shrink-0 text-xs text-muted-foreground">
          {badge}
        </span>
      ) : null}
      {ariaExpanded !== undefined ? (
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: panel.collapsed ? 0 : 1,
            rotate: ariaExpanded ? 90 : 0,
            x: panel.collapsed ? 4 : 0,
          }}
          transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="relative z-10 grid size-4 shrink-0 place-items-center text-muted-foreground"
        >
          <LuChevronRight className="size-3.5" />
        </motion.span>
      ) : null}
    </>
  );

  const interactiveClassName = cn(
    "relative flex min-h-9 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl px-3 text-left text-sm font-medium outline-none cursor-pointer",
    "text-muted-foreground transition-colors hover:text-foreground",
    "focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring",
    isActive && "text-foreground font-semibold",
    disabled && "cursor-not-allowed opacity-40",
    className,
  );

  return href ? (
    <MotionLink
      href={href}
      target={target}
      rel={rel ?? (target === "_blank" ? "noreferrer noopener" : undefined)}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      aria-disabled={disabled || undefined}
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </MotionLink>
  ) : (
    <motion.button
      type="button"
      disabled={disabled}
      aria-current={isActive ? "page" : undefined}
      aria-expanded={ariaExpanded}
      aria-label={panel.collapsed ? textLabel : undefined}
      title={panel.collapsed ? textLabel : undefined}
      onClick={select}
      whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }}
      transition={SPRING_PRESS}
      className={interactiveClassName}
    >
      {content}
    </motion.button>
  );
}
