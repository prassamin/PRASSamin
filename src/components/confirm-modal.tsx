"use client";

import { Button, Modal, Spinner } from "@heroui/react";
import { LuCircleAlert, LuCircleHelp } from "react-icons/lu";

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
        onOpenChange={(open) => !open && onClose()}
        isDismissable={!isLoading}
        variant="opaque"
      >
        <Modal.Container size="md">
          <Modal.Dialog className="px-0! py-8">
            {({ close: handleClose }) => (
              <>
                <Modal.Body className="flex flex-col items-center text-center pb-10 gap-4">
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
                      isDanger
                        ? "bg-red-800/25 text-red-500"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {isDanger ? (
                      <LuCircleAlert size={32} />
                    ) : (
                      <LuCircleHelp size={32} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-[22px] font-bold tracking-tight text-foreground wrap-break-word">
                      {title}
                    </h3>
                    <p className="mx-auto max-w-[34ch] text-[15px] leading-6 text-muted-foreground wrap-break-word">
                      {description}
                    </p>
                  </div>
                </Modal.Body>
                <Modal.Footer className="flex gap-3 justify-center border-t-0">
                  <Button
                    variant="tertiary"
                    onPress={onClose}
                    isDisabled={isLoading}
                    className="font-medium text-foreground/70 hover:text-foreground"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    variant={isDanger ? "danger" : "primary"}
                    onPress={onConfirm}
                    isPending={isLoading}
                    className={`font-bold shadow-lg ${
                      isDanger ? "shadow-red-500/20 text-white" : "shadow-accent/20"
                    }`}
                  >
                    {isLoading ? <Spinner color="current" size="sm" /> : null}
                    {confirmText}
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default ConfirmModal;
