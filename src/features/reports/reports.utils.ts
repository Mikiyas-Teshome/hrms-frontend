import type {
    CreateCustomReportInput,
    CustomReportAggregation,
    CustomReportChartConfig,
    CustomReportChartConfigInput,
    CustomReportChartOptions,
    CustomReportDimension,
    CustomReportFiltersInput,
    CustomReportMeasure,
    CustomReportRunResult,
    CustomReportTimeGrain,
    CustomReportVisualization,
    HrReportFiltersInput,
    PayrollReportFiltersInput,
} from './reports.types';

export function filterByDateRange<T>(
    items: T[],
    getDate: (item: T) => Date | string,
    dateFrom: string,
    dateTo: string,
): T[] {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);

    return items.filter((item) => {
        const value = new Date(getDate(item));
        return !Number.isNaN(value.getTime()) && value >= from && value <= to;
    });
}

export function buildOuNameMap(
    units: Array<{ id: string; name: string; parentId?: string | null; children?: Array<{ id: string; name: string; children?: unknown[] }> }>,
): Map<string, string> {
    const map = new Map<string, string>();

    const walk = (nodes: typeof units) => {
        for (const node of nodes) {
            map.set(node.id, node.name);
            if (node.children?.length) {
                walk(node.children as typeof units);
            }
        }
    };

    walk(units);
    return map;
}

const EMPLOYEE_TYPE_TO_GQL: Record<NonNullable<HrReportFiltersInput['employeeType']>, string> = {
    all: 'ALL',
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    contract: 'CONTRACT',
    intern: 'INTERN',
    consultant: 'CONSULTANT',
};

const SORT_BY_TO_GQL: Record<NonNullable<HrReportFiltersInput['sortBy']>, string> = {
    firstName: 'FIRST_NAME',
    lastName: 'LAST_NAME',
    jobTitle: 'JOB_TITLE',
    status: 'STATUS',
    updatedAt: 'UPDATED_AT',
};

const SORT_ORDER_TO_GQL: Record<NonNullable<HrReportFiltersInput['sortOrder']>, string> = {
    asc: 'ASC',
    desc: 'DESC',
};

export function toGqlHrReportFilters(filters: HrReportFiltersInput) {
    return {
        ...filters,
        employeeType: filters.employeeType ? EMPLOYEE_TYPE_TO_GQL[filters.employeeType] : 'ALL',
        sortBy: filters.sortBy ? SORT_BY_TO_GQL[filters.sortBy] : 'UPDATED_AT',
        sortOrder: filters.sortOrder ? SORT_ORDER_TO_GQL[filters.sortOrder] : 'DESC',
    };
}

export function toGqlExportFormat(format: 'csv' | 'xlsx' | 'pdf'): string {
    return format.toUpperCase();
}

const PAYROLL_STATUS_TO_GQL: Record<NonNullable<PayrollReportFiltersInput['payrollStatus']>, string> = {
    all: 'ALL',
    active: 'ACTIVE',
    terminated: 'TERMINATED',
};

const PAYROLL_SORT_BY_TO_GQL: Record<NonNullable<PayrollReportFiltersInput['sortBy']>, string> = {
    employeeName: 'EMPLOYEE_NAME',
    basicSalary: 'BASIC_SALARY',
    totalAllowances: 'TOTAL_ALLOWANCES',
    totalDeductions: 'TOTAL_DEDUCTIONS',
    netPay: 'NET_PAY',
    createdAt: 'CREATED_AT',
};

const PAYROLL_SORT_ORDER_TO_GQL: Record<NonNullable<PayrollReportFiltersInput['sortOrder']>, string> = {
    asc: 'ASC',
    desc: 'DESC',
};

export function toGqlPayrollReportFilters(filters: PayrollReportFiltersInput) {
    return {
        ...filters,
        payrollStatus: filters.payrollStatus ? PAYROLL_STATUS_TO_GQL[filters.payrollStatus] : 'ALL',
        sortBy: filters.sortBy ? PAYROLL_SORT_BY_TO_GQL[filters.sortBy] : 'CREATED_AT',
        sortOrder: filters.sortOrder ? PAYROLL_SORT_ORDER_TO_GQL[filters.sortOrder] : 'DESC',
    };
}

const CUSTOM_DATA_SOURCE_TO_GQL: Record<CreateCustomReportInput['dataSource'], string> = {
    employees: 'EMPLOYEES',
    payroll: 'PAYROLL',
    attendance: 'ATTENDANCE',
    leave: 'LEAVE',
    department: 'DEPARTMENT',
};

const CUSTOM_FIELD_TO_GQL: Record<CreateCustomReportInput['fields'][number], string> = {
    name: 'NAME',
    department: 'DEPARTMENT',
    location: 'LOCATION',
    salary: 'SALARY',
    attendance: 'ATTENDANCE',
    payroll: 'PAYROLL',
    compliance: 'COMPLIANCE',
    leave_policy: 'LEAVE_POLICY',
    leave_status: 'LEAVE_STATUS',
    total_days: 'TOTAL_DAYS',
};

const CUSTOM_DIMENSION_TO_GQL: Record<CustomReportDimension, string> = {
    department: 'DEPARTMENT',
    name: 'NAME',
    location: 'LOCATION',
    compliance: 'COMPLIANCE',
    employment_type: 'EMPLOYMENT_TYPE',
    leave_policy: 'LEAVE_POLICY',
    leave_status: 'LEAVE_STATUS',
    ou_type: 'OU_TYPE',
    date: 'DATE',
};

const CUSTOM_MEASURE_TO_GQL: Record<CustomReportMeasure, string> = {
    record_count: 'RECORD_COUNT',
    headcount: 'HEADCOUNT',
    attendance: 'ATTENDANCE',
    salary: 'SALARY',
    payroll: 'PAYROLL',
    total_days: 'TOTAL_DAYS',
};

const CUSTOM_AGGREGATION_TO_GQL: Record<CustomReportAggregation, string> = {
    count: 'COUNT',
    sum: 'SUM',
    avg: 'AVG',
    min: 'MIN',
    max: 'MAX',
};

const CUSTOM_TIME_GRAIN_TO_GQL: Record<CustomReportTimeGrain, string> = {
    day: 'DAY',
    week: 'WEEK',
    month: 'MONTH',
};

const CUSTOM_VISUALIZATION_TO_GQL: Record<CreateCustomReportInput['visualization'], string> = {
    table: 'TABLE',
    pie: 'PIE',
    line: 'LINE',
    bar: 'BAR',
};

const normalizeCustomDataSource = (value: string): CreateCustomReportInput['dataSource'] =>
    value.toLowerCase() as CreateCustomReportInput['dataSource'];

const normalizeCustomField = (value: string): CreateCustomReportInput['fields'][number] =>
    value.toLowerCase() as CreateCustomReportInput['fields'][number];

export const normalizeCustomVisualization = (
    value: string,
): CreateCustomReportInput['visualization'] =>
    value.toLowerCase() as CreateCustomReportInput['visualization'];

const normalizeCustomDimension = (value: string): CustomReportDimension =>
    value.toLowerCase() as CustomReportDimension;

const normalizeCustomMeasure = (value: string): CustomReportMeasure =>
    value.toLowerCase() as CustomReportMeasure;

const normalizeCustomAggregation = (value: string): CustomReportAggregation =>
    value.toLowerCase() as CustomReportAggregation;

const normalizeCustomTimeGrain = (value: string): CustomReportTimeGrain =>
    value.toLowerCase() as CustomReportTimeGrain;

export function normalizeCustomChartConfig(
    config?: CustomReportChartConfig | null,
): CustomReportChartConfig | undefined {
    if (!config) {
        return undefined;
    }

    return {
        groupBy: normalizeCustomDimension(config.groupBy),
        measure: normalizeCustomMeasure(config.measure),
        aggregation: normalizeCustomAggregation(config.aggregation),
        timeGrain: config.timeGrain ? normalizeCustomTimeGrain(config.timeGrain) : undefined,
    };
}

export function normalizeCustomReportRunResult(result: CustomReportRunResult): CustomReportRunResult {
    return {
        ...result,
        visualization: normalizeCustomVisualization(result.visualization),
        chartConfig: normalizeCustomChartConfig(result.chartConfig),
    };
}

export function buildDefaultChartConfig(
    chartOptions: CustomReportChartOptions | undefined,
    visualization: CustomReportVisualization,
): CustomReportChartConfigInput | undefined {
    if (!chartOptions || visualization === 'table') {
        return undefined;
    }

    if (visualization === 'line') {
        const dateDimension = chartOptions.dimensions.find((item) => item.value === 'date');
        const measure =
            chartOptions.measures.find((item) => item.value === chartOptions.defaultMeasure) ??
            chartOptions.measures[0];

        return {
            groupBy: dateDimension?.value ?? 'date',
            measure: measure.value,
            aggregation: measure.defaultAggregation,
            timeGrain: 'week',
        };
    }

    const dimension =
        chartOptions.dimensions.find((item) => item.value === chartOptions.defaultDimension) ??
        chartOptions.dimensions.find((item) => item.value !== 'date') ??
        chartOptions.dimensions[0];
    const measure =
        chartOptions.measures.find((item) => item.value === chartOptions.defaultMeasure) ??
        chartOptions.measures[0];

    return {
        groupBy: dimension.value === 'date' ? chartOptions.defaultDimension : dimension.value,
        measure: measure.value,
        aggregation: measure.defaultAggregation,
    };
}

export function normalizeChartOptions(
    chartOptions: CustomReportChartOptions,
): CustomReportChartOptions {
    return {
        defaultDimension: normalizeCustomDimension(chartOptions.defaultDimension),
        defaultMeasure: normalizeCustomMeasure(chartOptions.defaultMeasure),
        dimensions: chartOptions.dimensions.map((item) => ({
            ...item,
            value: normalizeCustomDimension(item.value),
        })),
        measures: chartOptions.measures.map((item) => ({
            ...item,
            value: normalizeCustomMeasure(item.value),
            allowedAggregations: item.allowedAggregations.map((aggregation) =>
                normalizeCustomAggregation(aggregation),
            ),
            defaultAggregation: normalizeCustomAggregation(item.defaultAggregation),
        })),
    };
}

export function formatChartConfigSummary(config: CustomReportChartConfig): string {
    const parts = [
        config.groupBy.replace(/_/g, ' '),
        config.aggregation,
        config.measure.replace(/_/g, ' '),
    ];
    if (config.timeGrain) {
        parts.push(`by ${config.timeGrain}`);
    }
    return parts.join(' · ');
}

function omitEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined && value !== null && value !== ''),
    ) as Partial<T>;
}

export function toGqlCustomReportFilters(filters: CustomReportFiltersInput) {
    return omitEmpty({
        companyOuId: filters.companyOuId,
        divisionOuId: filters.divisionOuId,
        subDivisionOuId: filters.subDivisionOuId,
        departmentOuId: filters.departmentOuId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        employeeId: filters.employeeId,
        payrollRunId: filters.payrollRunId,
        employeeType: filters.employeeType ? EMPLOYEE_TYPE_TO_GQL[filters.employeeType] : undefined,
    });
}

function toGqlChartConfigInput(chartConfig?: CustomReportChartConfigInput) {
    if (!chartConfig) {
        return undefined;
    }

    return omitEmpty({
        groupBy: CUSTOM_DIMENSION_TO_GQL[chartConfig.groupBy],
        measure: CUSTOM_MEASURE_TO_GQL[chartConfig.measure],
        aggregation: CUSTOM_AGGREGATION_TO_GQL[chartConfig.aggregation],
        timeGrain: chartConfig.timeGrain ? CUSTOM_TIME_GRAIN_TO_GQL[chartConfig.timeGrain] : undefined,
    });
}

export function toGqlCreateCustomReportInput(input: CreateCustomReportInput) {
    const dataSource = normalizeCustomDataSource(input.dataSource);
    const visualization = normalizeCustomVisualization(input.visualization);

    return omitEmpty({
        name: input.name,
        description: input.description,
        dataSource: CUSTOM_DATA_SOURCE_TO_GQL[dataSource] ?? input.dataSource,
        visualization: CUSTOM_VISUALIZATION_TO_GQL[visualization] ?? input.visualization,
        fields: input.fields.map((field) => {
            const normalizedField = normalizeCustomField(field);
            return CUSTOM_FIELD_TO_GQL[normalizedField] ?? field;
        }),
        filters: toGqlCustomReportFilters(input.filters),
        chartConfig: toGqlChartConfigInput(input.chartConfig),
    });
}
