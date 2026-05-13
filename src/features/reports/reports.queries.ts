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
  query HrReportFilterOptions {
    hrReportFilterOptions {
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
