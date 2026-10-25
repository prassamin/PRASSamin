"use client";

import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  FileJson,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@heroui/react";

export interface MdxFilesProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
}

export interface MdxFolderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  defaultOpen?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface MdxFileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  icon?: React.ReactNode;
  className?: string;
}

function getFileIcon(
  name: string,
  customIcon?: React.ReactNode,
): React.ReactNode {
  if (customIcon) return customIcon;
  const ext = (name.split(".").pop() || "").toLowerCase();
  switch (ext) {
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
      return <FileCode className="w-4 h-4 text-sky-400 shrink-0" />;
    case "json":
      return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    case "css":
    case "scss":
    case "sass":
      return <FileCode className="w-4 h-4 text-pink-400 shrink-0" />;
    case "md":
    case "mdx":
    case "txt":
      return <FileText className="w-4 h-4 text-emerald-400 shrink-0" />;
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "webp":
    case "gif":
      return <FileText className="w-4 h-4 text-purple-400 shrink-0" />;
    default:
      return <File className="w-4 h-4 text-neutral-400 shrink-0" />;
  }
}

export const MdxFiles: React.FC<MdxFilesProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "my-6 w-full rounded-2xl border border-white/[0.08] bg-muted/35 p-3 sm:p-3.5 shadow-sm not-prose font-sans backdrop-blur-sm space-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const MdxFolder: React.FC<MdxFolderProps> = ({
  name,
  defaultOpen = false,
  className,
  children,
  ...props
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={cn("select-none", className)} {...props}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm hover:bg-white/[0.04] transition-colors cursor-pointer group text-left"
      >
        <motion.div
          animate={{ scale: open ? 1.05 : 1 }}
          transition={{ duration: 0.15 }}
          className="shrink-0 flex items-center justify-center"
        >
          {open ? (
            <FolderOpen className="w-4 h-4 text-amber-400" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400/90" />
          )}
        </motion.div>
        <span className="font-mono text-xs sm:text-sm font-medium text-amber-200/90 group-hover:text-amber-100 transition-colors">
          {name}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="ms-3.5 flex flex-col border-l border-white/[0.08] ps-2.5 space-y-0.5 mt-0.5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const MdxFile: React.FC<MdxFileProps> = ({
  name,
  icon,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm hover:bg-white/[0.04] transition-colors select-none text-left",
        className,
      )}
      {...props}
    >
      {getFileIcon(name, icon)}
      <span className="font-mono text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors">
        {name}
      </span>
    </div>
  );
};

export { MdxFiles as Files, MdxFolder as Folder, MdxFile as File };

export default MdxFiles;
