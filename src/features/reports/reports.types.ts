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
    attendance?: string;
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

export interface HrReportFiltersInput {
    companyOuId?: string;
    dateFrom: string;
    dateTo: string;
    divisionOuId?: string;
    employeeType?: 'ALL' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN';
    limit?: number;
    page?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
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
