"use client";

import React from "react";
import { Modal, cn } from "@heroui/react";
import { LuX, LuLoaderCircle } from "react-icons/lu";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDanger = false,
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && !isLoading && onClose()}
        isDismissable={!isLoading}
        variant="opaque"
      >
        <Modal.Container size="md">
          <Modal.Dialog className="p-0! overflow-hidden rounded-[26px] bg-neutral-900/75 backdrop-blur-2xl border border-white/4 shadow-2xl text-foreground w-full max-w-lg mx-auto">
            {/* Top Window Bar */}
            <div className="flex items-center justify-between px-4 pt-3.5 pb-2 select-none">
              <span className="text-xs font-medium text-neutral-400 font-inter truncate pr-4">
                {title}
              </span>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                aria-label="Close"
                className="size-6 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
              >
                <LuX className="size-3.5" />
              </button>
            </div>

            {/* Inner Inset Content Card */}
            <div className="mx-2 mb-2 p-4 rounded-3xl bg-neutral-800/50 border border-white/5 flex flex-col gap-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold font-rethink text-white tracking-tight leading-snug">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-inter leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Bottom Actions Row (Right-Aligned) */}
              <div className="flex items-center justify-end gap-3 sm:gap-4 pt-10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-sm font-medium text-neutral-300 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {cancelText}
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "rounded-full px-6 py-2.5 text-sm font-semibold transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                    isDanger
                      ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                      : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-white/10",
                  )}
                >
                  {isLoading && (
                    <LuLoaderCircle className="size-4 animate-spin" />
                  )}
                  <span>{confirmText}</span>
                </button>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default ConfirmModal;
