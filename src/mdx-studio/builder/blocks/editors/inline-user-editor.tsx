"use client";

import React, { useState } from "react";
import {
  LuTriangleAlert as AlertTriangle,
  LuUser as User,
  LuImage as ImageIcon,
  LuLink as LinkIcon,
  LuX as X,
} from "react-icons/lu";
import { ImagePicker } from "@/components/image-picker";
import { MdxUser } from "@/components/mdx/mdx-user";

interface InlineUserBlockEditorProps {
  props: Record<string, any>;
  insideTemplate?: boolean;
  updateProp: (key: string, value: any) => void;
}

export const InlineUserBlockEditor: React.FC<InlineUserBlockEditorProps> =
  React.memo(({ props, insideTemplate = false, updateProp }) => {
    const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);

    return (
      <div className="space-y-4">
        <ImagePicker
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSelectImage={(data) => {
            updateProp("avatar", data.src);
            if (!props.name && data.alt) {
              updateProp("name", data.alt);
            }
            setIsImagePickerOpen(false);
          }}
          currentSrc={props.avatar}
        />

        {!insideTemplate && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Inline components must be defined inside an Inline Template to be
              used via shorthand{" "}
              <code className="font-mono">#template-name</code>.
            </span>
          </div>
        )}

        {/* Live Interactive Preview */}
        <div className="p-4 rounded-2xl bg-black/30 border border-sky-400/20 flex flex-col items-center justify-center text-center gap-2">
          <MdxUser
            name={props.name || "User"}
            avatar={props.avatar}
            role={props.role}
            href={props.href}
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-400" />
              <span>Name</span>
              <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              data-format-role="plain"
              value={props.name || ""}
              onChange={(e) => updateProp("name", e.target.value)}
              placeholder="e.g. Jane Doe"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-400">
                Role / Title
              </span>
            </label>
            <input
              type="text"
              data-format-role="plain"
              value={props.role || ""}
              onChange={(e) => updateProp("role", e.target.value)}
              placeholder="e.g. Lead Engineer, Acme"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400/60 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Avatar URL</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                data-format-role="plain"
                value={props.avatar || ""}
                onChange={(e) => updateProp("avatar", e.target.value)}
                placeholder="https://... image URL"
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setIsImagePickerOpen(true)}
                title="Choose from media library"
                className="p-2 rounded-xl bg-white/6 hover:bg-white/10 text-neutral-300 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              {props.avatar && (
                <button
                  type="button"
                  onClick={() => updateProp("avatar", "")}
                  title="Clear avatar"
                  className="p-2 rounded-xl bg-white/6 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>Profile Link</span>
            </label>
            <input
              type="text"
              data-format-role="plain"
              value={props.href || ""}
              onChange={(e) => updateProp("href", e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-white/4 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-400/60 transition-colors"
            />
          </div>
        </div>
      </div>
    );
  });

InlineUserBlockEditor.displayName = "InlineUserBlockEditor";
