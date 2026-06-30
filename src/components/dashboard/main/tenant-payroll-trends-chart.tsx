'use client';

import { useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTenantPayrollTrendsChart } from '@/features/tenant-super-admin-dashboard/hooks/useTenantPayrollTrendsChart';
import type { TenantPayrollTrendRange } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.types';
import { formatIntlCurrency } from '@/lib/currency';

const chartConfig = {
  amount: {
    label: 'Spend',
    theme: {
      light: '#2865E3',
      dark: '#5B8DEF',
    },
  },
} satisfies ChartConfig;

export function TenantPayrollTrendsChart() {
  const { t } = useTranslation('dashboard');
  const {
    range,
    setRange,
    chartData,
    currency,
    isLoading,
    canReadPayrollRuns,
    scopeReady,
    showChart,
    showEmpty,
  } = useTenantPayrollTrendsChart();

  const formatAxisCurrency = useCallback((value: number) => {
    if (value >= 1000000) return formatIntlCurrency(value, currency, { notation: 'compact', compactDisplay: 'short' });
    if (value >= 1000) return formatIntlCurrency(value, currency, { notation: 'compact', compactDisplay: 'short' });
    return formatIntlCurrency(value, currency);
  }, [currency]);

  return (
    <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden flex flex-col bg-card">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between space-y-0 px-6 py-4 border-b border-border">
        <div className="space-y-1">
          <CardTitle className="text-base font-medium text-foreground">
            {t('tenantSuperAdmin.chart.title', 'Monthly Payroll Trends')}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {t(
              'tenantSuperAdmin.chart.subtitle',
              'Projected vs Actual spend for Fiscal Year 2025',
            )}
          </p>
        </div>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => {
            if (value) {
              setRange(value as TenantPayrollTrendRange);
            }
          }}
          className="bg-secondary p-1 rounded-lg shrink-0"
        >
          <ToggleGroupItem
            value="6m"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('tenantSuperAdmin.chart.last6Months', 'Last 6 months')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="12m"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('tenantSuperAdmin.chart.last12Months', 'Last 12 months')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="18m"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('tenantSuperAdmin.chart.last18Months', 'Last 18 months')}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="p-6">
        {!scopeReady ? null : !canReadPayrollRuns ? (
          <div className="flex h-59 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noPermission', 'No access to payroll data')}
          </div>
        ) : isLoading ? (
          <Skeleton className="h-59 w-full rounded-xl" />
        ) : showEmpty ? (
          <div className="flex h-59 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noData', 'No payroll data for this period')}
          </div>
        ) : showChart ? (
          <ChartContainer config={chartConfig} className="h-59 w-full">
            <AreaChart
              data={chartData}
              margin={{
                left: -10,
                right: 12,
                top: 10,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillPayroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 12 }}
                tickFormatter={formatAxisCurrency}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) =>
                      formatIntlCurrency(Number(value), currency)
                    }
                  />
                }
              />
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillPayroll)"
                fillOpacity={0.4}
                stroke="var(--color-amount)"
              />
            </AreaChart>
          </ChartContainer>
        ) : null}
      </CardContent>
    </Card>
  );
}
