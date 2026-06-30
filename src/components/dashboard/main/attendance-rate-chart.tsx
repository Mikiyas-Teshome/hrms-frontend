'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
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
import { useAdminAttendanceRateChart } from '@/features/admin-dashboard/hooks/useAdminAttendanceRateChart';
import type { AttendanceChartRange } from '@/features/admin-dashboard/admin-chart.types';
import type { WidgetVisualization } from '@/features/admin-dashboard/admin-dashboard.types';

const chartConfig = {
  rate: {
    label: 'Rate',
    color: '#2865E3',
  },
} satisfies ChartConfig;

interface AttendanceRateChartProps {
  companyOuId: string;
  enabled?: boolean;
  visualization?: WidgetVisualization;
}

export function AttendanceRateChart({
  companyOuId,
  enabled = true,
  visualization = 'area_chart',
}: AttendanceRateChartProps) {
  const { t } = useTranslation('dashboard');
  const {
    range,
    setRange,
    chartData,
    isLoading,
    canReadAttendance,
    scopeReady,
    hasData,
  } = useAdminAttendanceRateChart(companyOuId, enabled);

  const showChart = scopeReady && canReadAttendance && !isLoading && hasData;
  const showEmpty = scopeReady && canReadAttendance && !isLoading && !hasData;

  const renderTooltip = () => (
    <ChartTooltip
      cursor={false}
      content={
        <ChartTooltipContent
          hideLabel
          formatter={(value) =>
            t('charts.rateLabel', {
              value,
              defaultValue: `${value}%`,
            })
          }
        />
      }
    />
  );

  const renderVisualization = () => {
    if (visualization === 'table') {
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('charts.period', 'Period')}</TableHead>
              <TableHead>{t('charts.attendanceRate', 'Attendance rate')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chartData.map((row) => (
              <TableRow key={row.label}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>{row.rate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }

    if (visualization === 'pie_chart') {
      const PIE_COLORS = ['#EA580C', '#F59E0B', '#FBBF24', '#164E63', '#0D9488', '#2563EB', '#7C3AED', '#EC4899'];
      return (
        <ChartContainer config={chartConfig} className="h-59 w-full flex items-center justify-center">
          <PieChart width={300} height={236}>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) =>
                    t('charts.rateLabel', {
                      value,
                      defaultValue: `${value}%`,
                    })
                  }
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="rate"
              nameKey="label"
              innerRadius={55}
              outerRadius={75}
              strokeWidth={2}
              stroke="var(--background)"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      );
    }

    if (visualization === 'bar_chart') {
      return (
        <ChartContainer config={chartConfig} className="h-59 w-full">
          <BarChart
            data={chartData}
            margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#737373', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#737373', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            {renderTooltip()}
            <Bar dataKey="rate" fill="var(--color-rate)" radius={[4, 4, 0, 0]} barSize={28} />
          </BarChart>
        </ChartContainer>
      );
    }

    if (visualization === 'line_chart' || visualization === 'area_chart') {
      return (
        <ChartContainer config={chartConfig} className="h-59 w-full">
          <AreaChart
            data={chartData}
            margin={{ left: -20, right: 12, top: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-rate)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-rate)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#737373', fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: '#737373', fontSize: 12 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            {renderTooltip()}
            <Area
              dataKey="rate"
              type="natural"
              fill="url(#fillRate)"
              fillOpacity={0.4}
              stroke="var(--color-rate)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      );
    }

    return null;
  };

  return (
    <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden flex flex-col h-full bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border">
        <CardTitle className="text-base font-medium text-foreground">
          {t('charts.attendanceRate', 'Attendance rate')}
        </CardTitle>
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(value) => {
            if (value) {
              setRange(value as AttendanceChartRange);
            }
          }}
          className="bg-secondary p-1 rounded-lg"
        >
          <ToggleGroupItem
            value="7d"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('charts.last7Days', 'Last 7 days')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="30d"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('charts.last30Days', 'Last 30 days')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="3m"
            className="text-[10px] h-7 px-2 data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            {t('charts.last3Months', 'Last 3 months')}
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="p-6">
        {!scopeReady ? null : !canReadAttendance ? (
          <div className="flex h-59 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noPermission', 'No access to attendance data')}
          </div>
        ) : isLoading ? (
          <Skeleton className="h-59 w-full rounded-xl" />
        ) : showEmpty ? (
          <div className="flex h-59 items-center justify-center text-sm text-muted-foreground">
            {t('charts.noData', 'No attendance data for this period')}
          </div>
        ) : showChart ? (
          renderVisualization()
        ) : null}
      </CardContent>
    </Card>
  );
}
