import { gql } from 'graphql-request';

export const GET_HR_REPORT_QUERY = gql`
  query HrReport($filters: HrReportFiltersInput!) {
    hrReport(filters: $filters) {
      attendanceOverview {
        label
        present
        absent
        onLeave
      }
      headcountTrend {
        label
        value
      }
      pagination {
        total
        totalPages
        page
        limit
      }
      rows {
        id
        firstName
        lastName
        jobTitle
        businessEmail
        status
        departmentId
        departmentName
        attendance
        updatedAt
      }
      summary {
        totalEmployees
        newHires
        attendanceRate
        complianceRate
      }
    }
  }
`;

export const GET_HR_REPORT_FILTER_OPTIONS_QUERY = gql`
  query HrReportFilterOptions($companyOuId: String) {
    hrReportFilterOptions(companyOuId: $companyOuId) {
      companies {
        id
        name
        parentId
      }
      divisions {
        id
        name
        parentId
      }
      subDivisions {
        id
        name
        parentId
      }
    }
  }
`;

export const EXPORT_HR_REPORT_MUTATION = gql`
  mutation ExportHrReport($format: HrReportExportFormat!, $filters: HrReportFiltersInput!) {
    exportHrReport(format: $format, filters: $filters) {
      fileName
      mimeType
      content
    }
  }
`;

export const GET_PAYROLL_REPORT_QUERY = gql`
  query PayrollReport($filters: PayrollReportFiltersInput!) {
    payrollReport(filters: $filters) {
      summary {
        totalPayrollCost
        netPay
        totalDeductions
        overtimeCost
        currency
      }
      payrollTrend {
        label
        value
      }
      deductionsBreakdown {
        name
        value
      }
      pagination {
        total
        totalPages
        page
        limit
      }
      rows {
        id
        employeeId
        employeeName
        basicSalary
        totalAllowances
        totalDeductions
        netPay
        status
        currency
      }
    }
  }
`;

export const GET_PAYROLL_REPORT_FILTER_OPTIONS_QUERY = gql`
  query PayrollReportFilterOptions($companyOuId: String) {
    payrollReportFilterOptions(companyOuId: $companyOuId) {
      companies {
        id
        name
        parentId
      }
      payPeriods {
        id
        label
        startDate
        endDate
        status
      }
      employees {
        id
        label
      }
    }
  }
`;

export const EXPORT_PAYROLL_REPORT_MUTATION = gql`
  mutation ExportPayrollReport($format: PayrollReportExportFormat!, $filters: PayrollReportFiltersInput!) {
    exportPayrollReport(format: $format, filters: $filters) {
      fileName
      mimeType
      content
    }
  }
`;

export const GET_CUSTOM_REPORTS_QUERY = gql`
  query CustomReports($filters: CustomReportListFiltersInput!) {
    customReports(filters: $filters) {
      items {
        id
        name
        dataSource
        filtersSummary
        lastRunAt
        createdByName
      }
      page
      limit
      total
      totalPages
    }
  }
`;

export const GET_CUSTOM_REPORT_FILTER_OPTIONS_QUERY = gql`
  query CustomReportFilterOptions($companyOuId: String) {
    customReportFilterOptions(companyOuId: $companyOuId) {
      companies {
        id
        name
        parentId
      }
      divisions {
        id
        name
        parentId
      }
      subDivisions {
        id
        name
        parentId
      }
      departments {
        id
        name
        parentId
      }
      payPeriods {
        id
        label
        startDate
        endDate
        status
      }
      dataSources {
        value
        label
        fields {
          value
          label
        }
        chartOptions {
          defaultDimension
          defaultMeasure
          dimensions {
            value
            label
          }
          measures {
            value
            label
            allowedAggregations
            defaultAggregation
          }
        }
      }
    }
  }
`;

export const RUN_CUSTOM_REPORT_QUERY = gql`
  query RunCustomReport($id: String!) {
    runCustomReport(id: $id) {
      visualization
      chartConfig {
        groupBy
        measure
        aggregation
        timeGrain
      }
      columns {
        key
        label
      }
      rows
      chartSeries {
        label
        value
      }
    }
  }
`;

export const CREATE_CUSTOM_REPORT_MUTATION = gql`
  mutation CreateCustomReport($input: CreateCustomReportInput!) {
    createCustomReport(input: $input) {
      id
      name
      dataSource
      visualization
      createdAt
    }
  }
`;

export const DELETE_CUSTOM_REPORT_MUTATION = gql`
  mutation DeleteCustomReport($id: String!) {
    deleteCustomReport(id: $id)
  }
`;

export const EXPORT_CUSTOM_REPORT_MUTATION = gql`
  mutation ExportCustomReport($id: String!, $format: CustomReportExportFormat!) {
    exportCustomReport(id: $id, format: $format) {
      fileName
      mimeType
      content
    }
  }
`;
