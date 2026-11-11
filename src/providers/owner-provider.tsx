"use client";

import React, { createContext, useContext } from "react";
import type { GithubOwnerPublic } from "@/lib/github";

interface OwnerContextValue {
  /** Public GitHub profile of the account that owns this deployment's token. */
  owner: GithubOwnerPublic | null;
  /** True once the root layout has attempted to resolve the owner. */
  isReady: boolean;
}

const OwnerContext = createContext<OwnerContextValue>({
  owner: null,
  isReady: false,
});

export function OwnerProvider({
  initialOwner,
  children,
}: {
  initialOwner: GithubOwnerPublic | null;
  children: React.ReactNode;
}) {
  return (
    <OwnerContext.Provider value={{ owner: initialOwner, isReady: true }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) {
    throw new Error("useOwner must be used within an OwnerProvider");
  }
  return ctx;
}
