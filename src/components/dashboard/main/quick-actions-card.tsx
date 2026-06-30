'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import AddEmployeeSheet from '@/components/dashboard/employees/AddEmployeeSheet';
import { CreateAnnouncementSheet } from '@/components/dashboard/home/create-announcement-sheet';

export function QuickActionsCard() {
    const { t } = useTranslation('dashboard');
    const router = useRouter();
    const { hasPermission } = usePermissions();

    const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);

    const canAddEmployee = hasPermission('employees:create');
    const canAddDepartment = hasPermission('org_hierarchy:update');
    const canApproveRequests = hasPermission('leave_requests:read');
    const canCreateAnnouncement = hasPermission('announcements:create');

    const reportHref = useMemo(() => {
        if (hasPermission('reports_hr:read')) {
            return '/dashboard/reports/hr-reports';
        }
        if (hasPermission('reports_payroll:read')) {
            return '/dashboard/reports/payroll-reports';
        }
        if (hasPermission('reports_custom:read')) {
            return '/dashboard/reports/custom-reports';
        }
        return null;
    }, [hasPermission]);

    const linkActions = [
        {
            show: canApproveRequests,
            label: t('quickActions.approveRequests', 'Approve requests'),
            onClick: () => router.push('/dashboard/leave/leave-requests'),
        },
        {
            show: canCreateAnnouncement,
            label: t('quickActions.createAnnouncements', 'Create announcements'),
            onClick: () => setIsAnnouncementOpen(true),
        },
    ].filter((a) => a.show);

    const hasPrimaryActions = canAddEmployee || canAddDepartment;
    const hasAnyAction = hasPrimaryActions || linkActions.length > 0 || !!reportHref;

    return (
        <>
            <Card className="h-full border border-border shadow-sm rounded-2xl bg-card overflow-hidden flex flex-col">
                <CardHeader className="px-6 py-5 border-none">
                    <CardTitle className="text-xl font-bold text-foreground tracking-tight">
                        {t('quickActions.title', 'Quick actions')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-8 pt-0 flex flex-col h-full">
                    {!hasAnyAction ? (
                        <p className="text-sm text-muted-foreground">
                            {t('quickActions.none', 'No quick actions available')}
                        </p>
                    ) : (
                        <>
                            <div className="flex flex-col gap-3">
                                {canAddEmployee && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setIsAddEmployeeOpen(true)}
                                        className="w-full justify-start gap-3 bg-muted/50 dark:bg-muted/20 text-foreground hover:bg-muted/80 dark:hover:bg-muted/30 border-none h-11 px-4 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        <Plus className="h-5 w-5 text-foreground/60" />
                                        {t('quickActions.addEmployee', 'Add employee')}
                                    </Button>
                                )}
                                {canAddDepartment && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => router.push('/dashboard/organization/hierarchy')}
                                        className="w-full justify-start gap-3 bg-muted/50 dark:bg-muted/20 text-foreground hover:bg-muted/80 dark:hover:bg-muted/30 border-none h-11 px-4 rounded-xl text-sm font-semibold transition-all"
                                    >
                                        <Plus className="h-5 w-5 text-foreground/60" />
                                        {t('quickActions.addDepartment', 'Add department')}
                                    </Button>
                                )}
                            </div>

                            {linkActions.length > 0 && (
                                <div className="flex flex-col gap-5 mt-8">
                                    {linkActions.map((action) => (
                                        <button
                                            key={action.label}
                                            type="button"
                                            onClick={action.onClick}
                                            className="text-sm font-bold text-primary underline underline-offset-4 decoration-2 hover:text-[#1e4eb8] text-start transition-colors"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {reportHref && (
                                <div className={linkActions.length > 0 ? 'mt-5' : 'mt-8'}>
                                    <Link
                                        href={reportHref}
                                        className="text-sm font-bold text-primary underline underline-offset-4 decoration-2 hover:text-[#1e4eb8] transition-colors"
                                    >
                                        {t('quickActions.generateReport', 'Generate report')}
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {canAddEmployee && (
                <AddEmployeeSheet
                    open={isAddEmployeeOpen}
                    onOpenChange={setIsAddEmployeeOpen}
                />
            )}
            {canCreateAnnouncement && (
                <CreateAnnouncementSheet
                    open={isAnnouncementOpen}
                    onOpenChange={setIsAnnouncementOpen}
                />
            )}
        </>
    );
}
