'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
    { department: 'Engineering', hires: 45, leave: 60 },
    { department: 'Sales', hires: 90, leave: 80 },
    { department: 'Marketing', hires: 55, leave: 25 },
    { department: 'Management', hires: 75, leave: 65 },
];

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

export function EmployeesInsightsChart() {
    const { t } = useTranslation('dashboard');

    return (
        <Card className="border border-border shadow-sm rounded-[10px] overflow-hidden flex flex-col h-full bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 border-b border-border">
                <CardTitle className="text-base font-medium text-foreground">
                    {t('charts.employeesInsights', 'Employees insights')}
                </CardTitle>
                <ToggleGroup
                    type="single"
                    defaultValue="3m"
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
                <ChartContainer config={chartConfig} className="h-52 w-full">
                    <BarChart
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
                        <YAxis
                            hide // Figma design hides Y axis for this chart
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <Bar
                            dataKey="hires"
                            fill="var(--color-hires)"
                            radius={[4, 4, 0, 0]}
                            barSize={25}
                        />
                        <Bar
                            dataKey="leave"
                            fill="var(--color-leave)"
                            radius={[4, 4, 0, 0]}
                            barSize={25}
                        />
                    </BarChart>
                </ChartContainer>
                <div className="mt-8 flex items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-sm bg-[#8A38F5]" />
                        <span className="text-xs text-foreground">
                            {t('charts.newHires', 'New hires')}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-sm bg-primary" />
                        <span className="text-xs text-foreground">
                            {t('charts.employeesOnLeave', 'Employees on leave')}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
