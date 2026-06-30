'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/components/ui/sheet';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, Cell, XAxis, YAxis } from 'recharts';
import { CustomReportRunResult } from '@/features/reports/reports.types';
import { formatChartConfigSummary, normalizeCustomVisualization } from '@/features/reports/reports.utils';

const CHART_COLORS = ['#EA580C', '#0D9488', '#0F172A', '#F59E0B', '#2865E3', '#8A38F5'];

interface ViewCustomReportSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    reportName?: string;
    result?: CustomReportRunResult;
    isLoading?: boolean;
    isError?: boolean;
}

const formatChartAxisLabel = (label: string, isDateAxis: boolean): string => {
    if (!isDateAxis) {
        return label;
    }

    if (/^\d{4}-\d{2}$/.test(label)) {
        const [year, month] = label.split('-');
        return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, {
            month: 'short',
            year: 'numeric',
        });
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
        const [year, month, day] = label.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        });
    }

    return label;
};

const ViewCustomReportSheet = ({
    open,
    onOpenChange,
    reportName,
    result,
    isLoading,
    isError,
}: ViewCustomReportSheetProps) => {
    const { t, i18n } = useTranslation(['dashboard']);
    const visualization = result?.visualization
        ? normalizeCustomVisualization(result.visualization)
        : 'table';

    const columns: ColumnConfig<Record<string, unknown>>[] =
        result?.columns.map((column) => ({
            key: column.key,
            label: column.label,
            render: (item) => <span>{String(item[column.key] ?? '—')}</span>,
        })) ?? [];

    const chartData = useMemo(
        () =>
            (result?.chartSeries ?? []).map((point) => ({
                ...point,
                displayLabel: formatChartAxisLabel(point.label, result?.chartConfig?.groupBy === 'date'),
            })),
        [result?.chartSeries, result?.chartConfig?.groupBy],
    );

    const hasRows = (result?.rows.length ?? 0) > 0;
    const hasChartData = chartData.length > 0;
    const isSingleBucket =
        hasChartData &&
        chartData.length === 1 &&
        result?.chartConfig?.groupBy !== 'date';

    const chartConfigLabel = result?.chartConfig
        ? formatChartConfigSummary(result.chartConfig)
        : undefined;

    const measureChartConfig = useMemo(() => {
        const measure = result?.chartConfig?.measure ?? 'value';
        return {
            value: {
                label: measure.replace(/_/g, ' '),
                color: '#2865E3',
            },
        } satisfies ChartConfig;
    }, [result?.chartConfig?.measure]);

    const tableRows = useMemo(
        () =>
            (result?.rows ?? []).map((row, index) => ({
                ...row,
                id: `custom-report-row-${index}`,
            })),
        [result?.rows],
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            {open ? (
            <SheetContent side={i18n.dir() === 'rtl' ? 'left' : 'right'} className="w-full sm:max-w-[800px] overflow-y-auto p-0 border-none ltr:rounded-l-xl rtl:rounded-r-xl">
                <SheetHeader className="p-6 pb-2 text-start">
                    <SheetTitle className="text-2xl font-bold">{reportName ?? 'Report preview'}</SheetTitle>
                    <SheetDescription>
                        {chartConfigLabel
                            ? t('reports.view.chartSummary', 'Grouped by {{summary}}', { summary: chartConfigLabel })
                            : t('reports.view.preview', 'Preview of the latest report run.')}
                    </SheetDescription>
                </SheetHeader>

                <div className="p-6 pt-4 flex flex-col gap-6">
                    {isError ? (
                        <p className="text-sm text-destructive">
                            {t('reports.view.loadError', 'Failed to load report preview. Try again.')}
                        </p>
                    ) : null}

                    {!isError && isSingleBucket ? (
                        <p className="text-sm text-muted-foreground rounded-lg border border-border bg-muted/40 px-4 py-3">
                            {t(
                                'reports.view.singleBucketHint',
                                'All records fall into one group ({{label}}). Choose a different group-by field or add more variety in your data.',
                                { label: chartData[0]?.label ?? '—' },
                            )}
                        </p>
                    ) : null}

                    {!isError && visualization === 'table' ? (
                        <UniversalDataTable
                            data={tableRows}
                            columns={columns}
                            isLoading={isLoading}
                            currentPage={1}
                            totalPages={1}
                            pageSize={10}
                            onPageChange={() => undefined}
                            onPageSizeChange={() => undefined}
                            totalItems={result?.rows.length ?? 0}
                            showSearch={false}
                        />
                    ) : null}

                    {!isError && visualization === 'pie' && hasChartData ? (
                        <ChartContainer config={measureChartConfig} className="h-72 w-full">
                            <PieChart>
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Pie data={chartData} dataKey="value" nameKey="label" innerRadius={50}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={entry.label} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartLegend content={<ChartLegendContent />} />
                            </PieChart>
                        </ChartContainer>
                    ) : null}

                    {!isError && visualization === 'bar' && hasChartData ? (
                        <ChartContainer config={measureChartConfig} className="h-72 w-full">
                            <BarChart data={chartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="displayLabel"
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    angle={chartData.length > 6 ? -25 : 0}
                                    textAnchor={chartData.length > 6 ? 'end' : 'middle'}
                                    height={chartData.length > 6 ? 70 : 30}
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                            </BarChart>
                        </ChartContainer>
                    ) : null}

                    {!isError && visualization === 'line' && hasChartData ? (
                        <ChartContainer config={measureChartConfig} className="h-72 w-full">
                            <LineChart data={chartData}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="displayLabel"
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="var(--color-value)"
                                    strokeWidth={2}
                                    dot={{ r: 3 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    ) : null}

                    {!isError && !isLoading && !hasRows && !hasChartData ? (
                        <p className="text-sm text-muted-foreground">
                            {t('reports.view.noData', 'No data matched the selected filters.')}
                        </p>
                    ) : null}
                </div>
            </SheetContent>
            ) : null}
        </Sheet>
    );
};

export default ViewCustomReportSheet;
