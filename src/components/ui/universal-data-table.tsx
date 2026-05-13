/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useTranslation } from "react-i18next"

import * as React from "react"
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileInput,
  FileOutput,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface ColumnConfig<T> {
  key: string
  label: string
  sortable?: boolean
  className?: string
  render?: (item: T) => React.ReactNode
}

interface UniversalDataTableProps<T> {
  data: T[]
  columns: ColumnConfig<T>[]
  isLoading?: boolean
  
  // Selection
  enableSelection?: boolean
  selectedIds?: Set<string | number>
  onSelectionChange?: (selectedIds: Set<string | number>) => void
  getRowId?: (item: T) => string | number

  // Search
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string

  // Filter
  onFilterClick?: () => void
  renderCustomFilter?: React.ReactNode
  expandedFilters?: React.ReactNode

  // Header Actions
  onImport?: () => void
  onExport?: () => void
  renderHeaderActions?: React.ReactNode

  // Sorting
  sortColumn?: string
  sortDirection?: "asc" | "desc" | null
  onSort?: (column: string) => void

  // Pagination
  currentPage: number
  totalPages: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  totalItems?: number

  // Row Actions
  renderRowActions?: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
  
  // Customization
  emptyMessage?: string
  minWidth?: string
  showSearch?: boolean
  showFilter?: boolean
  showImport?: boolean
  showExport?: boolean
  importText?: string
  exportText?: string
  filterText?: string
  renderTableActions?: () => React.ReactNode
  renderFilterPanel?: React.ReactNode
}

export function UniversalDataTable<T>({
  data,
  columns,
  isLoading = false,
  enableSelection = false,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId = (item: any) => item.id || item._id,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onFilterClick,
  renderCustomFilter,
  expandedFilters,
  onImport,
  onExport,
  renderHeaderActions,
  sortColumn,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
  renderRowActions,
  onRowClick,
  emptyMessage = "No data found.",
  minWidth = "800px",
  showSearch,
  showFilter,
  showImport,
  showExport,
  importText,
  exportText,
  filterText,
  renderTableActions,
  renderFilterPanel,
}: UniversalDataTableProps<T>) {
  const { t } = useTranslation("dashboard")
  const displaySearch = showSearch ?? (onSearchChange !== undefined || searchValue !== undefined)
  const displayFilter = showFilter ?? (onFilterClick !== undefined || renderCustomFilter !== undefined)
  const displayImport = showImport ?? onImport !== undefined
  const displayExport = showExport ?? onExport !== undefined
  const showHeader = displaySearch || displayFilter || displayImport || displayExport || renderHeaderActions !== undefined
  const allSelected = data.length > 0 && data.every((item) => selectedIds.has(getRowId(item)))
  const someSelected = data.some((item) => selectedIds.has(getRowId(item))) && !allSelected

  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    const newSelected = new Set(selectedIds)
    data.forEach((item) => {
      const id = getRowId(item)
      if (checked) {
        newSelected.add(id)
      } else {
        newSelected.delete(id)
      }
    })
    onSelectionChange(newSelected)
  }

  const handleSelectRow = (item: T, checked: boolean) => {
    if (!onSelectionChange) return
    const newSelected = new Set(selectedIds)
    const id = getRowId(item)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    onSelectionChange(newSelected)
  }

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" strokeWidth={1.5} />
    if (sortDirection === "asc") return <ArrowUp className="ml-2 h-4 w-4" strokeWidth={1.5} />
    return <ArrowDown className="ml-2 h-4 w-4" strokeWidth={1.5} />
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search and Header Actions */}
      {renderTableActions ? (
        renderTableActions()
      ) : showHeader ? (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            {displaySearch && (
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" strokeWidth={1.5} />
                <Input
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  className="pl-9 bg-background border-input h-10 rounded-lg placeholder:text-muted-foreground/60"
                />
              </div>
            )}
            {displayFilter && (
              renderCustomFilter || (
                <Button
                  variant="outline"
                  size="default"
                  className="h-10 gap-2 border-input"
                  onClick={onFilterClick}
                >
                  <Filter className="h-4 w-4" />
                  <span>{filterText || 'Filter'}</span>
                </Button>
              )
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {renderHeaderActions}
            {displayImport && onImport && (
              <Button variant="outline" className="h-10 gap-2 text-primary border-primary hover:bg-primary/5 px-4 rounded-lg" onClick={onImport}>
                <FileInput className="h-4 w-4" strokeWidth={1.5} />
                <span>Import</span>
              </Button>
            )}
            {displayExport && onExport && (
              <Button variant="outline" className="h-10 gap-2 text-primary border-primary hover:bg-primary/5 px-4 rounded-lg" onClick={onExport}>
                <FileOutput className="h-4 w-4" strokeWidth={1.5} />
                <span>Export</span>
              </Button>
            )}
          </div>
        </div>
      ) : null}

      {/* Filter Panel */}
      {renderFilterPanel}

      {expandedFilters}

      {/* Table Section */}
      <div className="rounded-[8px] border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth }}>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border bg-secondary/70 h-11.25">
                  {enableSelection && (
                    <TableHead className="w-12 pl-4 pr-0 h-11.25 align-middle">
                      <Checkbox
                        checked={allSelected || (someSelected ? "indeterminate" : false)}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                        className="w-4 h-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <TableHead
                      key={column.key}
                      className={cn(
                        "font-medium text-foreground text-sm h-11.25 py-0 px-2",
                        column.sortable && "cursor-pointer select-none",
                        column.className
                      )}
                      onClick={() => column.sortable && onSort?.(column.key)}
                    >
                      <div className="flex items-center h-full">
                        {column.label}
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </TableHead>
                  ))}
                  {renderRowActions && (
                    <TableHead className="font-medium text-foreground text-sm h-11.25 py-0 pr-12">
                      {t("common.table.actions", "Actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-row-${rowIndex}`} className="border-b border-border h-15 hover:bg-transparent">
                      {enableSelection && (
                        <TableCell className="w-12 pl-4 pr-0 h-15 align-middle">
                          <Skeleton className="h-4 w-4 rounded border-border" />
                        </TableCell>
                      )}
                      {columns.map((column) => (
                        <TableCell key={column.key} className={cn("py-0 px-2 h-15 align-middle", column.className)}>
                          <Skeleton className="h-4 w-[80%] max-w-[150px] rounded" />
                        </TableCell>
                      ))}
                      {renderRowActions && (
                        <TableCell className="p-0 h-15 w-15 align-middle">
                          <div className="flex items-center justify-center h-full">
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + (enableSelection ? 1 : 0) + (renderRowActions ? 1 : 0)}
                      className="h-32 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item) => {
                    const itemId = getRowId(item)
                    const isSelected = selectedIds.has(itemId)
                    return (
                      <TableRow
                        key={itemId}
                        className={cn(
                          "group transition-colors border-b border-border h-15 hover:bg-muted/30",
                          onRowClick && "cursor-pointer",
                          isSelected && "bg-muted/50"
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {enableSelection && (
                          <TableCell className="w-12 pl-4 pr-0 h-15 align-middle" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleSelectRow(item, !!checked)}
                              aria-label={`Select row ${itemId}`}
                              className="w-4 h-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={column.key} className={cn("py-0 px-2 h-15 whitespace-nowrap text-foreground text-sm align-middle", column.className)}>
                            {column.render ? column.render(item) : (item as any)[column.key]}
                          </TableCell>
                        ))}
                        {renderRowActions && (
                          <TableCell className="p-0 h-15 w-15 align-middle" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center h-full">
                              {renderRowActions(item)}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-2 pt-4 pb-0 px-0 h-auto lg:h-13">
        <div className="text-sm text-muted-foreground font-normal order-2 lg:order-1 flex-1">
          {t("tableInfo.rowsSelected", { count: selectedIds.size, total: totalItems || data.length, defaultValue: `${selectedIds.size} of ${totalItems || data.length} row(s) selected.` })}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8 order-1 lg:order-2 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground whitespace-nowrap">{t("tableInfo.rowsPerPage", "Rows per page")}</p>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="h-9 w-20 rounded-lg border-border bg-card px-4 py-2 font-medium text-foreground shadow-xs">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={2} className="w-20">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center text-sm font-medium text-foreground min-w-20">
            {t("tableInfo.pageOf", { current: currentPage, total: totalPages || 1, defaultValue: `Page ${currentPage} of ${totalPages || 1}` })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9  p-0 rounded-lg border-border bg-card shadow-xs opacity-50 disabled:opacity-30"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9  p-0 rounded-lg border-border bg-card shadow-xs opacity-50 disabled:opacity-30"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9  p-0 rounded-lg border-border bg-card shadow-xs opacity-50 disabled:opacity-30"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 p-0 rounded-lg border-border bg-card shadow-xs opacity-50 disabled:opacity-30"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
