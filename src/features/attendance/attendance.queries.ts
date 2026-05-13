export const HEALTH_CHECK_QUERY = `
  query HealthCheck {
    healthCheck
  }
`;

export const ASSIGN_EMPLOYEE_SHIFT_MUTATION = `
  mutation AssignEmployeeShift($input: CreateEmployeeShiftInput!) {
    assignEmployeeShift(input: $input) {
      id
      userId
      companyId
      shiftTemplateId
      startDate
      endDate
      shiftTemplate {
        id
        name
        startTime
        endTime
        type
      }
    }
  }
`;

export const BULK_ASSIGN_EMPLOYEE_SHIFT_MUTATION = `
  mutation BulkAssignEmployeeShift($inputs: [CreateEmployeeShiftInput!]!) {
    bulkAssignEmployeeShift(inputs: $inputs)
  }
`;

export const CLOCK_IN_MUTATION = `
  mutation ClockIn($input: ClockInInput!) {
    clockIn(input: $input) {
      id
      userId
      employeeName
      companyId
      date
      clockIn
      status
      totalMinutes
      overtimeMinutes
    }
  }
`;

export const CLOCK_OUT_MUTATION = `
  mutation ClockOut($input: ClockOutInput!) {
    clockOut(input: $input) {
      id
      userId
      employeeName
      companyId
      date
      clockIn
      clockOut
      totalMinutes
      overtimeMinutes
      status
      remarks
    }
  }
`;

export const CREATE_HOLIDAY_MUTATION = `
  mutation CreateHoliday($input: CreateHolidayInput!) {
    createHoliday(input: $input) {
      id
      companyId
      companyOuId
      name
      date
      type
      isReligious
      year
    }
  }
`;

export const CREATE_SHIFT_TEMPLATE_MUTATION = `
  mutation CreateShiftTemplate($input: CreateShiftTemplateInput!) {
    createShiftTemplate(input: $input) {
      id
      companyId
      companyOuId
      name
      startTime
      endTime
      breakDuration
      workingDays
      flexibleMinutes
      overtimeAllowed
      type
      isActive
    }
  }
`;

export const CREATE_TIMESHEET_MUTATION = `
  mutation CreateTimesheet($input: CreateTimesheetInput!) {
    createTimesheet(input: $input) {
      id
      userId
      companyId
      periodStart
      periodEnd
      status
      totalHours
      totalOvertime
      remarks
      records {
        id
        date
        totalMinutes
        overtimeMinutes
      }
    }
  }
`;

export const REMOVE_HOLIDAY_MUTATION = `
  mutation RemoveHoliday($id: ID!) {
    removeHoliday(id: $id) {
      id
      name
    }
  }
`;

export const UPDATE_HOLIDAY_MUTATION = `
  mutation UpdateHoliday($id: ID!, $input: UpdateHolidayInput!) {
    updateHoliday(id: $id, input: $input) {
      id
      name
      date
      type
      isReligious
      year
    }
  }
`;

export const UPDATE_TIMESHEET_STATUS_MUTATION = `
  mutation UpdateTimesheetStatus($input: UpdateTimesheetStatusInput!) {
    updateTimesheetStatus(input: $input) {
      id
      status
      remarks
      approvedBy
      approvedAt
      updatedAt
    }
  }
`;

export const ADMIN_UPDATE_ATTENDANCE_RECORD_MUTATION = `
  mutation AdminUpdateAttendanceRecord($input: AdminUpdateAttendanceInput!) {
    adminUpdateAttendanceRecord(input: $input) {
      id
      userId
      employeeName
      status
      clockIn
      clockOut
      totalMinutes
      overtimeMinutes
      remarks
    }
  }
`;

export const GET_ATTENDANCE_RECORDS_QUERY = `
  query GetAttendanceRecords($userId: ID!, $startDate: DateTime, $endDate: DateTime) {
    attendanceRecords(userId: $userId, startDate: $startDate, endDate: $endDate) {
      id
      userId
      employeeName
      companyId
      date
      clockIn
      clockOut
      status
      totalMinutes
      overtimeMinutes
      remarks
    }
  }
`;

export const GET_EMPLOYEE_SHIFTS_QUERY = `
  query GetEmployeeShifts($userId: ID!) {
    employeeShifts(userId: $userId) {
      id
      userId
      companyId
      shiftTemplateId
      startDate
      endDate
      shiftTemplate {
        id
        name
        type
        startTime
        endTime
        breakDuration
      }
    }
  }
`;

export const GET_HOLIDAYS_QUERY = `
  query GetHolidays($companyOuId: ID!, $year: Int) {
    holidays(companyOuId: $companyOuId, year: $year) {
      id
      name
      date
      type
      isReligious
      year
    }
  }
`;

export const GET_SHIFT_TEMPLATES_QUERY = `
  query ShiftTemplates($companyOuId: ID!) {
    shiftTemplates(companyOuId: $companyOuId) {
      id
      name
      type
      isActive
      startTime
      endTime
      workingDays
      overtimeAllowed
    }
  }
`;

export const GET_TIMESHEET_QUERY = `
  query Timesheet($id: ID!) {
    timesheet(id: $id) {
      id
      userId
      companyId
      periodStart
      periodEnd
      status
      totalHours
      totalOvertime
      remarks
      approvedBy
      approvedAt
      records {
        id
        date
        status
        totalMinutes
        overtimeMinutes
      }
    }
  }
`;

export const GET_TIMESHEETS_QUERY = `
  query Timesheets($companyId: ID!, $userId: ID) {
    timesheets(companyId: $companyId, userId: $userId) {
      id
      userId
      companyId
      periodStart
      periodEnd
      status
      totalHours
      totalOvertime
      remarks
    }
  }
`;

export const GET_ATTENDANCE_OVERVIEW_STATS_QUERY = `
  query AttendanceOverviewStats($startDate: DateTime!, $endDate: DateTime!) {
    attendanceOverviewStats(startDate: $startDate, endDate: $endDate) {
      totalEmployees
      activeEmployees
      onLeave
      totalOvertimeHours
    }
  }
`;

export const GET_PAGINATED_ATTENDANCE_RECORDS_QUERY = `
  query PaginatedAttendanceRecords($limit: Int, $offset: Int, $filter: PaginatedAttendanceRecordsFilterInput) {
    paginatedAttendanceRecords(limit: $limit, offset: $offset, filter: $filter) {
      data {
        id
        userId
        employeeName
        date
        shiftType
        contractType
        employmentType
        departmentOuId
        departmentOuName
        divisionOuId
        subDivisionOuId
        companyOuId
        groupOuId
        clockIn
        clockOut
        status
        totalMinutes
        overtimeMinutes
      }
      pagination {
        page
        limit
        total
        totalPages
      }
    }
  }
`;

export const GET_ATTENDANCE_FILTER_OPTIONS_QUERY = `
  query AttendanceFilterOptions {
    attendanceFilterOptions {
      groups {
        id
        name
        type
        parentId
      }
      companies {
        id
        name
        type
        parentId
      }
      divisions {
        id
        name
        type
        parentId
      }
      subDivisions {
        id
        name
        type
        parentId
      }
      departments {
        id
        name
        type
        parentId
      }
      shiftTypes
      attendanceStatuses
      contractTypes
    }
  }
`;

export const GET_SHIFT_STATS_QUERY = `
  query ShiftStats {
    shiftStats {
      totalShifts
      morningEmployees
      eveningEmployees
      nightEmployees
    }
  }
`;
