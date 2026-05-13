import React from 'react';

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
  TRANSFERRED = 'transferred',
  ARCHIVED = 'archived',
  INVITED = 'invited'
}

export interface Employee {
    id: string;
    userId?: string;
    name: string;
    department: string;
    role: string;
    email: string;
    status: EmployeeStatus;
    avatar?: string;
}

export interface EmployeeStats {
    total: number;
    active: number;
    onLeave: number;
    nonCompliant: number;
}
