"use client";

import React, { useRef, useState } from "react";
import { LuUpload } from "react-icons/lu";
import { cn } from "@heroui/react";

type Props = {
  onUpload: (files: File[]) => void;
  disabled?: boolean;
};

export function ContentUploadDropzone({ onUpload, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (disabled) return;
        const files = Array.from(e.dataTransfer.files || []);
        if (files.length > 0) onUpload(files);
      }}
      className={cn(
        "rounded-2xl border-2 border-dashed p-6 transition-all duration-200 text-center",
        isDragOver
          ? "border-accent bg-accent/10"
          : "border-white/8 bg-white/2 hover:border-white/16 hover:bg-white/4",
      )}
    >
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-accent">
          <LuUpload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Drop files here</p>
          <p className="text-xs text-neutral-400 mt-0.5">
            or select files from your computer
          </p>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) onUpload(files);
            e.currentTarget.value = "";
          }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="mt-2 rounded-xl border border-white/8 bg-white/6 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
        >
          Choose Files
        </button>
      </div>
    </div>
  );
}
