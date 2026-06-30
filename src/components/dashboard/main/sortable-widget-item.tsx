'use client';

import { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableWidgetItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export const SortableWidgetItem = forwardRef<HTMLDivElement, SortableWidgetItemProps>(
  function SortableWidgetItem({ id, children, className }, _ref) {
    const {
      attributes,
      listeners,
      setNodeRef,
      setActivatorNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'relative transition-all',
          isDragging && 'z-50 opacity-50',
          className,
        )}
      >
        <div className="relative">
          <button
            ref={setActivatorNodeRef}
            className="absolute top-2 left-2 z-20 cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          {children}
        </div>
      </div>
    );
  },
);
