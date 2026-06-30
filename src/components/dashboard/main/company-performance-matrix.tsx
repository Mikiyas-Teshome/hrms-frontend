'use client';

import { useMemo, useState } from 'react';
import { EllipsisVertical, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantCompanyMatrix } from '@/features/tenant-super-admin-dashboard/hooks/useTenantCompanyMatrix';
import type {
  CompanyMatrixFilter,
  CompanyPayrollStatus,
} from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.types';

const STATUS_STYLES: Record<CompanyPayrollStatus, string> = {
  paid: 'bg-green-50/50 dark:bg-green-500/10 border-green-100 dark:border-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-50/50 dark:hover:bg-green-500/10',
  pending:
    'bg-orange-50/50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20 text-orange-700 dark:text-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-500/10',
  canceled: 'bg-muted text-muted-foreground border-border hover:bg-muted',
};

export function CompanyPerformanceMatrix() {
  const { t } = useTranslation('dashboard');
  const { rows: liveRows, isLoading, scopeReady } = useTenantCompanyMatrix();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyMatrixFilter>('all');

  const statusLabel = (status: CompanyPayrollStatus) => {
    const key = `tenantSuperAdmin.matrix.status.${status}` as const;
    const defaults: Record<CompanyPayrollStatus, string> = {
      paid: 'Paid',
      pending: 'Pending',
      canceled: 'Canceled',
    };
    return t(key, defaults[status]);
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return liveRows.filter((row) => {
      const matchesStatus = statusFilter === 'all' || row.payrollStatus === statusFilter;
      const matchesSearch =
        !q ||
        row.companyUnit.toLowerCase().includes(q) ||
        row.region.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [liveRows, search, statusFilter]);

  return (
    <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden bg-card">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between space-y-0 px-6 py-4 border-b border-border">
        <CardTitle className="text-base font-medium text-foreground">
          {t('tenantSuperAdmin.matrix.title', 'Company Performance Matrix')}
        </CardTitle>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('tenantSuperAdmin.matrix.searchPlaceholder', 'Search companies...')}
              className="pl-9 h-9 rounded-lg"
            />
          </div>
          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(value) => {
              if (value) {
                setStatusFilter(value as CompanyMatrixFilter);
              }
            }}
            className="bg-secondary p-1 rounded-lg"
          >
            <ToggleGroupItem
              value="all"
              className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              {t('tenantSuperAdmin.matrix.filterAll', 'All')}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="paid"
              className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              {t('tenantSuperAdmin.matrix.filterPaid', 'Paid')}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="pending"
              className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              {t('tenantSuperAdmin.matrix.filterPending', 'Pending')}
            </ToggleGroupItem>
            <ToggleGroupItem
              value="canceled"
              className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
            >
              {t('tenantSuperAdmin.matrix.filterCanceled', 'Canceled')}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!scopeReady || isLoading ? (
          <div className="flex flex-col gap-3 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-4 w-24 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-20 rounded-md" />
              </div>
            ))}
          </div>
        ) : (
        <Table>
          <TableHeader className="bg-muted/30 dark:bg-muted/20">
            <TableRow>
              <TableHead className="text-xs font-medium">
                {t('tenantSuperAdmin.matrix.companyUnit', 'Company unit')}
              </TableHead>
              <TableHead className="text-xs font-medium">
                {t('tenantSuperAdmin.matrix.region', 'Region')}
              </TableHead>
              <TableHead className="text-xs font-medium">
                {t('tenantSuperAdmin.matrix.payrollStatus', 'Payroll status')}
              </TableHead>
              <TableHead className="text-xs font-medium">
                {t('tenantSuperAdmin.matrix.headcount', 'Headcount')}
              </TableHead>
              <TableHead className="text-xs font-medium">
                {t('tenantSuperAdmin.matrix.netSpend', 'Net spend')}
              </TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-sm">{row.companyUnit}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.region}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={STATUS_STYLES[row.payrollStatus]}
                  >
                    {statusLabel(row.payrollStatus)}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{row.headcount.toLocaleString()}</TableCell>
                <TableCell className="text-sm font-medium">{row.netSpend}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <EllipsisVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </CardContent>
    </Card>
  );
}
