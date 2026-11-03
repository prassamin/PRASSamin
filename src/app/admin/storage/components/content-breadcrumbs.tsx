"use client";

import React from "react";
import { LuChevronRight, LuHouse } from "react-icons/lu";
import { useContent } from "../hooks/use-content-manager";

type Props = {
  path?: string;
  rootPath?: string;
  onNavigate?: (path: string) => void;
};

export function ContentBreadcrumbs(props: Props = {}) {
  const content = useContent();
  const path = props.path ?? content.currentPath;
  const rootPath = props.rootPath ?? content.rootPath;
  const onNavigate = props.onNavigate ?? content.goToPath;

  const fullSegments = path.split("/").filter(Boolean);
  const rootSegments = rootPath.split("/").filter(Boolean);
  const relativeSegments = fullSegments.slice(rootSegments.length);

  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-neutral-400">
      <button
        type="button"
        onClick={() => onNavigate(rootPath)}
        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
      >
        <LuHouse className="w-3.5 h-3.5" />
        <span>Root</span>
      </button>

      {relativeSegments.map((segment, index) => {
        const target = [
          ...rootSegments,
          ...relativeSegments.slice(0, index + 1),
        ].join("/");
        const isLast = index === relativeSegments.length - 1;

        return (
          <div key={target} className="inline-flex items-center gap-1.5">
            <LuChevronRight className="w-3 h-3 text-neutral-600" />
            {isLast ? (
              <span className="text-white font-semibold">{segment}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(target)}
                className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                {segment}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
