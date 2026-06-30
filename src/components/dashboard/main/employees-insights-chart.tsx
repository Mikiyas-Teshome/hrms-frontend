'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAdminEmployeesInsightsChart } from '@/features/admin-dashboard/hooks/useAdminEmployeesInsightsChart';
import type { EmployeesInsightsChartRange } from '@/features/admin-dashboard/admin-chart.types';
import type { WidgetVisualization } from '@/features/admin-dashboard/admin-dashboard.types';

const chartConfig = {
  hires: {
    label: 'New hires',
    color: '#8A38F5',
  },
  leave: {
    label: 'Employees on leave',
    color: '#2865E3',
  },
} satisfies ChartConfig;

interface EmployeesInsightsChartProps {
  companyOuId: string;
  enabled?: boolean;
  visualization?: WidgetVisualization;
}

export function EmployeesInsightsChart({
  companyOuId,
  enabled = true,
  visualization = 'bar_chart',
}: EmployeesInsightsChartProps) {
  const { t } = useTranslation('dashboard');
  const {
    range,
    setRange,
    chartData,
    isLoading,
    scopeReady,
    hasData,
    hasNoSources,
  } = useAdminEmployeesInsightsChart(companyOuId, enabled);

  const showChart = scopeReady && !hasNoSources && !isLoading && hasData;
  const showEmpty = scopeReady && !hasNoSources && !isLoading && !hasData;

  const renderVisualization = () => {
    if (visualization === 'table') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('common.department', 'Department')}</TableHead>
              <TableHead>{t('charts.newHires', 'New hires')}</TableHead>
              <TableHead>{t('charts.employeesOnLeave', 'Employees on leave')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={row.department}>
                <TableCell className="font-medium">{row.department}</TableCell>
                <TableCell>{row.hires}</TableCell>
                <TableCell>{row.leave}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (visualization === 'pie_chart') {
      const totalHires = chartData.reduce((acc, row) => acc + (row.hires || 0), 0);
      const totalLeave = chartData.reduce((acc, row) => acc + (row.leave || 0), 0);
      const pieData = [
        { name: t('charts.newHires', 'New hires'), value: totalHires, color: 'var(--color-hires)' },
        { name: t('charts.employeesOnLeave', 'Employees on leave'), value: totalLeave, color: 'var(--color-leave)' },
      ];

      return (
        <>
          <ChartContainer config={chartConfig} className="h-52 w-full flex items-center justify-center">
            <PieChart width={300} height={208}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={70}
                strokeWidth={2}
                stroke="var(--background)"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {renderLegend()}
        </>
      );
    }

    if (visualization === 'line_chart') {
      return (
        <>
          <ChartContainer config={chartConfig} className="h-52 w-full">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis
                dataKey="department"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                className="text-muted-foreground"
                tick={{ fill: 'currentColor', fontSize: 10 }}
              />
              <YAxis hide />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              <Line
                type="monotone"
                dataKey="hires"
                stroke="var(--color-hires)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="leave"
                stroke="var(--color-leave)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
          {renderLegend()}
        </>
      );
    }

    return (
      <>
        <ChartContainer config={chartConfig} className="h-52 w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="department"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              className="text-muted-foreground"
              tick={{ fill: 'currentColor', fontSize: 10 }}
            />
            <YAxis hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="hires" fill="var(--color-hires)" radius={[4, 4, 0, 0]} barSize={25} />
            <Bar dataKey="leave" fill="var(--color-leave)" radius={[4, 4, 0, 0]} barSize={25} />
          </BarChart>
        </ChartContainer>
        {renderLegend()}
      </>
    );
  };

  const renderLegend = () => (
    <div className="mt-8 flex items-center justify-center gap-6">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-sm bg-[#8A38F5]" />
        <span className="text-xs text-foreground">{t('charts.newHires', 'New hires')}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-sm bg-primary" />
        <span className="text-xs text-foreground">
          {t('charts.employeesOnLeave', 'Employees on leave')}
        </span>
      </div>
    </div>
  );

  return (
    <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden flex flex-col h-full bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border">
        <CardTitle className="text-base font-medium text-foreground">
          {t('charts.employeesInsights', 'Employees insights')}
        </CardTitle>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => {
            if (value) {
              setRange(value as EmployeesInsightsChartRange);
            }
          }}
          className="bg-secondary p-1 rounded-lg"
        >
          <ToggleGroupItem
            value="3m"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('charts.last3Months', 'Last 3 months')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="30d"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('charts.last30Days', 'Last 30 days')}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="p-6">
        {!scopeReady ? null : hasNoSources ? (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noPermission', 'No access to employee or attendance data')}
          </div>
        ) : isLoading ? (
          <Skeleton className="h-52 w-full rounded-xl" />
        ) : showEmpty ? (
          <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noData', 'No employee insights for this period')}
          </div>
        ) : showChart ? (
          renderVisualization()
        ) : null}
      </CardContent>
    </Card>
  );
}
