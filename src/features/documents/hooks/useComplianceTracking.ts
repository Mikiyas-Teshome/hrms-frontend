import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
    fetchComplianceAlerts,
    fetchComplianceDashboardStats,
    fetchEmployeeComplianceList,
} from '../documents.actions';
import { EmployeeComplianceFilterInput } from '../documents.types';

export const complianceQueryKeys = {
    stats: ['compliance-stats'] as const,
    alerts: ['compliance-alerts'] as const,
    listPaged: (params: {
        page: number;
        size: number;
        filter: EmployeeComplianceFilterInput;
    }) => ['compliance-list-paged', params] as const,
};

export type ComplianceListPagedParams = {
    page: number;
    size: number;
    filter: EmployeeComplianceFilterInput;
};

export const useComplianceStats = () => {
    return useQuery({
        queryKey: complianceQueryKeys.stats,
        queryFn: () => fetchComplianceDashboardStats(),
    });
};

export const useComplianceAlerts = () => {
    return useQuery({
        queryKey: complianceQueryKeys.alerts,
        queryFn: () => fetchComplianceAlerts(),
    });
};

export const useComplianceListPaged = (params: ComplianceListPagedParams) => {
    return useQuery({
        queryKey: complianceQueryKeys.listPaged(params),
        queryFn: () =>
            fetchEmployeeComplianceList({
                pagination: { page: params.page, size: params.size },
                filter: params.filter,
            }),
        placeholderData: keepPreviousData,
    });
};
