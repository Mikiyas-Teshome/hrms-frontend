export type AttendanceChartRange = '7d' | '30d' | '3m';

export type EmployeesInsightsChartRange = '30d' | '3m';

export interface AttendanceRateChartPoint {
  label: string;
  rate: number;
}

export interface EmployeesInsightsChartRow {
  department: string;
  hires: number;
  leave: number;
}
