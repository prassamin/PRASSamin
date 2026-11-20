"use client";

import React, { useMemo } from "react";
import { MdxBlock } from "../types";
import { blocksToMdx } from "../compiler";
import MDXContent from "@/components/mdx/mdx-content";

interface BuilderPreviewBlockItemProps {
  block: MdxBlock;
  templatesHeaderMdx: string;
}

const BuilderPreviewBlockItem: React.FC<BuilderPreviewBlockItemProps> =
  React.memo(
    ({ block, templatesHeaderMdx }) => {
      const effectiveMdx = useMemo(() => {
        const singleMdx = blocksToMdx([block]);
        if (!singleMdx) return "";
        const usesTemplate =
          templatesHeaderMdx.length > 0 &&
          (singleMdx.includes("#") || singleMdx.includes("UseTemplate"));
        return usesTemplate
          ? `${templatesHeaderMdx}\n\n${singleMdx}`
          : singleMdx;
      }, [block, templatesHeaderMdx]);

      if (!effectiveMdx) return null;

      return (
        <div data-block-id={block.id} className="mdx-preview-block">
          <MDXContent content={effectiveMdx} />
        </div>
      );
    },
    (prev, next) =>
      prev.block === next.block &&
      prev.templatesHeaderMdx === next.templatesHeaderMdx,
  );

BuilderPreviewBlockItem.displayName = "BuilderPreviewBlockItem";

export const BuilderLivePreview: React.FC<{ blocks: MdxBlock[] }> = React.memo(
  ({ blocks }) => {
    const templatesHeaderMdx = useMemo(() => {
      const tplBlocks = blocks.filter((b) => b.type === "template");
      return tplBlocks.length > 0 ? blocksToMdx(tplBlocks) : "";
    }, [blocks]);

    const visibleBlocks = useMemo(
      () => blocks.filter((b) => b.type !== "template"),
      [blocks],
    );

    if (visibleBlocks.length === 0) return null;

    return (
      <div className="space-y-4">
        {visibleBlocks.map((block) => (
          <BuilderPreviewBlockItem
            key={block.id}
            block={block}
            templatesHeaderMdx={templatesHeaderMdx}
          />
        ))}
      </div>
    );
  },
);

BuilderLivePreview.displayName = "BuilderLivePreview";
