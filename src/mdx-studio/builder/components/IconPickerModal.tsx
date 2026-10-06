"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Modal,
  Button,
  ColorPicker,
  ColorSwatch,
  ColorArea,
  ColorSlider,
  Label,
  parseColor,
} from "@heroui/react";
import {
  LuSearch,
  LuX,
  LuSparkles,
  LuCheck,
  LuRefreshCw,
} from "react-icons/lu";
import * as luIcons from "react-icons/lu";
import * as siIcons from "react-icons/si";
import { useIconPicker } from "./IconPickerContext";
import { cn } from "@heroui/react";

// Map of all icon components from both libraries
const ALL_ICONS_MAP: Record<
  string,
  React.ComponentType<{
    className?: string;
    size?: number;
    style?: React.CSSProperties;
  }>
> = {
  ...luIcons,
  ...siIcons,
};

const ALL_ICON_NAMES = [
  ...Object.keys(luIcons).filter((name) => name.startsWith("Lu")),
  ...Object.keys(siIcons).filter((name) => name.startsWith("Si")),
];

const COLOR_PRESETS = [
  { label: "Default", value: "", bg: "bg-white/20" },
  { label: "Emerald", value: "#34d399", bg: "bg-[#34d399]" },
  { label: "Sky", value: "#38bdf8", bg: "bg-[#38bdf8]" },
  { label: "Amber", value: "#fbbf24", bg: "bg-[#fbbf24]" },
  { label: "Rose", value: "#fb7185", bg: "bg-[#fb7185]" },
  { label: "Violet", value: "#a78bfa", bg: "bg-[#a78bfa]" },
  { label: "Cyan", value: "#22d3ee", bg: "bg-[#22d3ee]" },
  { label: "Orange", value: "#fb923c", bg: "bg-[#fb923c]" },
  { label: "Indigo", value: "#818cf8", bg: "bg-[#818cf8]" },
  { label: "Pink", value: "#f472b6", bg: "bg-[#f472b6]" },
];

const SIZE_PRESETS = [
  { label: "16px", value: "w-4 h-4" },
  { label: "20px", value: "w-5 h-5" },
  { label: "24px", value: "w-6 h-6" },
  { label: "32px", value: "w-8 h-8" },
];

const PAGE_SIZE = 120;

export const IconPickerModal: React.FC = () => {
  const { isOpen, target, closeIconPicker, insertIcon } = useIconPicker();
  const isReplacing = Boolean(target?.existingIcon);

  const [search, setSearch] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("w-4 h-4");
  const [page, setPage] = useState(1);

  // Sync state when opened or target changes (e.g. cursor inside existing icon)
  useEffect(() => {
    if (isOpen) {
      if (target?.existingIcon) {
        if (
          target.existingIcon.name &&
          ALL_ICONS_MAP[target.existingIcon.name]
        ) {
          setSelectedIconName(target.existingIcon.name);
        }
        if (target.existingIcon.size) {
          setSelectedSize(target.existingIcon.size);
        }
        if (target.existingIcon.color !== undefined) {
          setSelectedColor(target.existingIcon.color);
        }
      } else {
        setSelectedIconName(null);
        setSelectedColor("");
        setSelectedSize("w-4 h-4");
      }
      setSearch("");
      setPage(1);
    }
  }, [isOpen, target]);

  // Parse color for HeroUI ColorPicker
  const currentColorObj = useMemo(() => {
    try {
      if (selectedColor && selectedColor.startsWith("#")) {
        return parseColor(selectedColor);
      }
    } catch {}
    return parseColor("#0485F7");
  }, [selectedColor]);

  // Filter icon names based on search query
  const filteredIconNames = useMemo(() => {
    if (!search.trim()) {
      return ALL_ICON_NAMES;
    }

    const q = search.toLowerCase().trim();
    return ALL_ICON_NAMES.filter((name) => {
      // Strip leading Lu or Si prefix for clean search matching
      const cleaned = name.replace(/^(Lu|Si)/, "").toLowerCase();
      return cleaned.includes(q) || name.toLowerCase().includes(q);
    });
  }, [search]);

  // Paginated slice for instant smooth rendering of ~5,000 icons
  const displayedIcons = useMemo(() => {
    return filteredIconNames.slice(0, page * PAGE_SIZE);
  }, [filteredIconNames, page]);

  const handleConfirmInsert = () => {
    if (!selectedIconName) return;

    // Compose JSX tag with className for size/layout and raw inline CSS for color
    const classes = [selectedSize, "inline-block align-middle"]
      .filter(Boolean)
      .join(" ");

    const styleAttr = selectedColor
      ? ` style={{ color: "${selectedColor}" }}`
      : "";
    const tag = `<${selectedIconName} className="${classes}"${styleAttr} />`;
    insertIcon(tag);
  };

  const SelectedIconComp = selectedIconName
    ? ALL_ICONS_MAP[selectedIconName]
    : null;

  return (
    <Modal isOpen={isOpen} onOpenChange={(open) => !open && closeIconPicker()}>
      <Modal.Backdrop
        data-lenis-prevent
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
      >
        <Modal.Container data-lenis-prevent>
          <Modal.Dialog
            data-lenis-prevent
            className="max-w-3xl w-[calc(100vw-32px)] max-h-[85vh] flex flex-col p-0 overflow-hidden border border-white/10 rounded-2xl shadow-2xl text-white"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-white tracking-wide">
                  {isReplacing ? "Replace Icon" : "Insert Icon"}
                </h3>
                <p className="text-[11px] text-neutral-400">
                  {isReplacing
                    ? `Replacing <${target?.existingIcon?.name || "Icon"} /> at cursor`
                    : "Search from thousands of icons to insert directly"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeIconPicker}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            {/* Search Toolbar */}
            <div className="px-5 py-3 border-b border-white/[0.06] bg-black/20">
              <div className="relative w-full">
                <LuSearch className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search icons (e.g. react, terminal, user, check, heart, star)..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:border-accent/50 transition-colors"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                  >
                    <LuX className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Icon Grid Area */}
            <div
              data-lenis-prevent
              className="flex-1 overflow-y-auto p-4 max-h-[380px] min-h-[260px] overscroll-contain"
            >
              {displayedIcons.length === 0 ? (
                <div className="py-14 text-center">
                  <LuSearch className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">
                    No icons matching &ldquo;{search}&rdquo;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                  {displayedIcons.map((iconName) => {
                    const IconComp = ALL_ICONS_MAP[iconName];
                    if (!IconComp) return null;
                    const isSelected = selectedIconName === iconName;

                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setSelectedIconName(iconName)}
                        title={iconName}
                        className={cn(
                          "group relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-150 cursor-pointer select-none",
                          isSelected
                            ? "bg-accent/20 border-accent text-accent shadow-sm ring-1 ring-accent/40"
                            : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/20 text-neutral-300 hover:text-white",
                        )}
                      >
                        <IconComp className="w-5 h-5 mb-1.5 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] font-mono truncate max-w-full text-neutral-400 group-hover:text-neutral-200">
                          {iconName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Load More Button */}
              {displayedIcons.length < filteredIconNames.length && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-1.5 text-xs rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    Load More (
                    {filteredIconNames.length - displayedIcons.length}{" "}
                    remaining)
                  </button>
                </div>
              )}
            </div>

            {/* Footer with Customization Controls and Insert Button */}
            <div className="px-5 py-3.5 border-t border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Selected Icon Customizer */}
              <div className="flex flex-col gap-3">
                {selectedIconName && SelectedIconComp ? (
                  <div className="flex items-center gap-2 pr-3 border-r border-white/10">
                    <div className="p-1.5 rounded-lg bg-black/40 border border-white/10">
                      <SelectedIconComp
                        className="w-5 h-5"
                        style={
                          selectedColor ? { color: selectedColor } : undefined
                        }
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-mono font-medium text-white">
                        &lt;{selectedIconName} /&gt;
                      </span>
                      {selectedColor && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          {selectedColor}
                        </span>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* Size Presets */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-1">
                    {SIZE_PRESETS.map((sz) => (
                      <button
                        key={sz.value}
                        type="button"
                        onClick={() => setSelectedSize(sz.value)}
                        className={cn(
                          "px-2 py-0.5 text-[11px] rounded-md transition-colors cursor-pointer",
                          selectedSize === sz.value
                            ? "bg-accent/20 text-accent font-medium border border-accent/40"
                            : "bg-white/[0.04] text-neutral-400 hover:text-white",
                        )}
                      >
                        {sz.label}
                      </button>
                    ))}
                  </div>

                  {/* Color Presets & Custom HeroUI ColorPicker */}
                  <div className="flex items-center gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => setSelectedColor(c.value)}
                        title={c.label}
                        className={cn(
                          "w-4 h-4 rounded-full border border-white/20 transition-transform cursor-pointer relative",
                          c.bg,
                          selectedColor === c.value &&
                            "ring-2 ring-white scale-110",
                        )}
                      />
                    ))}

                    {/* HeroUI ColorPicker with Rainbow Swatch */}
                    <ColorPicker
                      value={currentColorObj}
                      onChange={(newColor) =>
                        setSelectedColor(newColor.toString("hex"))
                      }
                      className="inline-flex items-center"
                    >
                      <ColorPicker.Trigger
                        className={cn(
                          "cursor-pointer p-0 bg-transparent border-0 outline-none flex items-center justify-center transition-transform hover:scale-110",
                          selectedColor &&
                            !COLOR_PRESETS.some(
                              (c) => c.value === selectedColor,
                            ) &&
                            "scale-110",
                        )}
                      >
                        <div
                          title="Custom rainbow color picker"
                          className={cn(
                            "w-4 h-4 rounded-full border border-white/30 transition-all bg-[conic-gradient(#f43f5e,#fb923c,#facc15,#4ade80,#38bdf8,#818cf8,#c084fc,#f43f5e)]",
                            selectedColor &&
                              !COLOR_PRESETS.some(
                                (c) => c.value === selectedColor,
                              ) &&
                              "ring-2 ring-white scale-110",
                          )}
                        />
                      </ColorPicker.Trigger>
                      <ColorPicker.Popover
                        data-lenis-prevent
                        className="z-[100] p-3.5 bg-neutral-900/95 backdrop-blur-md border border-white/15 rounded-2xl shadow-2xl space-y-3 w-64 text-white"
                      >
                        <ColorArea
                          aria-label="Color area"
                          className="max-w-full h-32 rounded-xl overflow-hidden border border-white/10"
                          colorSpace="hsb"
                          xChannel="saturation"
                          yChannel="brightness"
                        >
                          <ColorArea.Thumb className="w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer" />
                        </ColorArea>
                        <ColorSlider
                          channel="hue"
                          className="gap-1 px-1"
                          colorSpace="hsb"
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <Label className="text-[11px] font-medium text-neutral-300">
                              Hue
                            </Label>
                            <ColorSlider.Output className="text-[11px] font-mono text-neutral-400" />
                          </div>
                          <ColorSlider.Track className="h-3 rounded-full border border-white/10">
                            <ColorSlider.Thumb className="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md cursor-pointer" />
                          </ColorSlider.Track>
                        </ColorSlider>
                      </ColorPicker.Popover>
                    </ColorPicker>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="h-full py-2 flex items-end gap-2 justify-end">
                <Button
                  size="sm"
                  isDisabled={!selectedIconName}
                  onPress={handleConfirmInsert}
                  className="font-medium disabled:opacity-30 rounded-xl"
                >
                  {isReplacing ? "Replace" : "Insert"}
                </Button>
              </div>
            </div>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
