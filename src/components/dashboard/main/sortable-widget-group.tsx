'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortableWidgetGroupProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SortableWidgetGroup({ id, children, className }: SortableWidgetGroupProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
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
        isDragging && 'z-50 opacity-60',
        className,
      )}
    >
      <div className="flex items-stretch gap-2">
        <button
          className="flex flex-col items-center justify-center w-8 cursor-grab active:cursor-grabbing rounded-lg hover:bg-muted/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          {...attributes}
          {...listeners}
          aria-label="Drag group to reorder"
        >
          <GripHorizontal className="h-5 w-5 text-muted-foreground rotate-90" />
        </button>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}
