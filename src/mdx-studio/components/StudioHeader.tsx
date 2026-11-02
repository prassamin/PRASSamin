"use client";

import React from "react";
import { LuArrowLeft, LuSave, LuLoaderCircle } from "react-icons/lu";
import { Tabs } from "@heroui/react";
import { useMdxStudio } from "../MdxStudioContext";

export const StudioHeader: React.FC = () => {
  const {
    isSaving,
    save,
    closeStudio,
    activeTab,
    goToTab,
    hasInformationTab,
  } = useMdxStudio();

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 z-40 select-none">
      {/* Left: Back button */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={closeStudio}
          className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer shrink-0"
        >
          <LuArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      {/* Center: Stage Stepper (Only when an Information tab is provided) */}
      {hasInformationTab && (
        <Tabs
          className="w-full max-w-md"
          onSelectionChange={(s) => goToTab(s as any)}
          selectedKey={activeTab}
        >
          <Tabs.ListContainer className="bg-muted">
            <Tabs.List aria-label="Studio Navigation">
              {[
                { id: "details", title: "Information" },
                { id: "builder", title: "Content" },
              ].map((tab) => (
                <Tabs.Tab
                  key={tab.id}
                  id={tab.id}
                  className="text-muted-foreground data-selected:text-white"
                >
                  {tab.title}
                  <Tabs.Indicator className="bg-background/50" />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      )}

      {/* Right: Save & Return button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          disabled={isSaving}
          onClick={save}
          className="flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-xl bg-accent text-neutral-950 font-semibold text-xs sm:text-sm hover:bg-accent/90 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? (
            <LuLoaderCircle className="w-4 h-4 animate-spin" />
          ) : (
            <LuSave className="w-4 h-4" />
          )}
          <span>Save</span>
        </button>
      </div>
    </header>
  );
};

export default StudioHeader;
