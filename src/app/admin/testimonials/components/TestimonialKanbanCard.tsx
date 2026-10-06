"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TestimonialType } from "@/types";
import { TestimonialCard } from "./TestimonialCard";
import { cn } from "@heroui/react";

interface TestimonialKanbanCardProps {
  testimonial: TestimonialType;
  onEdit: (item: TestimonialType) => void;
  onDelete: (item: TestimonialType) => void;
}

export const TestimonialKanbanCard: React.FC<TestimonialKanbanCardProps> =
  React.memo(function TestimonialKanbanCard({ testimonial, onEdit, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useSortable({
        id: String(testimonial.id),
        data: { testimonial },
      });

    return (
      <div
        ref={setNodeRef}
        data-id={String(testimonial.id)}
        {...listeners}
        {...attributes}
        style={{
          transform: CSS.Translate.toString(transform),
          // Smoothly animate neighbors making room; the dragged card follows instantly
          transition: isDragging
            ? undefined
            : "transform 250ms cubic-bezier(0.2, 0, 0, 1)",
          willChange: "transform",
        }}
        className={cn(
          "relative z-10 cursor-grab active:cursor-grabbing touch-manipulation",
          // The DragOverlay renders the lifted copy — hide the original so it
          // looks like the whole card is picked up (space is kept for sorting)
          isDragging && "invisible pointer-events-none",
        )}
      >
        <TestimonialCard
          testimonial={testimonial}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    );
  });
