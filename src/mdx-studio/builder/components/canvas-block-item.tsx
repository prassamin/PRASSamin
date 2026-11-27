"use client";

import React, { useState, useCallback } from "react";
import {
  LuGripVertical as GripVertical,
  LuTrash2 as Trash2,
  LuCopy as Copy,
  LuChevronUp as ChevronUp,
  LuChevronDown as ChevronDown,
  LuSlidersHorizontal as SlidersHorizontal,
} from "react-icons/lu";
import { cn } from "@heroui/react";
import { MdxBlock, TemplateDefinitionInfo } from "../types";
import { BLOCK_ICONS, BLOCK_TITLES } from "../blocks/registry";
import { BlockPropertiesDrawer } from "../blocks/block-properties-drawer";
import {
  HeadingBlockEditor,
  ParagraphBlockEditor,
  DividerBlockEditor,
  BreakBlockEditor,
  CalloutBlockEditor,
  CardBlockEditor,
} from "../blocks/editors/basic-block-editors";
import { ListBlockEditor } from "../blocks/editors/list-block-editor";
import {
  BannerBlockEditor,
  BlockquoteBlockEditor,
} from "../blocks/editors/banner-blockquote-editor";
import { CardsGroupBlockEditor } from "../blocks/editors/cards-group-editor";
import {
  AccordionBlockEditor,
  StepsBlockEditor,
} from "../blocks/editors/accordion-steps-editor";
import { TabsBlockEditor } from "../blocks/editors/tabs-block-editor";
import { ChipGroupBlockEditor } from "../blocks/editors/chip-group-editor";
import {
  CodeBlockTabsEditor,
  CodeSnippetBlockEditor,
} from "../blocks/editors/code-block-editor";
import { ImageBlockEditor } from "../blocks/editors/image-block-editor";
import {
  TableBlockEditor,
  TypeTableBlockEditor,
} from "../blocks/editors/table-block-editor";
import { FilesTreeBlockEditor } from "../blocks/editors/files-tree-editor";
import {
  ProfileBlockEditor,
  AvatarGroupBlockEditor,
} from "../blocks/editors/profile-avatar-editor";
import { InlineUserBlockEditor } from "../blocks/editors/inline-user-editor";
import { StacksBlockEditor } from "../blocks/editors/stacks-block-editor";
import { TemplateBlockEditor } from "../blocks/editors/template-block-editor";
import { UseTemplateBlockEditor } from "../blocks/editors/use-template-editor";
import { HtmlBlockEditor } from "../blocks/editors/html-block-editor";

export interface CanvasBlockItemProps {
  block: MdxBlock;
  index: number;
  totalBlocks: number;
  onUpdateProps: (id: string, props: Record<string, any>) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent, index: number) => void;
  onDrop?: (e: React.DragEvent, index: number) => void;
  onAdoptBlock?: (rootIndex: number, cardTargetBlockIndex?: number) => void;
  onExtractCard?: (
    groupBlockIndex: number,
    cardIndex: number,
    targetRootIndex: number,
  ) => void;
  onMoveCardBetweenGroups?: (
    srcGroupIndex: number,
    srcCardIndex: number,
    targetGroupIndex: number,
    targetCardIndex?: number,
  ) => void;
  depth?: number;
  onNestedDragChange?: (active: boolean) => void;
  availableTemplates?: TemplateDefinitionInfo[];
  insideTemplate?: boolean;
  isDuplicateTemplate?: boolean;
}

const CanvasBlockItemInner: React.FC<CanvasBlockItemProps> = ({
  block,
  index,
  totalBlocks,
  onUpdateProps,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onAdoptBlock,
  onExtractCard,
  onMoveCardBetweenGroups,
  depth = 0,
  onNestedDragChange,
  availableTemplates = [],
  insideTemplate = false,
  isDuplicateTemplate = false,
}) => {
  const { id, type, props } = block;
  const [showStyles, setShowStyles] = useState(false);
  const [isHandleHovered, setIsHandleHovered] = useState(false);

  const updateProp = useCallback(
    (keyOrPatch: string | Record<string, any>, value?: any) => {
      if (typeof keyOrPatch === "string") {
        onUpdateProps(id, { ...props, [keyOrPatch]: value });
      } else {
        onUpdateProps(id, { ...props, ...keyOrPatch });
      }
    },
    [id, onUpdateProps, props],
  );

  return (
    <div
      data-block-type={type}
      draggable={Boolean(onDragStart) && isHandleHovered}
      onDragStart={onDragStart ? (e) => onDragStart(e, index) : undefined}
      onDragOver={
        onDragOver
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOver(e, index);
            }
          : undefined
      }
      onDrop={
        onDrop
          ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop(e, index);
            }
          : undefined
      }
      className={cn(
        "transition-all shadow-sm group relative [&_*::placeholder]:text-neutral-500",
        type === "stacks" ? "overflow-visible z-20" : "overflow-hidden",
        depth === 0
          ? "rounded-2xl border border-white/8 bg-muted/40 hover:border-white/14"
          : "rounded-xl border border-white/8 bg-neutral-900/80 hover:border-white/16 my-2",
      )}
    >
      {/* Block Header Bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2.5 bg-white/2 border-b border-white/6 select-none",
          depth === 0 ? "rounded-t-2xl" : "rounded-t-xl",
        )}
      >
        <div className="flex items-center gap-2">
          {onDragStart && (
            <div
              title="Drag to reorder"
              onMouseEnter={() => setIsHandleHovered(true)}
              onMouseLeave={() => setIsHandleHovered(false)}
              onMouseDown={() => setIsHandleHovered(true)}
              onMouseUp={() => setIsHandleHovered(false)}
              className="p-1 rounded text-neutral-400 hover:text-white cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          <div className="p-1 rounded-md bg-white/4">{BLOCK_ICONS[type]}</div>

          <span className="text-xs font-semibold text-neutral-200 font-inter">
            {BLOCK_TITLES[type]}
          </span>
        </div>

        {/* Action Buttons: Move Up/Down, Properties Drawer, Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMoveUp(index)}
            disabled={index === 0}
            title="Move Up"
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveDown(index)}
            disabled={index === totalBlocks - 1}
            title="Move Down"
            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowStyles((prev) => !prev)}
            title={`${BLOCK_TITLES[type]} Properties`}
            disabled={
              type === "callout" ||
              type === "card" ||
              type === "steps" ||
              type === "banner" ||
              type === "table" ||
              type === "break" ||
              type === "list" ||
              type === "html"
            }
            className={cn(
              "p-1 rounded transition-colors disabled:opacity-20",
              showStyles
                ? "text-accent bg-accent/15"
                : "text-neutral-400 not-disabled:hover:text-white not-disabled:hover:bg-white/10",
            )}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDuplicate(index)}
            title="Duplicate"
            className="p-1 rounded text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(index)}
            title="Delete Block"
            className="p-1 rounded text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Block-Specific Properties Drawer */}
      <BlockPropertiesDrawer
        showStyles={showStyles}
        type={type}
        props={props}
        updateProp={updateProp}
      />

      {/* Block Body Content */}
      <div
        draggable={false}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="p-4 space-y-3"
      >
        {type === "heading" && (
          <HeadingBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "paragraph" && (
          <ParagraphBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "list" && (
          <ListBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "banner" && (
          <BannerBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "divider" && <DividerBlockEditor />}
        {type === "break" && <BreakBlockEditor />}
        {type === "callout" && (
          <CalloutBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "card" && (
          <CardBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "cards" && (
          <CardsGroupBlockEditor
            props={props}
            index={index}
            updateProp={updateProp}
            onNestedDragChange={onNestedDragChange}
            onAdoptBlock={onAdoptBlock}
            onExtractCard={onExtractCard}
            onMoveCardBetweenGroups={onMoveCardBetweenGroups}
          />
        )}
        {type === "accordion" && (
          <AccordionBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "steps" && (
          <StepsBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "tabs" && (
          <TabsBlockEditor
            props={props}
            depth={depth}
            insideTemplate={insideTemplate}
            availableTemplates={availableTemplates}
            updateProp={updateProp}
            onNestedDragChange={onNestedDragChange}
          />
        )}
        {type === "chipGroup" && (
          <ChipGroupBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "stacks" && (
          <StacksBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "codeBlockTabs" && (
          <CodeBlockTabsEditor props={props} updateProp={updateProp} />
        )}
        {type === "code" && (
          <CodeSnippetBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "image" && (
          <ImageBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "table" && (
          <TableBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "typeTable" && (
          <TypeTableBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "files" && (
          <FilesTreeBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "profile" && (
          <ProfileBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "avatar" && (
          <AvatarGroupBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "user" && (
          <InlineUserBlockEditor
            props={props}
            insideTemplate={insideTemplate}
            updateProp={updateProp}
          />
        )}
        {type === "blockquote" && (
          <BlockquoteBlockEditor props={props} updateProp={updateProp} />
        )}
        {type === "template" && (
          <TemplateBlockEditor
            props={props}
            depth={depth}
            isDuplicateTemplate={isDuplicateTemplate}
            availableTemplates={availableTemplates}
            updateProp={updateProp}
            onNestedDragChange={onNestedDragChange}
          />
        )}
        {type === "useTemplate" && (
          <UseTemplateBlockEditor
            props={props}
            availableTemplates={availableTemplates}
            updateProp={updateProp}
          />
        )}
        {type === "html" && (
          <HtmlBlockEditor props={props} updateProp={updateProp} />
        )}
      </div>
    </div>
  );
};

function areCanvasBlockItemPropsEqual(
  prev: CanvasBlockItemProps,
  next: CanvasBlockItemProps,
): boolean {
  const prevIsFirst = prev.index === 0;
  const nextIsFirst = next.index === 0;
  const prevIsLast = prev.index === prev.totalBlocks - 1;
  const nextIsLast = next.index === next.totalBlocks - 1;

  return (
    prev.block === next.block &&
    prev.index === next.index &&
    prevIsFirst === nextIsFirst &&
    prevIsLast === nextIsLast &&
    prev.depth === next.depth &&
    prev.insideTemplate === next.insideTemplate &&
    prev.isDuplicateTemplate === next.isDuplicateTemplate &&
    prev.availableTemplates === next.availableTemplates
  );
}

export const CanvasBlockItem = React.memo(
  CanvasBlockItemInner,
  areCanvasBlockItemPropsEqual,
);
CanvasBlockItem.displayName = "CanvasBlockItem";

export default CanvasBlockItem;
