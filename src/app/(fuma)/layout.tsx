import NavigationBar from "@/components/NavigationBar";
import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      sidebar={{ enabled: false }}
      nav={{
        component: (
          <NavigationBar className="absolute top-0 left-0 z-50" />
        ),
      }}
      tree={source.pageTree}
    >
      {children}
    </DocsLayout>
  );
}
