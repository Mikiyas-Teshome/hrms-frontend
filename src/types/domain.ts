export enum OUType {
  COMPANY = 'COMPANY',
  DEPARTMENT = 'DEPARTMENT',
  DIVISION = 'DIVISION',
  GROUP = 'GROUP',
  SUB_DIVISION = 'SUB_DIVISION'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED'
}

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface JobTitle {
  id: string;
  title: string;
  departmentId: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: Gender;
  dateOfBirth: string;
  hiredDate: string;
  department?: Department;
  jobTitle?: JobTitle;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeId?: string;
}
