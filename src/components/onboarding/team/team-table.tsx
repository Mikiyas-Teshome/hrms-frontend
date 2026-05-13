/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationFirst,
  PaginationLast,
} from "@/components/ui/pagination";
import { useOrganizationHierarchy } from "@/features/organization/hooks/useOrganization";
import { OrganizationUnitType } from "@/features/organization/organization.types";

interface TeamTableProps {
  t: any;
}

export function TeamTable({ t }: TeamTableProps) {
  const { data: hierarchy } = useOrganizationHierarchy();

  const flattenUnits = (units: OrganizationUnitType[]): OrganizationUnitType[] => {
    let flat: OrganizationUnitType[] = [];
    units.forEach((unit) => {
      flat.push(unit);
      if (unit.children?.length) flat = flat.concat(flattenUnits(unit.children));
    });
    return flat;
  };

  const allUnits = hierarchy ? flattenUnits(hierarchy) : [];

  return (
    <Card className="overflow-hidden rounded-2xl border-none shadow-none ring-1 ring-border bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-[#F4F4F4] border-b border-border text-[#111827]">
                <th className="px-6 py-4 text-start text-[14px] font-semibold whitespace-nowrap">Unit name</th>
                <th className="px-6 py-4 text-start text-[14px] font-semibold whitespace-nowrap">No. of members</th>
                <th className="px-6 py-4 text-start text-[14px] font-semibold whitespace-nowrap">Members</th>
                <th className="px-6 py-4 text-start text-[14px] font-semibold whitespace-nowrap">Manager</th>
                <th className="w-10 px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted bg-white">
              {allUnits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-muted-foreground/60">
                    No units available.
                  </td>
                </tr>
              ) : (
                allUnits.map((unit) => {
                  const membersList = unit.members?.map((m: any) => `${m.firstName} ${m.lastName}`).join(", ") || "No members";
                  const managerName = unit.members?.[0] ? `${unit.members[0].firstName} ${unit.members[0].lastName}` : "Unassigned";

                  return (
                    <tr key={unit.id} className="transition-colors hover:bg-muted/20 items-center">
                      <td className="px-6 py-4 text-[14px] font-normal text-[#1F2937]">{unit.name}</td>
                      <td className="px-6 py-4 text-[14px] font-normal text-[#1F2937]">{unit.totalMembers || unit.members?.length || 0}</td>
                      <td className="px-6 py-4 text-[14px] font-normal text-[#1F2937] truncate max-w-62.5">{membersList}</td>
                      <td className="px-6 py-4 text-[14px] font-normal text-[#1F2937]">{managerName}</td>
                      <td className="px-6 py-4 text-end">
                        <Button variant="ghost" size="icon" className="size-8 text-[#111827] hover:bg-muted/50 rounded-full">
                          <MoreVertical className="size-4.5" strokeWidth={2} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-muted px-6 py-4 sm:flex-row">
          <span className="text-[11px] font-medium text-muted-foreground">0 of {allUnits.length} row(s) selected.</span>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-foreground">Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-14 border-muted text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[11px] font-bold text-foreground">Page 1 of 1</span>
              <Pagination className="w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationFirst className="size-8 group" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious text={t("table.previous")} className="h-8 px-2" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLink isActive className="size-8">1</PaginationLink>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext text={t("table.next")} className="h-8 px-2" />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationLast className="size-8 group" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
