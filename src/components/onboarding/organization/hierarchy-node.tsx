import React from "react";
import { Building2, Users, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface HierarchyNodeProps {
  index: number;
  isLast?: boolean;
  inner?: React.ReactNode;
  hierarchyLevels: any[];
  t: any;
  register: any;
  isLevelSwitchDisabled: (index: number) => boolean;
  handleLevelToggle: (index: number, checked: boolean) => void;
  handleUpdateNomenclature: () => void;
}

export const HierarchyNode = ({
  index,
  isLast,
  inner,
  hierarchyLevels,
  t,
  register,
  isLevelSwitchDisabled,
  handleLevelToggle,
  handleUpdateNomenclature,
}: HierarchyNodeProps) => {
  const isActive = index === 0 ? true : !!hierarchyLevels[index]?.isActive;
  const Icon = index < 3 ? Building2 : Users;
  const isDisabled = isLevelSwitchDisabled(index);

  return (
    <div
      className={cn(
        "relative flex flex-col items-end isolate gap-8",
        index === 0 && "min-w-max pb-4"
      )}
    >
      {/* Row: Icon + Card */}
      <div className="relative flex flex-row items-center gap-3 self-stretch z-[1]">
        {isLast && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-[1.5px] bg-primary/20 dark:h-[2px] dark:bg-white z-0"
            style={{ 
              left: `calc(-1 * (${index} * var(--indent-size) - 24px))`, 
              width: `calc(${index} * var(--indent-size) - 24px)` 
            }}
            aria-hidden="true"
          />
        )}

        {/* Icon circle */}
        <div
          className="shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center z-[2]"
          style={{
            boxShadow: "0px 10px 15px -3px rgba(53, 37, 205, 0.2), 0px 4px 6px -4px rgba(53, 37, 205, 0.2)",
          }}
        >
          <Icon className="size-6 text-white" />
        </div>

        {/* Card */}
        <div
          className={cn(
            "flex-1 min-w-[200px] sm:min-w-[300px] flex flex-row justify-between items-center gap-4 px-4 py-4 rounded-[16px] border transition-all",
            isActive
              ? "bg-primary/[0.08] border-primary/30 dark:bg-[rgba(40,101,227,0.12)] dark:border-[rgba(40,101,227,0.5)] shadow-sm"
              : "bg-muted/30 border-border/50 opacity-40 grayscale"
          )}
        >
          {/* Left: label + input */}
          <div className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-bold text-primary dark:text-[#136DEC] uppercase tracking-[1px] leading-[15px] font-inter">
              {t("hierarchy.level", { number: index + 1 })}
            </span>
            <div className="relative w-[180px] sm:w-[260px] lg:w-[300px]">
              <Input
                {...register(`hierarchyLevels.${index}.name`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleUpdateNomenclature();
                  }
                }}
                className={cn(
                  "h-9 px-3 pr-8 rounded-[8px] text-sm font-semibold text-foreground dark:text-[#F5F5F5] font-albert-sans",
                  "bg-primary/[0.05] border border-primary/20 dark:bg-[rgba(181,212,255,0.1)] dark:border-[rgba(107,168,255,0.3)]",
                  "shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus-visible:ring-1 focus-visible:ring-primary/30",
                  !isActive && index !== 0 && "pointer-events-none opacity-50"
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
                <Info className="size-3 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Right: Switch */}
          <Switch
            checked={index === 0 ? true : isActive}
            onCheckedChange={(checked) => handleLevelToggle(index, checked)}
            disabled={isDisabled}
            className={cn(
              "shrink-0 h-5 w-9 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-[#2865E3] dark:data-[state=unchecked]:bg-[#333333]",
              isDisabled && "opacity-40 cursor-not-allowed"
            )}
          />
        </div>
      </div>

      {/* Nested child level node — Indented by var(--indent-size) to the right */}
      {inner && (
        <div className="w-full pl-[var(--indent-size)] relative">
          <div
            className="absolute left-[23px] top-[-80px] bottom-0 w-[1.5px] bg-primary/20 dark:w-[2px] dark:bg-white z-0"
            aria-hidden="true"
          />
          {inner}
        </div>
      )}
      {isLast && (
        <div 
          className="absolute right-full top-1/2 bottom-[-100px] bg-card dark:bg-[#1D1D1D] z-[1]"
          style={{ 
            left: `calc(-1 * ${index} * var(--indent-size))`, 
            width: `calc(${index} * var(--indent-size) - 4px)` 
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
