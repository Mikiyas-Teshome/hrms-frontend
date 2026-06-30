export function resolveEmployeeCompensationCurrency(options: {
    salaryAssignmentCurrency?: string | null;
    companyCurrency?: string | null;
    employeeCurrency?: string | null;
}): string | null {
    const salaryAssignment = options.salaryAssignmentCurrency?.trim().toUpperCase();
    if (salaryAssignment) {
        return salaryAssignment;
    }

    const company = options.companyCurrency?.trim().toUpperCase();
    if (company) {
        return company;
    }

    const employee = options.employeeCurrency?.trim().toUpperCase();
    return employee || null;
}
