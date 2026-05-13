export interface DepartmentResponse {
    id: string;
    name: string;
    description?: string | null;
    code?: string | null;
    companyId: string;
    costCenter?: string | null;
    headEmployeeId?: string | null;
    location?: string | null;
    parentDepartmentId?: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDepartmentInput {
    name: string;
    description?: string;
    code?: string;
    costCenter?: string;
    headEmployeeId?: string;
    location?: string;
    parentDepartmentId?: string;
    status?: string;
}

export interface UpdateDepartmentInput {
    name?: string;
    description?: string;
    code?: string;
    costCenter?: string;
    headEmployeeId?: string;
    location?: string;
    parentDepartmentId?: string;
    status?: string;
}
