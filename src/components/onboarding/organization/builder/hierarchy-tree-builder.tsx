"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog";
import { Maximize } from "lucide-react";

interface OrgUnit {
  id: string;
  name: string;
  type: string;
  displayLabel?: string | null;
  parentId?: string | null;
  children?: OrgUnit[] | null;
  [key: string]: any;
}

interface LevelDef {
  name: string;
  type: string;
  isActive: boolean;
}

interface HierarchyTreeBuilderProps {
  hierarchy?: OrgUnit[] | null;
  levels: LevelDef[];
  nomenclature?: Array<{ label: string; type: string; language: string }>;
  onAddUnit: (levelIdx: number, parentId?: string) => void;
  onEditUnit: (unitId: string) => void;
  onDeleteUnit: (unitId: string) => void;
  onViewUnit: (unitId: string) => void;
  t: (key: string, options?: any) => string;
}

const LEVEL_COLORS = [
  { text: "text-primary", border: "border-l-primary", accent: "var(--primary)" },
  { text: "text-[#EA580C]", border: "border-l-[#EA580C]", accent: "#EA580C" },
  { text: "text-[#A855F7]", border: "border-l-[#A855F7]", accent: "#A855F7" },
  { text: "text-[#10B981]", border: "border-l-[#10B981]", accent: "#10B981" },
  { text: "text-[#9C2780]", border: "border-l-[#9C2780]", accent: "#9C2780" },
];

const TypingText = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

export function HierarchyTreeBuilder({
  hierarchy,
  levels,
  nomenclature,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
  onViewUnit,
  t,
}: HierarchyTreeBuilderProps) {
  const [viewFull, setViewFull] = useState(false);

  // Drag to scroll hook
  const useDragToScroll = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);

    const onMouseDown = (e: React.MouseEvent) => {
      if (!ref.current) return;
      setIsDragging(true);
      setStartX(e.pageX);
      setStartY(e.pageY);
      setScrollLeft(ref.current.scrollLeft);
      setScrollTop(ref.current.scrollTop);
    };

    const onMouseMove = (e: React.MouseEvent) => {
      if (!isDragging || !ref.current) return;
      e.preventDefault();
      const x = e.pageX;
      const y = e.pageY;
      const walkX = x - startX;
      const walkY = y - startY;
      ref.current.scrollLeft = scrollLeft - walkX;
      ref.current.scrollTop = scrollTop - walkY;
    };

    const onMouseUp = () => setIsDragging(false);
    const onMouseLeave = () => setIsDragging(false);

    return { 
      ref, 
      onMouseDown, 
      onMouseMove, 
      onMouseUp, 
      onMouseLeave,
      isDragging 
    };
  };

  const mainDrag = useDragToScroll();
  const fullDrag = useDragToScroll();

  const activeLevels = levels.filter((l, i) => i === 0 || l.isActive);
  const rootNode = hierarchy?.[0];

  const getLabel = (type: string, depth: number) => {
    const nom = nomenclature?.find((n) => n.type === type);
    if (nom) return nom.label;
    const levelDef = activeLevels.find(l => l.type === type);
    if (levelDef) return levelDef.name;
    return `Level ${depth + 1}`;
  };

  const getColor = (depth: number) => LEVEL_COLORS[depth % LEVEL_COLORS.length];

  const renderTree = (isModal = false) => (
    <div className={cn("inline-flex items-start py-10 px-4 min-w-full")}>
      {rootNode ? (
        <div className="flex flex-row items-start">
          <div className="shrink-0 relative">
            <NodeCard
              node={rootNode}
              depth={0}
              color={getColor(0)}
              label={getLabel(rootNode.type, 0)}
              onEdit={() => onEditUnit(rootNode.id)}
              onDelete={() => onDeleteUnit(rootNode.id)}
            />
          </div>
          <ChildrenColumn
            parentNode={rootNode}
            depth={0}
            levels={levels}
            activeLevels={activeLevels}
            getColor={getColor}
            getLabel={getLabel}
            onAddUnit={onAddUnit}
            onEditUnit={onEditUnit}
            onDeleteUnit={onDeleteUnit}
          />
        </div>
      ) : (
        <div className="text-slate-400 text-sm font-medium pl-4 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
          <TypingText text={t("hierarchy.buildingDatabase", "Wait a second, until the database creation is finished...")} />
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-card/50 border border-border shadow-sm rounded-[12px] p-8 space-y-10 flex flex-col h-[750px]">
        <div className="flex items-center bg-background p-1 rounded-full shadow-sm border border-border w-fit">
          <button 
            onClick={() => setViewFull(true)}
            className="p-2 hover:bg-muted rounded-full transition-all group cursor-pointer"
            title="View Full Screen"
          >
            <Maximize className="size-5 text-primary group-hover:scale-110 transition-transform" />
          </button>
        </div>
        
        <div 
          ref={mainDrag.ref}
          onMouseDown={mainDrag.onMouseDown}
          onMouseMove={mainDrag.onMouseMove}
          onMouseUp={mainDrag.onMouseUp}
          onMouseLeave={mainDrag.onMouseLeave}
          className={cn(
            "flex-1 min-h-0 overflow-auto border border-transparent rounded-lg scrollbar-thin transition-colors",
            mainDrag.isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          )}
        >
          {renderTree()}
        </div>
      </div>

      <Dialog open={viewFull} onOpenChange={setViewFull}>
        <DialogContent className="max-w-[98vw] w-full max-h-[95vh] h-full bg-background p-0 overflow-hidden rounded-[12px] border-border flex flex-col">
          <div className="sr-only">
            <DialogTitle>Organizational Hierarchy</DialogTitle>
            <DialogDescription>Full view of the organization structure</DialogDescription>
          </div>
          <div 
            ref={fullDrag.ref}
            onMouseDown={fullDrag.onMouseDown}
            onMouseMove={fullDrag.onMouseMove}
            onMouseUp={fullDrag.onMouseUp}
            onMouseLeave={fullDrag.onMouseLeave}
            className={cn(
              "flex-1 overflow-auto bg-muted/20 flex items-start justify-start p-12 w-full h-full transition-colors",
              fullDrag.isDragging ? "cursor-grabbing select-none" : "cursor-grab"
            )}
          >
            <div className="scale-[0.85] origin-top-left pointer-events-none">
              <div className="pointer-events-auto">
                {renderTree(true)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}


function ChildrenColumn({
  parentNode,
  depth,
  levels,
  activeLevels,
  getColor,
  getLabel,
  onAddUnit,
  onEditUnit,
  onDeleteUnit,
}: {
  parentNode: OrgUnit;
  depth: number;
  levels: LevelDef[];
  activeLevels: LevelDef[];
  getColor: (depth: number) => any;
  getLabel: (type: string, depth: number) => string;
  onAddUnit: (levelIdx: number, parentId?: string) => void;
  onEditUnit: (unitId: string) => void;
  onDeleteUnit: (unitId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const children = parentNode.children ?? [];
  const hasNextLevel = depth + 1 < activeLevels.length;

  useEffect(() => {
    if (!selectedId && children.length > 0) {
      setSelectedId(children[0].id);
    }
  }, [children, selectedId]);

  if (!hasNextLevel) return null;

  const hasAddButton = depth + 1 < activeLevels.length;

  return (
    <div className="flex flex-row items-start shrink-0">
      {/* Stem from parent card */}
      <div className="w-[20px] h-[2px] bg-primary/20 rounded-full shrink-0 mt-[35.5px]" />

      {/* Column container */}
      <div className="flex flex-col relative h-fit">
        {/* Child Cards Column */}
        {children.map((child, index) => {
          const isSelected = child.id === selectedId;
          const childColor = getColor(depth + 1);
          const isFirst = index === 0;
          const isLastChild = index === children.length - 1;

          return (
            <div key={child.id} className="flex flex-row items-start relative min-h-[71px] pb-5">
              {(!isLastChild || hasAddButton) && (
                <div className="absolute left-0 w-[2.5px] bg-primary/20 rounded-full" style={{ top: '35.5px', bottom: 0 }} />
              )}
              {!isFirst && (
                <div className="absolute left-0 w-[2.5px] bg-primary/20 rounded-full" style={{ top: 0, height: '35.5px' }} />
              )}

              {/* Branch from trunk to child card */}
              <div className="w-[20px] h-[2px] bg-primary/20 rounded-full shrink-0 mt-[35.5px]" />
              
              <div className="flex flex-row items-start">
                <div
                  className={cn(
                    "transition-all duration-300 cursor-pointer shrink-0",
                    !isSelected ? "opacity-40 grayscale-[20%] hover:opacity-70" : "opacity-100"
                  )}
                  onClick={() => setSelectedId(child.id)}
                >
                  <NodeCard
                    node={child}
                    depth={depth + 1}
                    color={childColor}
                    label={getLabel(child.type, depth + 1)}
                    onEdit={() => onEditUnit(child.id)}
                    onDelete={() => onDeleteUnit(child.id)}
                  />
                </div>

                {/* Recursion for grandchildren */}
                {isSelected && (
                  <ChildrenColumn
                    parentNode={child}
                    depth={depth + 1}
                    levels={levels}
                    activeLevels={activeLevels}
                    getColor={getColor}
                    getLabel={getLabel}
                    onAddUnit={onAddUnit}
                    onEditUnit={onEditUnit}
                    onDeleteUnit={onDeleteUnit}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Add level button row */}
        {hasAddButton && (
          <div className={cn("flex flex-row items-start relative h-[48px]", children.length === 0 ? "mt-[11.5px]" : "")}>
            {children.length > 0 && (
              <div className="absolute left-0 w-[2.5px] bg-primary/20 rounded-full" style={{ top: 0, height: '24px' }} />
            )}
            <div className="w-[20px] h-[2px] bg-primary/20 rounded-full shrink-0 mt-[24px]" />
            <button
              onClick={() => {
                const levelDef = activeLevels[depth + 1];
                const realLevelIdx = levels.findIndex((l: LevelDef) => l.type === levelDef.type);
                onAddUnit(realLevelIdx, parentNode.id);
              }}
              className="w-[170px] h-[48px] rounded-[16px] border-2 border-dashed border-primary/30 bg-background flex items-center justify-center gap-2 hover:bg-muted hover:border-primary/50 transition-all shrink-0 cursor-pointer"
            >
              <Plus className="size-4.5 text-primary" />
              <span className="text-[13px] font-medium text-muted-foreground">
                Add {getLabel(activeLevels[depth + 1]?.type, depth + 1)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


function NodeCard({
  node,
  depth,
  color,
  label,
  onEdit,
  onDelete,
}: {
  node: OrgUnit;
  depth: number;
  color: any;
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isRoot = depth === 0;

  return (
    <div
      className={cn(
        "relative w-[170px] h-[71px] bg-card rounded-[16px] shrink-0 border-l-[4px] shadow-sm",
        color.border
      )}
    >
      <div className="absolute inset-0 rounded-[16px] border border-border border-l-0 pointer-events-none" />
      <div className="w-full h-full flex flex-col justify-center px-4 min-w-0">
        <span className={cn("text-[10px] font-bold uppercase tracking-[1.2px] leading-none mb-1.5 truncate pr-6", color.text)}>
          {label}
        </span>
        <h4 className="text-[14px] font-bold text-card-foreground truncate leading-tight">
          {node.name}
        </h4>
      </div>
      <div className="absolute flex items-center gap-2.5 top-[10px] right-[10px]">
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-muted-foreground hover:text-foreground cursor-pointer">
          <Pencil className="size-[13px] stroke-[2.5px]" />
        </button>
        {!isRoot && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-destructive/70 hover:text-destructive cursor-pointer">
            <Trash2 className="size-[13px] stroke-[2.5px]" />
          </button>
        )}
      </div>
    </div>
  );
}
