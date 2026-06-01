"use client";

import { DataTablePagination } from "@/components/ui/data-table-pagination";

interface EmployeeTableProps {
  data: any[];
  t: any;
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function EmployeeTable({
  data,
  t,
  totalItems,
  pageSize,
  currentPage,
  onPageChange,
  onPageSizeChange,
}: EmployeeTableProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="overflow-hidden rounded-[12px] border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-start">
          <thead className="bg-muted/30">
            <tr className="border-b border-border/40">
              <th className="px-6 py-4 text-start text-xs font-bold text-foreground uppercase tracking-wider">{t("table.name")}</th>
              <th className="px-6 py-4 text-start text-xs font-bold text-foreground uppercase tracking-wider">{t("table.email")}</th>
              <th className="px-6 py-4 text-start text-xs font-bold text-foreground uppercase tracking-wider">{t("table.department")}</th>
              <th className="px-6 py-4 text-start text-xs font-bold text-foreground uppercase tracking-wider">{t("table.jobTitle")}</th>
              <th className="px-6 py-4 text-start text-xs font-bold text-foreground uppercase tracking-wider">{t("table.jobType")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {data.map((row: any) => (
              <tr key={row.id} className="hover:bg-primary/5 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-foreground">{row.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.email}</td>
                <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.department}</td>
                <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.jobTitle}</td>
                <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{row.jobType || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DataTablePagination
        totalItems={totalItems}
        pageSize={pageSize}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[10, 20, 50]}
        className="px-6 py-4 border-t border-border bg-background h-auto lg:h-13 pt-4"
      />
    </div>
  );
}
