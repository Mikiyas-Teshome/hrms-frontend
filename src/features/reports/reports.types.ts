export interface AttendanceOverviewPoint {
    label: string;
    present: number;
    absent: number;
    onLeave: number;
}

export interface HeadcountTrendPoint {
    label: string;
    value: number;
}

export interface HrReportSummary {
    totalEmployees: number;
    newHires: number;
    attendanceRate: number;
    complianceRate: number;
}

export interface HrEmployeeReportRow {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
    businessEmail?: string;
    status: string;
    departmentId?: string;
    departmentName?: string;
    attendance?: number;
    updatedAt?: string;
}

export interface PaginationMeta {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
}

export interface HrReportResponse {
    attendanceOverview: AttendanceOverviewPoint[];
    headcountTrend: HeadcountTrendPoint[];
    pagination: PaginationMeta;
    rows: HrEmployeeReportRow[];
    summary: HrReportSummary;
}

export interface ExportHrReportResult {
    fileName: string;
    mimeType: string;
    content: string;
}

export interface HrReportFiltersInput {
    companyOuId?: string;
    dateFrom: string;
    dateTo: string;
    divisionOuId?: string;
    employeeType?: 'all' | 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
    limit?: number;
    page?: number;
    search?: string;
    sortBy?: 'firstName' | 'lastName' | 'jobTitle' | 'status' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
    subDivisionOuId?: string;
}

export interface OuFilterOption {
    id: string;
    name: string;
    parentId?: string;
}

export interface HrReportFilterOptionsResponse {
    companies: OuFilterOption[];
    divisions: OuFilterOption[];
    subDivisions: OuFilterOption[];
}

export interface PayrollReportSummary {
    totalPayrollCost: number;
    netPay: number;
    totalDeductions: number;
    overtimeCost: number;
    currency?: string;
}

export interface PayrollTrendPoint {
    label: string;
    value: number;
}

export interface DeductionBreakdownPoint {
    name: string;
    value: number;
}

export interface PayrollEmployeeReportRow {
    id: string;
    employeeId: string;
    employeeName: string;
    basicSalary: number;
    totalAllowances: number;
    totalDeductions: number;
    netPay: number;
    status?: string;
    currency?: string;
}

export interface PayrollReportResponse {
    summary: PayrollReportSummary;
    payrollTrend: PayrollTrendPoint[];
    deductionsBreakdown: DeductionBreakdownPoint[];
    rows: PayrollEmployeeReportRow[];
    pagination: PaginationMeta;
}

export interface ExportPayrollReportResult {
    fileName: string;
    mimeType: string;
    content: string;
}

export interface PayrollReportFiltersInput {
    payrollRunId: string;
    companyOuId?: string;
    employeeId?: string;
    payrollStatus?: 'all' | 'active' | 'terminated';
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'employeeName' | 'basicSalary' | 'totalAllowances' | 'totalDeductions' | 'netPay' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface PayPeriodFilterOption {
    id: string;
    label: string;
    startDate: string;
    endDate: string;
    status: string;
}

export interface EmployeeFilterOption {
    id: string;
    label: string;
}

export interface PayrollReportFilterOptionsResponse {
    companies: OuFilterOption[];
    payPeriods: PayPeriodFilterOption[];
    employees: EmployeeFilterOption[];
}

export type CustomReportDataSource = 'employees' | 'payroll' | 'attendance' | 'leave' | 'department';
export type CustomReportVisualization = 'table' | 'pie' | 'line' | 'bar';
export type CustomReportField =
    | 'name'
    | 'department'
    | 'location'
    | 'salary'
    | 'attendance'
    | 'payroll'
    | 'compliance'
    | 'leave_policy'
    | 'leave_status'
    | 'total_days';

export type CustomReportDimension =
    | 'department'
    | 'name'
    | 'location'
    | 'compliance'
    | 'employment_type'
    | 'leave_policy'
    | 'leave_status'
    | 'ou_type'
    | 'date';

export type CustomReportMeasure =
    | 'record_count'
    | 'headcount'
    | 'attendance'
    | 'salary'
    | 'payroll'
    | 'total_days';

export type CustomReportAggregation = 'count' | 'sum' | 'avg' | 'min' | 'max';
export type CustomReportTimeGrain = 'day' | 'week' | 'month';

export interface CustomReportChartConfigInput {
    groupBy: CustomReportDimension;
    measure: CustomReportMeasure;
    aggregation: CustomReportAggregation;
    timeGrain?: CustomReportTimeGrain;
}

export type CustomReportChartConfig = CustomReportChartConfigInput;

export interface CustomReportChartMeasureOption {
    value: CustomReportMeasure;
    label: string;
    allowedAggregations: CustomReportAggregation[];
    defaultAggregation: CustomReportAggregation;
}

export interface CustomReportChartDimensionOption {
    value: CustomReportDimension;
    label: string;
}

export interface CustomReportChartOptions {
    dimensions: CustomReportChartDimensionOption[];
    measures: CustomReportChartMeasureOption[];
    defaultDimension: CustomReportDimension;
    defaultMeasure: CustomReportMeasure;
}

export interface CustomReportFiltersInput {
    companyOuId?: string;
    divisionOuId?: string;
    subDivisionOuId?: string;
    departmentOuId?: string;
    dateFrom?: string;
    dateTo?: string;
    employeeType?: 'all' | 'full_time' | 'part_time' | 'contract' | 'intern' | 'consultant';
    payrollRunId?: string;
    employeeId?: string;
}

export interface CreateCustomReportInput {
    name: string;
    description?: string;
    dataSource: CustomReportDataSource;
    filters: CustomReportFiltersInput;
    fields: CustomReportField[];
    visualization: CustomReportVisualization;
    chartConfig?: CustomReportChartConfigInput;
}

export interface CustomReportListFiltersInput {
    page?: number;
    limit?: number;
    search?: string;
    companyOuId?: string;
}

export interface CustomReportListItem {
    id: string;
    name: string;
    dataSource: string;
    filtersSummary: string;
    lastRunAt?: string;
    createdByName?: string;
}

export interface CustomReportsListResponse {
    items: CustomReportListItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface CustomReportDefinitionResponse {
    id: string;
    name: string;
    description?: string;
    dataSource: CustomReportDataSource;
    filters: CustomReportFiltersInput;
    fields: CustomReportField[];
    visualization: CustomReportVisualization;
    chartConfig?: CustomReportChartConfig;
    lastRunAt?: string;
    createdByName?: string;
    createdAt: string;
}

export interface CustomReportColumn {
    key: string;
    label: string;
}

export interface CustomReportChartPoint {
    label: string;
    value: number;
}

export interface CustomReportRunResult {
    visualization: CustomReportVisualization;
    columns: CustomReportColumn[];
    rows: Record<string, unknown>[];
    chartSeries: CustomReportChartPoint[];
    chartConfig?: CustomReportChartConfig;
}

export interface CustomReportFieldOption {
    value: CustomReportField;
    label: string;
}

export interface CustomReportDataSourceOption {
    value: CustomReportDataSource;
    label: string;
    fields: CustomReportFieldOption[];
    chartOptions: CustomReportChartOptions;
}

export interface CustomReportFilterOptionsResponse {
    companies: OuFilterOption[];
    divisions: OuFilterOption[];
    subDivisions: OuFilterOption[];
    departments: OuFilterOption[];
    payPeriods?: PayPeriodFilterOption[];
    dataSources: CustomReportDataSourceOption[];
}

export interface ExportCustomReportResult {
    fileName: string;
    mimeType: string;
    content: string;
}
