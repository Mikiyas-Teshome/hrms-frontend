"use client";

import { ChevronRight, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useOrganizationUnit } from "@/features/organization/hooks/useOrganization";
import { OrganizationUnitType } from "@/features/organization/organization.types";
import { cn } from "@/lib/utils";

interface UnitDetailSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  /** Flat list of all units for resolving full parent breadcrumbs */
  allUnits?: { id: string; name: string; parentId?: string | null }[];
  onAddChild?: (parentUnit: OrganizationUnitType) => void;
  childLabel?: string;
}

const typeColorMap: Record<string, string> = {
  GROUP:       "bg-violet-100 text-violet-700",
  COMPANY:     "bg-blue-100 text-blue-700",
  DIVISION:    "bg-indigo-100 text-indigo-700",
  SUB_DIVISION:"bg-amber-100 text-amber-700",
  DEPARTMENT:  "bg-emerald-100 text-emerald-700",
};

interface FieldCellProps {
  label: string;
  value?: string | null;
  colSpan?: boolean;
}
function FieldCell({ label, value, colSpan }: FieldCellProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border/60 bg-background p-4",
        colSpan && "col-span-2"
      )}
    >
      <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm font-medium text-foreground">
        {value || <span className="text-muted-foreground/50 italic">Unassigned</span>}
      </span>
    </div>
  );
}

export function UnitDetailSheet({
  isOpen,
  onOpenChange,
  unitId,
  allUnits = [],
  onAddChild,
  childLabel,
}: UnitDetailSheetProps) {
  const { data: unit, isLoading } = useOrganizationUnit(unitId);


  const getBreadcrumb = () => {
    if (!unit) return [];
    
    const lineage = [unit.name];
    let parentId = unit.parentId;
    let depth = 0;
    
    while (parentId && parentId !== "root" && depth < 20) {
      const parent = allUnits.find(u => u.id === parentId);
      if (parent) {
        lineage.unshift(parent.name);
        parentId = parent.parentId;
      } else {
        break;
      }
      depth++;
    }
    
    // Attempt adding root "Group Name" if available from units array implicitly
    if (parentId === "root") {
      const rootUnit = allUnits.find(u => u.id === "root");
      if (rootUnit) {
        lineage.unshift(rootUnit.name);
      }
    }
    
    return lineage;
  };

  const breadcrumb = getBreadcrumb();
  
  // Also calculate direct parent name for the generic "Parent" core field table
  const parentName = unit?.parentId && unit.parentId !== "root"
    ? allUnits.find((u) => u.id === unit.parentId)?.name ?? "—"
    : allUnits.find((u) => u.id === "root")?.name ?? "—";

  const getTitle = () => {
    if (!unit) return "Review unit";
    return `Review ${unit.displayLabel?.toLowerCase() ?? unit.type.toLowerCase()}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[640px] p-0 flex flex-col h-full border-l border-border/50 overflow-hidden">
        <SheetHeader className="p-6 flex flex-row items-center justify-between border-b border-border/30 shrink-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-tight capitalize">
            {getTitle()}
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : !unit ? (
          <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
            Unit not found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
            {/* ── Details card ── */}
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <div className="bg-muted/40 px-4 py-3 border-b border-border/30">
                <span className="text-sm font-semibold text-foreground">
                  {unit.displayLabel ?? unit.type} details
                </span>
              </div>
              <div className="p-4 space-y-3">
                {/* Hierarchy breadcrumb */}
                {breadcrumb.length > 0 && (
                  <div className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background p-4">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      Hierarchy relationship
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {breadcrumb.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-1.5">
                          {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground/50" />}
                          <span
                            className={cn(
                              "text-sm font-medium",
                              i === breadcrumb.length - 1
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {crumb}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Core fields grid */}
                <div className="grid grid-cols-2 gap-3">
                  <FieldCell label={`${unit.displayLabel ?? unit.type} name`} value={unit.name} />
                  <FieldCell label="Parent" value={parentName !== "—" ? parentName : undefined} />

                  {/* Company-specific fields from companyProfile */}
                  {unit.companyProfile && (
                    <>
                      <FieldCell label="Legal name" value={unit.companyProfile.legalName ?? undefined} />
                      <FieldCell label="Industry" value={unit.companyProfile.industry ?? undefined} />
                      <FieldCell label="Tax ID" value={unit.companyProfile.taxId ?? undefined} />
                      <FieldCell label="Registration Number" value={unit.companyProfile.registrationNumber ?? undefined} />
                      <FieldCell label="Trade License Number" value={unit.companyProfile.tradeLicenseNumber ?? undefined} />
                      <FieldCell label="DUNS Number" value={unit.companyProfile.dunsNumber ?? undefined} />
                      <FieldCell label="Timezone" value={unit.companyProfile.timezone?.replace('_', ' ') ?? undefined} />
                      <FieldCell label="Currency" value={unit.companyProfile.currency ?? undefined} />
                      {unit.companyProfile.address && (
                        <FieldCell label="HQ Address" value={unit.companyProfile.address} colSpan />
                      )}
                    </>
                  )}

                  {/* Generic for non-company */}
                  {!unit.companyProfile && (
                    <div className="col-span-2 py-4 text-center text-muted-foreground text-xs italic">
                      No additional profile details available.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Children card ── */}
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <div className="bg-muted/40 px-4 py-3 border-b border-border/30 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Children</span>
                {onAddChild && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddChild(unit)}
                    className="h-7 px-2 text-primary hover:bg-primary/5 font-medium text-xs gap-1"
                  >
                    <Plus className="size-3.5" />
                    {childLabel ? `Add ${childLabel}` : "Add child"}
                  </Button>
                )}
              </div>
              <div className="p-4">
                {!unit.children || unit.children.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No children yet.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {unit.children.map((child: OrganizationUnitType) => (
                      <div
                        key={child.id}
                        className="flex flex-col gap-1 rounded-xl border border-border/60 bg-background p-4"
                      >
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full w-fit",
                            typeColorMap[child.type] ?? "bg-muted text-muted-foreground"
                          )}
                        >
                          {child.displayLabel ?? child.type}
                        </span>
                        <span className="text-sm font-medium text-foreground mt-0.5">{child.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t border-border/30 bg-background flex justify-end shrink-0">
          <Button
            variant="outline"
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-10 px-6 rounded-lg border-border text-foreground hover:bg-muted/50"
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
