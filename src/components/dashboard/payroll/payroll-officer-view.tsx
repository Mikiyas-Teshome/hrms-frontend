'use client';

import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, DollarSign, Wallet, FileSpreadsheet } from 'lucide-react';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useEmployees } from '@/features/employee/hooks/useEmployee';
import { useAllowances } from '@/features/allowance/hooks/useAllowance';
import { useDeductions } from '@/features/deduction/hooks/useDeduction';

export function PayrollOfficerView() {
    const { t } = useTranslation('dashboard');
    const router = useRouter();

    const { data: profile } = useProfile();
    const { data: employees = [] } = useEmployees();
    const { data: allowances = [] } = useAllowances(profile?.companyId);
    const { data: deductions = [] } = useDeductions(profile?.companyId);

    const stats = [
        {
            title: t('payrollOfficerDashboard.totalPayroll'),
            value: employees.length.toString(),
            icon: Users,
            styleClass: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        },
        {
            title: t('payrollOfficerDashboard.netPayroll'),
            value: '0',
            icon: DollarSign,
            styleClass: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
        },
        {
            title: t('payrollOfficerDashboard.totalAllowances'),
            value: allowances.length.toString(),
            icon: Wallet,
            styleClass: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
        },
        {
            title: t('payrollOfficerDashboard.totalDeductions'),
            value: deductions.length.toString(),
            icon: FileSpreadsheet,
            styleClass: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        },
    ];

    return (
        <div className="flex min-h-screen flex-col gap-8 rounded-tl-[32px] bg-background p-[24px_24px_12px] font-sans text-foreground">
            {/* Header Section */}
            <div className="flex flex-col gap-6">
                <div className="flex min-h-14 items-center justify-between gap-3">
                    <div className="flex-1 space-y-0 text-left rtl:text-right">
                        <h1 className="text-[24px] font-bold leading-[32px] text-foreground">
                            {t('payrollOfficerDashboard.welcome', {
                                name: profile?.firstName ?? 'Rachel',
                            })}
                        </h1>
                        <p className="text-[14px] font-normal leading-6 text-muted-foreground">
                            {t('payrollOfficerDashboard.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Row Container */}
            <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, idx) => (
                    <Card
                        key={idx}
                        className="rounded-[16px] border border-border bg-card shadow-sm"
                    >
                        <CardContent className="flex flex-col gap-5 p-6">
                            <div className="flex justify-between items-start">
                                <div
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] ${stat.styleClass}`}
                                >
                                    <stat.icon className="w-6 h-6 stroke-1" />
                                </div>
                            </div>
                            <div className="text-left rtl:text-right space-y-1">
                                <p className="text-[14px] font-medium text-muted-foreground">
                                    {stat.title}
                                </p>
                                <p className="text-[28px] font-bold text-foreground">
                                    {stat.value}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Empty State Content */}
            <div className="flex min-h-115 flex-1 flex-col items-center justify-center rounded-[24px] border border-dashed border-border bg-muted/30">
                <div className="flex max-w-120 flex-col items-center justify-center p-8 text-center">
                    <h2 className="text-[24px] font-bold text-foreground mb-3">
                        {t('payrollOfficerDashboard.reviewTitle')}
                    </h2>
                    <p className="text-[14px] mb-8 leading-relaxed text-muted-foreground">
                        {t('payrollOfficerDashboard.reviewSubtitle')}
                    </p>
                    <Button
                        className="rounded-[8px] px-8 h-[44px] text-[14px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => router.push('/onboarding-payroll-officer/payroll-structure')}
                    >
                        {t('payrollOfficerDashboard.reviewButton')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
