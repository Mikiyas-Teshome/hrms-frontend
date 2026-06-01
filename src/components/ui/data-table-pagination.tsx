"use client"

import { useTranslation } from "react-i18next"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const paginationNavButtonClassName =
  "h-9 w-9 p-0 rounded-lg border-border bg-background text-foreground shadow-xs hover:bg-muted hover:text-foreground"

interface DataTablePaginationProps {
  selectedCount?: number
  totalItems: number
  pageSize: number
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  className?: string
  pageSizeOptions?: number[]
}

export function DataTablePagination({
  selectedCount = 0,
  totalItems,
  pageSize,
  currentPage,
  totalPages,
  onPageChange,
  onPageSizeChange,
  className,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps) {
  const { t } = useTranslation("dashboard")
  const resolvedTotalPages = totalPages || 1

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-center justify-between gap-2 pt-4 pb-0 px-0 h-auto lg:h-13",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground font-normal order-2 lg:order-1 flex-1">
        {t("tableInfo.rowsSelected", {
          count: selectedCount,
          total: totalItems,
          defaultValue: `${selectedCount} of ${totalItems} row(s) selected.`,
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 order-1 lg:order-2 w-full lg:w-auto">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground whitespace-nowrap">
            {t("tableInfo.rowsPerPage", "Rows per page")}
          </p>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-9 w-20 rounded-lg border-border bg-background px-4 py-2 font-medium text-foreground shadow-xs">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={2} className="w-20">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium text-foreground min-w-20">
          {t("tableInfo.pageOf", {
            current: currentPage,
            total: resolvedTotalPages,
            defaultValue: `Page ${currentPage} of ${resolvedTotalPages}`,
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={paginationNavButtonClassName}
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={paginationNavButtonClassName}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={paginationNavButtonClassName}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === resolvedTotalPages}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={paginationNavButtonClassName}
            onClick={() => onPageChange(resolvedTotalPages)}
            disabled={currentPage === resolvedTotalPages}
          >
            <ChevronsRight className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { paginationNavButtonClassName }
