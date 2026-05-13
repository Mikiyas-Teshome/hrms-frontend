# Attendance Service Endpoint Test Guide

This guide provides a complete, practical test flow for all GraphQL endpoints in `apps/attendance-service`, including:

- what each endpoint does
- who can access it
- copy-paste queries and mutations
- recommended step-by-step execution order

---

## 1) Prerequisites

- Attendance service is running.
- You have a valid JWT for at least these users:
  - `EMPLOYEE`
  - `MANAGER` (or `HR_OFFICER`)
  - `ADMIN` (or `TENANT_SUPER_ADMIN` / `SYSTEM_ADMIN`)
- You know at least one valid:
  - `userId`
  - `companyId`
  - `companyOuId`
  - `shiftTemplateId` (after creating one)
- GraphQL endpoint is reachable (direct attendance service or via gateway), typically:
  - `http://<host>:<port>/graphql`

### Headers

Use these headers in your GraphQL client:

```http
Content-Type: application/json
Authorization: Bearer <JWT_TOKEN>
```

---

## 2) Role Access Matrix (Current Implementation)

| Endpoint | Employee | Manager | HR Officer | Admin | Tenant Super Admin | System Admin |
|---|---:|---:|---:|---:|---:|---:|
| `healthCheck` | (depends on global guard) | (depends on global guard) | (depends on global guard) | (depends on global guard) | (depends on global guard) | (depends on global guard) |
| `clockIn` | Yes | Yes | Yes | Yes | Yes | Yes |
| `clockOut` | Yes | Yes | Yes | Yes | Yes | Yes |
| `attendanceRecords` | Yes (self enforced in service) | Yes | Yes | Yes | Yes | Yes |
| `adminUpdateAttendanceRecord` | No | No | Yes | Yes | Yes | Yes |
| `attendanceOverviewStats` | No | No | Yes | Yes | Yes | Yes |
| `paginatedAttendanceRecords` | No | No | Yes | Yes | Yes | Yes |
| `createShiftTemplate` | No | No | Yes | Yes | No | No |
| `shiftTemplates` | Authenticated (no `@Roles` decorator) |
| `assignEmployeeShift` | No | No | Yes | Yes | No | No |
| `bulkAssignEmployeeShift` | No | No | Yes | Yes | No | No |
| `employeeShifts` | Yes (self enforced in resolver) | Yes | Yes | Yes | Yes | Yes |
| `shiftStats` | Authenticated (no `@Roles` decorator) |
| `createHoliday` | No | No | Yes | Yes | Yes | Yes |
| `holidays` | Authenticated (no `@Roles` decorator) |
| `updateHoliday` | No | No | Yes | Yes | Yes | Yes |
| `removeHoliday` | No | No | Yes | Yes | Yes | Yes |
| `createTimesheet` | Yes (self/role enforced in service) | Yes | Yes | Yes | No | No |
| `timesheet` | Yes (self/role enforced in service) | Yes | Yes | Yes | Yes | Yes |
| `timesheets` | Yes (company/self/role enforced in service) | Yes | Yes | Yes | Yes | Yes |
| `updateTimesheetStatus` | No | Yes | Yes | Yes | No | No |

Note: Some queries rely on service-level checks (object-level enforcement), not only decorators.

---

## 3) Recommended End-to-End Test Sequence

Run in this order for a clean verification:

1. `healthCheck`
2. Create shift template
3. Assign employee shift
4. Create holiday
5. Employee clock-in
6. Employee clock-out
7. Fetch attendance records
8. Admin update attendance record
9. Create timesheet
10. List/get timesheets
11. Update timesheet status
12. Query dashboards/stats (`attendanceOverviewStats`, `paginatedAttendanceRecords`, `shiftStats`)

---

## 4) Endpoint-by-Endpoint Test Cases

## A) App

### A.1 `healthCheck`
- **Use:** Basic service availability check.
- **Type:** Query

```graphql
query HealthCheck {
  healthCheck
}
```

---

## B) Attendance

### B.1 `clockIn`
- **Use:** Start employee attendance for a day.
- **Type:** Mutation
- **Roles:** Employee and above.
- **Important behavior:** service uses authenticated actor company context.

```graphql
mutation ClockIn($input: ClockInInput!) {
  clockIn(input: $input) {
    id
    userId
    companyId
    date
    clockIn
    status
    totalMinutes
    overtimeMinutes
  }
}
```

Variables:

```json
{
  "input": {
    "userId": "USER_ID",
    "date": "2026-05-07T00:00:00.000Z",
    "clockIn": "2026-05-07T08:00:00.000Z"
  }
}
```

### B.2 `clockOut`
- **Use:** End attendance record and calculate totals/overtime.
- **Type:** Mutation
- **Roles:** Employee and above.

```graphql
mutation ClockOut($input: ClockOutInput!) {
  clockOut(input: $input) {
    id
    userId
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
```

Variables:

```json
{
  "input": {
    "recordId": "ATTENDANCE_RECORD_ID",
    "clockOut": "2026-05-07T17:30:00.000Z",
    "remarks": "Completed normal shift",
    "isDutyShift": false
  }
}
```

### B.3 `attendanceRecords`
- **Use:** List attendance records for one employee in a date range.
- **Type:** Query
- **Roles:** Employee and above.
- **Important behavior:** employees can only fetch self; elevated roles can fetch others.

```graphql
query AttendanceRecords($userId: ID!, $startDate: DateTime, $endDate: DateTime) {
  attendanceRecords(userId: $userId, startDate: $startDate, endDate: $endDate) {
    id
    userId
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
```

Variables:

```json
{
  "userId": "USER_ID",
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-05-31T23:59:59.999Z"
}
```

### B.4 `adminUpdateAttendanceRecord`
- **Use:** Administrative correction of attendance status/time fields.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.

```graphql
mutation AdminUpdateAttendanceRecord($input: AdminUpdateAttendanceInput!) {
  adminUpdateAttendanceRecord(input: $input) {
    id
    userId
    status
    clockIn
    clockOut
    totalMinutes
    overtimeMinutes
    remarks
  }
}
```

Variables:

```json
{
  "input": {
    "recordId": "ATTENDANCE_RECORD_ID",
    "status": "PRESENT",
    "clockIn": "2026-05-07T08:05:00.000Z",
    "clockOut": "2026-05-07T17:10:00.000Z",
    "remarks": "Adjusted by HR"
  }
}
```

### B.5 `attendanceOverviewStats`
- **Use:** Summary metrics over a period.
- **Type:** Query
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.

```graphql
query AttendanceOverviewStats($startDate: DateTime!, $endDate: DateTime!) {
  attendanceOverviewStats(startDate: $startDate, endDate: $endDate) {
    totalEmployees
    activeEmployees
    onLeave
    totalOvertimeHours
  }
}
```

Variables:

```json
{
  "startDate": "2026-05-01T00:00:00.000Z",
  "endDate": "2026-05-31T23:59:59.999Z"
}
```

### B.6 `paginatedAttendanceRecords`
- **Use:** Tenant-scoped paged listing for dashboards/admin views.
- **Type:** Query
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.

```graphql
query PaginatedAttendanceRecords($limit: Int, $offset: Int) {
  paginatedAttendanceRecords(limit: $limit, offset: $offset) {
    data {
      id
      userId
      companyId
      date
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
```

Variables:

```json
{
  "limit": 20,
  "offset": 0
}
```

---

## C) Shifts

### C.1 `createShiftTemplate`
- **Use:** Create reusable shift template (day/night/flexible).
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`.

```graphql
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
```

Variables:

```json
{
  "input": {
    "companyOuId": "COMPANY_OU_ID",
    "name": "General Day Shift",
    "startTime": "2026-05-07T08:00:00.000Z",
    "endTime": "2026-05-07T17:00:00.000Z",
    "breakDuration": 60,
    "workingDays": [1, 2, 3, 4, 5],
    "flexibleMinutes": 15,
    "overtimeAllowed": true,
    "type": "DAY",
    "isActive": true
  }
}
```

### C.2 `shiftTemplates`
- **Use:** List shift templates by OU.
- **Type:** Query
- **Roles:** Authenticated (no explicit role decorator).

```graphql
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
```

Variables:

```json
{
  "companyOuId": "COMPANY_OU_ID"
}
```

### C.3 `assignEmployeeShift`
- **Use:** Assign one shift template to one employee.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`.

```graphql
mutation AssignEmployeeShift($input: CreateEmployeeShiftInput!) {
  assignEmployeeShift(input: $input) {
    id
    userId
    companyId
    shiftTemplateId
    startDate
    endDate
  }
}
```

Variables:

```json
{
  "input": {
    "userId": "USER_ID",
    "shiftTemplateId": "SHIFT_TEMPLATE_ID",
    "startDate": "2026-05-01T00:00:00.000Z",
    "endDate": null
  }
}
```

### C.4 `bulkAssignEmployeeShift`
- **Use:** Assign shifts to many employees in one request.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`.
- **Returns:** count of created assignments.

```graphql
mutation BulkAssignEmployeeShift($inputs: [CreateEmployeeShiftInput!]!) {
  bulkAssignEmployeeShift(inputs: $inputs)
}
```

Variables:

```json
{
  "inputs": [
    {
      "userId": "USER_ID_1",
      "shiftTemplateId": "SHIFT_TEMPLATE_ID",
      "startDate": "2026-05-01T00:00:00.000Z"
    },
    {
      "userId": "USER_ID_2",
      "shiftTemplateId": "SHIFT_TEMPLATE_ID",
      "startDate": "2026-05-01T00:00:00.000Z"
    }
  ]
}
```

### C.5 `employeeShifts`
- **Use:** List shift assignments for an employee.
- **Type:** Query
- **Roles:** Employee and above.
- **Important behavior:** employee can only fetch self; elevated roles can fetch others.

```graphql
query EmployeeShifts($userId: ID!) {
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
```

Variables:

```json
{
  "userId": "USER_ID"
}
```

### C.6 `shiftStats`
- **Use:** Aggregate shift distribution counters.
- **Type:** Query
- **Roles:** Authenticated (no explicit role decorator).

```graphql
query ShiftStats {
  shiftStats {
    totalShifts
    morningEmployees
    eveningEmployees
    nightEmployees
  }
}
```

---

## D) Calendar / Holidays

### D.1 `createHoliday`
- **Use:** Register holiday entry for OU/year.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.

```graphql
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
```

Variables:

```json
{
  "input": {
    "companyOuId": "COMPANY_OU_ID",
    "name": "Eid Holiday",
    "date": "2026-06-17T00:00:00.000Z",
    "type": "gregorian",
    "isReligious": true,
    "year": 2026
  }
}
```

### D.2 `holidays`
- **Use:** List holidays by OU, optionally filtered by year.
- **Type:** Query
- **Roles:** Authenticated (no explicit role decorator).

```graphql
query Holidays($companyOuId: ID!, $year: Int) {
  holidays(companyOuId: $companyOuId, year: $year) {
    id
    name
    date
    type
    isReligious
    year
  }
}
```

Variables:

```json
{
  "companyOuId": "COMPANY_OU_ID",
  "year": 2026
}
```

### D.3 `updateHoliday`
- **Use:** Update existing holiday details.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.
- **Return:** nullable (`null` if not found in tenant scope).

```graphql
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
```

Variables:

```json
{
  "id": "HOLIDAY_ID",
  "input": {
    "name": "Eid Al Adha Holiday",
    "isReligious": true
  }
}
```

### D.4 `removeHoliday`
- **Use:** Delete holiday record.
- **Type:** Mutation
- **Roles:** `ADMIN`, `HR_OFFICER`, `TENANT_SUPER_ADMIN`, `SYSTEM_ADMIN`.
- **Return:** nullable (`null` if not found in tenant scope).

```graphql
mutation RemoveHoliday($id: ID!) {
  removeHoliday(id: $id) {
    id
    name
  }
}
```

Variables:

```json
{
  "id": "HOLIDAY_ID"
}
```

---

## E) Timesheets

### E.1 `createTimesheet`
- **Use:** Create one timesheet for employee period and aggregate attendance records.
- **Type:** Mutation
- **Roles:** `EMPLOYEE`, `MANAGER`, `HR_OFFICER`, `ADMIN`.
- **Important behavior:** employees can only create for self; service enforces access.

```graphql
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
```

Variables:

```json
{
  "input": {
    "userId": "USER_ID",
    "periodStart": "2026-05-01T00:00:00.000Z",
    "periodEnd": "2026-05-31T00:00:00.000Z",
    "remarks": "Monthly timesheet"
  }
}
```

### E.2 `timesheet`
- **Use:** Fetch one timesheet by id.
- **Type:** Query
- **Roles:** Employee and above.
- **Important behavior:** service enforces company and self-or-elevated access.

```graphql
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
```

Variables:

```json
{
  "id": "TIMESHEET_ID"
}
```

### E.3 `timesheets`
- **Use:** List timesheets by company, optional user filter.
- **Type:** Query
- **Roles:** Employee and above.
- **Important behavior:** service enforces company boundary and may narrow to self for non-elevated roles.

```graphql
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
```

Variables:

```json
{
  "companyId": "COMPANY_ID",
  "userId": "USER_ID"
}
```

### E.4 `updateTimesheetStatus`
- **Use:** Submit/approve/reject status updates.
- **Type:** Mutation
- **Roles:** `MANAGER`, `HR_OFFICER`, `ADMIN`.

```graphql
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
```

Variables:

```json
{
  "input": {
    "id": "TIMESHEET_ID",
    "status": "approved",
    "remarks": "Approved by manager"
  }
}
```

---

## 5) Negative Test Checklist (Must Pass)

- Employee token tries `attendanceRecords` for another `userId` -> expect forbidden.
- Employee token tries `employeeShifts` for another `userId` -> expect forbidden.
- Employee token tries `adminUpdateAttendanceRecord` -> expect forbidden.
- Employee token tries `updateTimesheetStatus` -> expect forbidden.
- Create timesheet where attendance records are already linked to another timesheet -> expect domain error.
- Query `timesheets` with wrong `companyId` for non-system actor -> expect forbidden.
- `updateHoliday`/`removeHoliday` with unknown ID in tenant scope -> expect `null`.

---

## 6) Suggested Postman/Insomnia Environment Keys

- `baseUrl`
- `jwtEmployee`
- `jwtManager`
- `jwtAdmin`
- `companyId`
- `companyOuId`
- `userId`
- `shiftTemplateId`
- `attendanceRecordId`
- `holidayId`
- `timesheetId`

---

## 7) Quick Smoke Pack (Copy/Paste Order)

1. `HealthCheck`
2. `CreateShiftTemplate` (admin token)
3. `AssignEmployeeShift` (admin token)
4. `CreateHoliday` (admin token)
5. `ClockIn` (employee token)
6. `ClockOut` (employee token)
7. `AttendanceRecords` (employee token, self)
8. `CreateTimesheet` (employee token, self)
9. `Timesheet` (employee token, own)
10. `UpdateTimesheetStatus` (manager/admin token)
11. `AttendanceOverviewStats` (admin token)
12. `ShiftStats` (admin token)

This validates all major attendance-service flows and authorization paths.