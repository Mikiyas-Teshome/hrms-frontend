'use client';

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

const chartData = [
    { month: 'Jan', rate: 220 },
    { month: 'Feb', rate: 300 },
    { month: 'Mar', rate: 230 },
    { month: 'Apr', rate: 120 },
    { month: 'May', rate: 180 },
    { month: 'Jun', rate: 240 },
];

const chartConfig = {
    rate: {
        label: 'Rate',
        color: '#2865E3',
    },
} satisfies ChartConfig;

export function AttendanceRateChart() {
    const { t } = useTranslation('dashboard');

    return (
        <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden flex flex-col h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border">
                <CardTitle className="text-base font-medium text-foreground">
                    {t('charts.attendanceRate', 'Attendance rate')}
                </CardTitle>
                <ToggleGroup
                    type="single"
                    defaultValue="7d"
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
                <ChartContainer config={chartConfig} className="h-59 w-full">
                    <AreaChart
                        data={chartData}
                        margin={{
                            left: -20,
                            right: 12,
                            top: 10,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="fillRate" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-rate)" stopOpacity={0.8} />
                                <stop
                                    offset="95%"
                                    stopColor="var(--color-rate)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E5E5" />
                        <XAxis
                            dataKey="month"
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
                            domain={[0, 400]}
                            ticks={[0, 100, 200, 300, 400]}
                        />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
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
            </CardContent>
        </Card>
    );
}
