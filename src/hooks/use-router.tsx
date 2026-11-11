"use client";

import { useRouter as useRouterImpl } from "@bprogress/next";

type NavigationOptions = {
  scroll?: boolean;
  force?: boolean;
  auth?: boolean;
  next?: string;
  blank?: boolean;
  external?: boolean;
};

export const useRouter = () => {
  const router = useRouterImpl();

  return {
    push: (href: string, options?: NavigationOptions) => {
      const { next, auth, blank, external, ...opts } = options || {};

      let targetHref = href;

      if (auth) {
        const url = new URL(href, window.location.href);
        url.searchParams.set("next", next || window.location.pathname);
        targetHref = url.href;
      }

      // If navigating to an external redirect route like /checkout
      // this bypasses the Next.js soft-router to avoid RSC fetch errors.
      if (blank) {
        window.open(targetHref, "_blank");
        return;
      }
      if (external) {
        window.location.href = targetHref;
        return;
      }

      return router.push(targetHref, opts);
    },

    replace: (
      href: string,
      options?: Pick<NavigationOptions, "scroll" | "force">,
    ) => {
      return router.replace(href, options);
    },

    refresh: () => router.refresh(),
    back: () => router.back(),
    forward: () => router.forward(),
  };
};
