"use client";

import React from "react";
import { LuFolderPlus, LuX } from "react-icons/lu";
import { Button, Modal, Spinner } from "@heroui/react";
import { useContent } from "../hooks/use-content-manager";

type Props = {
  isOpen?: boolean;
  onClose?: () => void;
  folderName?: string;
  onFolderNameChange?: (value: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};

export function CreateFolderModal(props: Props = {}) {
  const content = useContent();
  const isOpen = props.isOpen ?? content.isCreateFolderOpen;
  const onClose = props.onClose ?? content.handleCloseFolderModal;
  const folderName = props.folderName ?? content.folderName;
  const onFolderNameChange = props.onFolderNameChange ?? content.setFolderName;
  const onSubmit = props.onSubmit ?? content.handleCreateFolder;
  const isSubmitting =
    props.isSubmitting ??
    (content.isCreatingFolder || content.isSubmittingFolder);

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) onClose();
        }}
      >
        <Modal.Container size="sm">
          <Modal.Dialog className="rounded-2xl bg-muted/40 backdrop-blur-2xl border border-white/6 shadow-2xl text-white p-0 overflow-hidden">
            {/* Close button */}
            {!isSubmitting && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3.5 right-3.5 z-10 p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            )}

            {/* Header */}
            <div className="flex items-center gap-3.5 border-b border-white/5 px-5 pt-5 pb-4 pr-12">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent border border-accent/20">
                <LuFolderPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <Modal.Heading className="text-base font-semibold text-white">
                  Create Folder
                </Modal.Heading>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Organize your files in subdirectories
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
            >
              {/* Body */}
              <div className="px-5 pt-5 pb-5 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="create-folder-name"
                    className="block text-xs font-medium text-neutral-300"
                  >
                    Folder Name
                  </label>
                  <input
                    id="create-folder-name"
                    value={folderName}
                    onChange={(e) => onFolderNameChange(e.target.value)}
                    placeholder="e.g. projects, banners, certificates"
                    className="h-10 w-full rounded-xl border border-white/8 bg-white/4 px-3.5 text-xs text-white placeholder:text-neutral-500 outline-none transition-all focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-60"
                    autoFocus
                    disabled={isSubmitting}
                  />
                  <p className="text-[11px] text-neutral-500">
                    Use short, descriptive names. Avoid spaces or special
                    characters.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 border-t border-white/5 bg-white/2 px-5 py-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="rounded-xl border border-white/8 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-white/8 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  isDisabled={!folderName.trim() || isSubmitting}
                  isPending={isSubmitting}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting ? <Spinner color="current" size="sm" /> : null}
                  {isSubmitting ? "Creating..." : "Create Folder"}
                </Button>
              </div>
            </form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
