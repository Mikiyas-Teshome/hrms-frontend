'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import LeaveBalancesEmployeeDetailTable from './LeaveBalancesEmployeeDetailTable';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';

interface LeaveBalancesByEmployeePageProps {
    employeeId: string;
}

const LeaveBalancesByEmployeePage = ({ employeeId }: LeaveBalancesByEmployeePageProps) => {
    const { t, i18n } = useTranslation('dashboard');
    const router = useRouter();
    const searchParams = useSearchParams();
    const isRtl = i18n.language === 'ar' || i18n.language === 'he';
    const BackIcon = isRtl ? ArrowRight : ArrowLeft;

    const {
        canSelectCompany,
        companyOuId,
        companyForm,
        companiesData,
        isLoadingCompanies,
    } = useLeaveCompanyOuId();

    const employeeName =
        searchParams.get('name')?.trim() ||
        t('leaveBalances.employeePage.unnamedEmployee', 'Employee');

    return (
        <div className="flex w-full flex-col gap-8 animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                <Button
                    type="button"
                    variant="ghost"
                    className="w-fit gap-2 px-0 text-muted-foreground hover:text-foreground"
                    onClick={() => router.push('/dashboard/leave/balances')}
                >
                    <BackIcon className="h-4 w-4" />
                    {t('leaveBalances.employeePage.backToList', 'Back to leave balances')}
                </Button>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold leading-8 text-foreground">
                        {t('leaveBalances.employeePage.title', {
                            name: employeeName,
                            defaultValue: '{{name}} leave balances',
                        })}
                    </h2>
                    {canSelectCompany && (
                        <FormSelect<{ companyId: string }>
                            id="company-selector-detail"
                            placeholder={
                                isLoadingCompanies
                                    ? t('setup.loadingCompanies')
                                    : t('setup.selectCompanyPlaceholder')
                            }
                            control={companyForm.control}
                            name="companyId"
                            t={t}
                            options={
                                companiesData?.map((company) => ({
                                    label: company.name,
                                    value: company.id,
                                })) ?? []
                            }
                            containerClassName="w-full sm:w-64"
                        />
                    )}
                </div>
            </div>

            <LeaveBalancesEmployeeDetailTable
                companyOuId={companyOuId}
                employeeId={employeeId}
                showFilter={true}
            />
        </div>
    );
};

export default LeaveBalancesByEmployeePage;
