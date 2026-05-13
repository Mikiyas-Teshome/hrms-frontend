import { useQuery } from '@tanstack/react-query';
import { getHrReport, getHrReportFilterOptions } from './reports.actions';
import { HrReportFiltersInput } from './reports.types';

export const useHrReport = (filters: HrReportFiltersInput) => {
    return useQuery({
        queryKey: ['hr-report', filters],
        queryFn: () => getHrReport(filters),
        enabled: !!filters.dateFrom && !!filters.dateTo,
    });
};

export const useHrReportFilterOptions = () => {
    return useQuery({
        queryKey: ['hr-report-filter-options'],
        queryFn: () => getHrReportFilterOptions(),
    });
};
