"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaginationWrapperProps {
  t: any;
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationWrapper({ 
  t, 
  totalItems, 
  pageSize, 
  currentPage, 
  onPageChange, 
  onPageSizeChange 
}: PaginationWrapperProps) {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-muted px-6 py-4 sm:flex-row">
      <span className="text-xs font-medium text-muted-foreground">
        {t("table.rowsSelected", { count: 0, total: totalItems })}
      </span>
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{t("table.rowsPerPage")}</span>
          <Select 
            value={pageSize.toString()} 
            onValueChange={(val) => onPageSizeChange(parseInt(val))}
          >
            <SelectTrigger className="h-8 w-16 px-2 text-xs font-bold border-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-foreground">
            {t("table.pageCounter", { current: currentPage, total: totalPages })}
          </span>
          <Pagination className="w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationFirst 
                  className="size-8 group cursor-pointer" 
                  onClick={() => onPageChange(1)}
                  // disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationPrevious 
                  text={t("table.previous")} 
                  className="h-8 px-2 cursor-pointer" 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  // disabled={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink 
                  isActive 
                  className="size-8 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  text={t("table.next")} 
                  className="h-8 px-2 cursor-pointer" 
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  // disabled={currentPage === totalPages}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLast 
                  className="size-8 group cursor-pointer" 
                  onClick={() => onPageChange(totalPages)}
                  // disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
