"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  pointerWithin,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { LuPlus } from "react-icons/lu";
import { toast } from "@heroui/react";
import { useRouter } from "@/hooks/use-router";
import { useConfirm } from "@/providers/confirm-provider";
import { useMdxStudio } from "@/mdx-studio";
import { TestimonialCategoryType, TestimonialType } from "@/types";
import { TestimonialKanbanCard } from "./components/testimonial-kanban-card";
import { TestimonialCard } from "./components/testimonial-card";
import {
  TestimonialForm,
  TestimonialFormData,
} from "./components/testimonial-form";
import {
  createTestimonialAction,
  updateTestimonialAction,
  reorderTestimonialsAction,
  deleteTestimonialAction,
  TestimonialActionInput,
} from "./actions";
import { cn } from "@heroui/react";

interface TestimonialsViewProps {
  testimonials?: TestimonialType[];
}

const COLUMNS: {
  key: TestimonialCategoryType;
  label: string;
}[] = [
  {
    key: "SOFTWARE_ENGINEER",
    label: "Software Engineer",
  },
  {
    key: "GUESTBOOK",
    label: "Guestbook",
  },
  {
    key: "MENTOR",
    label: "Mentor",
  },
];

/**
 * Circular status indicators matching the screenshot's Open/In Progress/Closed style.
 */
function ColumnStatusIndicator({
  category,
}: {
  category: TestimonialCategoryType;
}) {
  if (category === "SOFTWARE_ENGINEER") {
    // Green dashed ring with center dot (Open style)
    return (
      <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full border border-dashed border-emerald-400" />
        <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-400" />
      </span>
    );
  }

  if (category === "GUESTBOOK") {
    // Amber solid ring with center dot (In Progress style)
    return (
      <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full border border-amber-400" />
        <span className="relative inline-flex rounded-full h-1 w-1 bg-amber-400" />
      </span>
    );
  }

  // Rose solid ring with center dot (Closed style)
  return (
    <span className="relative flex h-3.5 w-3.5 items-center justify-center shrink-0">
      <span className="absolute inline-flex h-full w-full rounded-full border border-rose-400" />
      <span className="relative inline-flex rounded-full h-1 w-1 bg-rose-400" />
    </span>
  );
}

const KanbanColumn = React.memo(function KanbanColumn({
  column,
  items,
  isDraggingAny,
  onAdd,
  onEdit,
  onDelete,
}: {
  column: (typeof COLUMNS)[number];
  items: TestimonialType[];
  isDraggingAny: boolean;
  onAdd: () => void;
  onEdit: (item: TestimonialType) => void;
  onDelete: (item: TestimonialType) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.key });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-[320px] sm:w-87.5 shrink-0 flex-col rounded-2xl bg-muted/50 border border-white/4 p-3 transition-colors duration-200",
        // Backdrop blur is expensive while dragging — drop it during an active drag
        !isDraggingAny && "backdrop-blur-xl",
        isOver && "border-accent/40 bg-accent/4",
      )}
    >
      {/* Column header: Icon + Label + Count + Add */}
      <div className="flex items-center gap-2 px-1 pt-1 pb-3 select-none">
        <ColumnStatusIndicator category={column.key} />
        <h3 className="text-sm font-semibold text-foreground tracking-tight font-rethink">
          {column.label}
        </h3>
        <span className="text-xs font-mono font-medium text-neutral-500 ml-1">
          {items.length}
        </span>

        <button
          type="button"
          onClick={onAdd}
          title={`Add to ${column.label}`}
          aria-label={`Add to ${column.label}`}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-accent hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all duration-200 cursor-pointer"
        >
          <LuPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Column body: List of cards */}
      <div className="flex flex-1 flex-col gap-3 min-h-80">
        <SortableContext
          items={items.map((i) => String(i.id))}
          strategy={verticalListSortingStrategy}
        >
          {items.map((item) => (
            <TestimonialKanbanCard
              key={item.id}
              testimonial={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
});

export function TestimonialsView({ testimonials = [] }: TestimonialsViewProps) {
  const router = useRouter();
  const { openStudio } = useMdxStudio();
  const { confirm } = useConfirm();

  // Local copy for optimistic drag updates
  const [items, setItems] = useState<TestimonialType[]>(testimonials);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Track the real cursor position during drag (overlay measurements are unreliable)
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  useEffect(() => {
    setItems(testimonials);
  }, [testimonials]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleSave = useCallback(
    async (id: number | null, meta: TestimonialFormData, mdx: string) => {
      if (!meta.name?.trim()) {
        throw new Error("Client / Reviewer name is required.");
      }
      if (!meta.role?.trim()) {
        throw new Error("Role & Company is required.");
      }
      if (!meta.avatar?.trim()) {
        throw new Error("Client avatar is required.");
      }
      if (!mdx?.trim()) {
        throw new Error("Testimonial quote content is required.");
      }

      const payload: TestimonialActionInput = {
        name: meta.name.trim(),
        role: meta.role.trim(),
        category: meta.category,
        avatar: meta.avatar.trim(),
        quote: mdx.trim(),
      };

      if (id) {
        await updateTestimonialAction(id, payload);
        toast.success(
          `Updated testimonial from "${payload.name}" successfully.`,
        );
      } else {
        await createTestimonialAction(payload);
        toast.success(`Added testimonial from "${payload.name}" successfully.`);
      }

      router.refresh();
    },
    [router],
  );

  const handleOpenCreate = useCallback(
    (category?: TestimonialCategoryType) => {
      let currentMeta: TestimonialFormData = {
        name: "",
        role: "",
        category: category || "SOFTWARE_ENGINEER",
        avatar: "",
      };

      openStudio({
        title: "Testimonial Studio",
        documentName: "New Testimonial",
        initialMdx: "",
        informationSlot: (
          <TestimonialForm
            initialData={currentMeta}
            onChange={(next) => {
              currentMeta = next;
            }}
          />
        ),
        onSave: async (compiledMdx) => {
          await handleSave(null, currentMeta, compiledMdx);
        },
      });
    },
    [openStudio],
  );

  const handleOpenEdit = useCallback(
    (item: TestimonialType) => {
      let currentMeta: TestimonialFormData = {
        name: item.name || "",
        role: item.role || "",
        category: item.category || "SOFTWARE_ENGINEER",
        avatar: item.avatar || "",
      };

      openStudio({
        title: "Testimonial Studio",
        documentName: item.name,
        initialMdx: item.quote || "",
        informationSlot: (
          <TestimonialForm
            initialData={currentMeta}
            onChange={(next) => {
              currentMeta = next;
            }}
          />
        ),
        onSave: async (compiledMdx) => {
          await handleSave(item.id, currentMeta, compiledMdx);
        },
      });
    },
    [openStudio],
  );

  const handleDelete = useCallback(
    (item: TestimonialType) => {
      confirm({
        title: "Delete Testimonial?",
        description: `Are you sure you want to permanently delete the testimonial from "${item.name}"? This action cannot be undone.`,
        isDanger: true,
        confirmText: "Delete",
        onConfirm: async () => {
          try {
            await deleteTestimonialAction(item.id);
            toast.success(`Deleted testimonial from "${item.name}".`);
            router.refresh();
          } catch (error: any) {
            console.error("Delete testimonial error:", error);
            toast.danger(error?.message || "Failed to delete testimonial.");
            throw error;
          }
        },
      });
    },
    [confirm, router],
  );

  const activeItem = activeId
    ? items.find((i) => String(i.id) === activeId) || null
    : null;

  const collisionDetection: CollisionDetection = useCallback((args) => {
    // Pointer within droppable takes priority (handles cards & empty columns)
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // Fall back to closestCorners
    return closestCorners(args);
  }, []);

  const onDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const draggingId = String(active.id);
      const overId = String(over.id);

      // Dropped on itself → nothing to do
      if (overId === draggingId) return;

      const dragged = items.find((i) => String(i.id) === draggingId);
      if (!dragged) return;

      // Resolve the target column + insertion index
      const overIsColumn = COLUMNS.some((c) => c.key === overId);
      let targetCategory: TestimonialCategoryType;
      let targetInsertAt: number;

      if (overIsColumn) {
        targetCategory = overId as TestimonialCategoryType;
        targetInsertAt = Infinity; // append at end of column
      } else {
        const overItem = items.find((i) => String(i.id) === overId);
        if (!overItem) return;
        targetCategory = overItem.category;
        const colRemaining = items
          .filter((i) => String(i.id) !== draggingId)
          .filter((i) => i.category === targetCategory);
        const overIdx = colRemaining.findIndex((i) => String(i.id) === overId);
        let insertAt = overIdx === -1 ? colRemaining.length : overIdx;

        if (overIdx >= 0) {
          // Measure the live visual rect of the hovered card in the DOM
          // (over.rect from dnd-kit can be transform-agnostic and stale)
          const overEl = document.querySelector(
            `[data-id="${overId}"]`,
          ) as HTMLElement | null;
          const liveRect = overEl?.getBoundingClientRect();
          const rectTop = liveRect ? liveRect.top : over.rect.top;
          const rectHeight = liveRect ? liveRect.height : over.rect.height;
          const rectBottom = liveRect
            ? liveRect.bottom
            : over.rect.top + over.rect.height;
          const midY = rectTop + rectHeight / 2;

          const pointer = pointerRef.current;
          const pointerY = pointer?.y;

          const isLastCard = overIdx === colRemaining.length - 1;

          if (isLastCard) {
            // When dropping on/near the bottom-most card in the column:
            // Ensure any drop past the midpoint, below the card, or downward drag
            // places the card at the very bottom (after the last card) instead
            // of snapping back to the second-to-last spot.
            const isBelowMid = pointerY !== undefined && pointerY > midY;
            const isBelowCard =
              pointerY !== undefined && pointerY >= rectBottom;
            const isDownwardDrag =
              event.delta.y > 0 &&
              (pointerY === undefined ||
                pointerY > rectTop + rectHeight * 0.35);

            if (isBelowMid || isBelowCard || isDownwardDrag) {
              insertAt = colRemaining.length;
            }
          } else {
            if (pointerY !== undefined) {
              if (pointerY > midY) {
                insertAt = overIdx + 1;
              }
            } else if (event.delta.y > 0) {
              insertAt = overIdx + 1;
            }
          }
        }

        targetInsertAt = insertAt;
      }

      // Rebuild the board: remove dragged item, re-insert at target, re-rank every column
      const remaining = items.filter((i) => String(i.id) !== draggingId);
      const nextItems: TestimonialType[] = [];

      for (const col of COLUMNS) {
        let colList = remaining.filter((i) => i.category === col.key);
        if (col.key === targetCategory) {
          const insertAt = Math.min(targetInsertAt, colList.length);
          colList = [
            ...colList.slice(0, insertAt),
            { ...dragged, category: targetCategory },
            ...colList.slice(insertAt),
          ];
        }
        colList.forEach((item, idx) => {
          nextItems.push({ ...item, order: idx });
        });
      }

      // No change → bail
      const sameOrder = items.every(
        (it, idx) =>
          nextItems[idx] &&
          String(nextItems[idx].id) === String(it.id) &&
          nextItems[idx].order === it.order &&
          nextItems[idx].category === it.category,
      );
      if (sameOrder) return;

      // Optimistic update
      const previous = items;
      setItems(nextItems);

      try {
        await reorderTestimonialsAction(
          nextItems.map((i) => ({
            id: i.id,
            category: i.category,
            order: i.order,
          })),
        );
        router.refresh();
      } catch (err: any) {
        console.error("Reorder testimonials error:", err);
        toast.danger(err?.message || "Failed to save ordering.");
        setItems(previous);
      }
    },
    [items, router],
  );

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-rethink text-white tracking-tight">
            Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-inter mt-1.5 leading-relaxed">
            Organize reviews by category.
          </p>
        </div>
      </div>

      {/* Kanban Board — adding happens via each column's button */}
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-none items-start">
          {COLUMNS.map((column) => {
            const columnItems = items.filter((i) => i.category === column.key);
            return (
              <KanbanColumn
                key={column.key}
                column={column}
                items={columnItems}
                isDraggingAny={activeId !== null}
                onAdd={() => handleOpenCreate(column.key)}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            );
          })}
        </div>

        {/* Only the lifted card renders here — cheap per-frame drag */}
        <DragOverlay>
          {activeItem ? (
            <div className="pointer-events-none rotate-2 scale-[1.02] cursor-grabbing">
              <TestimonialCard
                testimonial={activeItem}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default TestimonialsView;
