"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import ConfirmModal from "@/components/confirm-modal";

export interface ConfirmOptions {
  /** Modal dialog title */
  title: string;
  /** Detailed description or confirmation message */
  description: string;
  /** Primary button text (default: "Confirm") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Whether the action is destructive (shows red alert styling) */
  isDanger?: boolean;
  /** Async callback executed when user clicks confirm */
  onConfirm?: () => Promise<void> | void;
  /** Callback executed when user cancels or closes modal */
  onCancel?: () => void;
}

export interface ConfirmContextType {
  /** Trigger confirmation dialog imperatively, resolving true on confirm or false on cancel */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Whether confirmation action is currently loading */
  isLoading: boolean;
  /** Set loading state manually if needed */
  setIsLoading: (loading: boolean) => void;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ConfirmOptions>({
    title: "",
    description: "",
  });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    setConfig(options);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (config.onConfirm) {
      setIsLoading(true);
      try {
        await config.onConfirm();
        if (resolver) resolver(true);
        setIsOpen(false);
      } catch (err) {
        console.error("[ConfirmProvider] Error in onConfirm:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (resolver) resolver(true);
      setIsOpen(false);
    }
  }, [resolver, config]);

  const handleCancel = useCallback(() => {
    if (config.onCancel) {
      config.onCancel();
    }
    if (resolver) resolver(false);
    setIsOpen(false);
  }, [resolver, config]);

  return (
    <ConfirmContext.Provider value={{ confirm, isLoading, setIsLoading }}>
      {children}
      <ConfirmModal
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        isDanger={config.isDanger || false}
        isLoading={isLoading}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
}
