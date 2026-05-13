'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { GET_HR_REPORT_QUERY, GET_HR_REPORT_FILTER_OPTIONS_QUERY } from './reports.queries';
import { HrReportFiltersInput, HrReportResponse, HrReportFilterOptionsResponse } from './reports.types';

export const getHrReport = async (filters: HrReportFiltersInput): Promise<HrReportResponse> => {
    const data = await gqlRequest<{ hrReport: HrReportResponse }>(GraphQLService.REPORTING, GET_HR_REPORT_QUERY, { filters });
    return data.hrReport;
};

export const getHrReportFilterOptions = async (): Promise<HrReportFilterOptionsResponse> => {
    const data = await gqlRequest<{ hrReportFilterOptions: HrReportFilterOptionsResponse }>(GraphQLService.REPORTING, GET_HR_REPORT_FILTER_OPTIONS_QUERY);
    return data.hrReportFilterOptions;
};
