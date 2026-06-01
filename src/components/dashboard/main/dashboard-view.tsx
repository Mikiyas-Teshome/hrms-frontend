'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    PencilLine,
    GripVertical,
    EllipsisVertical,
    X,
    Plus,
    CircleMinus,
    Scaling,
    Columns3,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/main/stat-card';
import { EmployeeRequestsTable } from '@/components/dashboard/main/employee-requests-table';
import { QuickActionsCard } from '@/components/dashboard/main/quick-actions-card';
import { AttendanceRateChart } from '@/components/dashboard/main/attendance-rate-chart';
import { EmployeesInsightsChart } from '@/components/dashboard/main/employees-insights-chart';
import { RecentActivityTable } from '@/components/dashboard/main/recent-activity-table';
import { CompanySetupCard } from '@/components/dashboard/main/company-setup-card';
import { DashboardSkeleton } from '@/components/dashboard/layout/dashboard-skeleton';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { AddKpiCardSheet } from '@/components/dashboard/main/add-kpi-card-sheet';
import { AddDashboardCardSheet } from '@/components/dashboard/main/add-dashboard-card-sheet';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { getDashboardStats } from '@/data/dashboard';
import { EmployeeDashboardView } from '../shared/employee-dashboard-view';

interface EditOverlayProps {
    onDelete: () => void;
    isRTL: boolean;
    type: 'table' | 'chart' | 'actions' | 'activity';
}

function EditOverlay({ onDelete, isRTL, type }: EditOverlayProps) {
    const { t } = useTranslation('dashboard');

    const getMenuItems = () => {
        switch (type) {
            case 'table':
                return (
                    <>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <PencilLine className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.editTable')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <Scaling className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.changeSize')}
                            </span>
                        </DropdownMenuItem>
                    </>
                );
            case 'chart':
                return (
                    <>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <PencilLine className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.editChart')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <Scaling className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.changeSize')}
                            </span>
                        </DropdownMenuItem>
                    </>
                );
            case 'actions':
                return (
                    <>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <PencilLine className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.editQuickAction')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <Scaling className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.changeSize')}
                            </span>
                        </DropdownMenuItem>
                    </>
                );
            case 'activity':
                return (
                    <>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <PencilLine className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.editTable')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <Scaling className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.changeSize')}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                            <Columns3 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-foreground">
                                {t('edit.rearrangeColumn')}
                            </span>
                        </DropdownMenuItem>
                    </>
                );
        }
    };

    return (
        <>
            <div className="flex flex-row justify-between items-center w-full h-[32px] px-2 mb-2">
                <div className="h-6 w-6 flex items-center justify-center">
                    <GripVertical className="h-6 w-6 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>
                <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="w-[32px] h-[32px] rounded-lg hover:bg-muted flex items-center justify-center"
                        >
                            <EllipsisVertical className="h-4 w-4 text-foreground/80" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="w-50 p-1.5 rounded-xl border-border"
                    >
                        {getMenuItems()}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <button
                onClick={onDelete}
                className={cn(
                    'absolute -top-2 w-6 h-6 bg-[#EF4444] rounded-full border-2 border-background flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-30',
                    isRTL ? '-left-2' : '-right-2',
                )}
            >
                <X className="w-3.5 h-3.5 text-white stroke-[3px]" />
            </button>
        </>
    );
}

export function DashboardView() {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEditing = searchParams.get('edit') === 'true';

    const { data: user, isLoading } = useProfile();
    const onboardingComplete = user?.onboardingComplete ?? false;
    const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';

    const [isAddKpiOpen, setIsAddKpiOpen] = useState(false);
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [visibleStats, setVisibleStats] = useState([0, 1, 2, 3]);
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: string;
        id: number | string;
    } | null>(null);

    const allStats = getDashboardStats(t);

    const handleDeleteCard = (type: string, id: number | string) => {
        setDeleteModal({ isOpen: true, type, id });
    };

    const confirmDelete = () => {
        if (!deleteModal) return;
        if (deleteModal.type === 'stat') {
            setVisibleStats((prev) => prev.filter((idx) => idx !== deleteModal.id));
        }
        setDeleteModal(null);
    };

    const handleAddStat = (slug: string) => {
        // Map sheet icons/ids to our stats
        const statMap: Record<string, number> = {
            total_employees: 0,
            pending_approve: 1,
            upcoming_payroll: 2,
            active_jobs: 3,
            active_employees: 0, // Mock fallback
            new_hires: 3, // Mock fallback
            attrition_rate: 0, // Mock fallback
        };
        const id = statMap[slug];
        if (id !== undefined && !visibleStats.includes(id)) {
            setVisibleStats((prev) => [...prev, id]);
        }
    };

    if (isLoading) return <DashboardSkeleton />;

    return (
        <div className="flex flex-col min-h-full">
            {!isTenantSuperAdmin ? (
                <EmployeeDashboardView />
            ) : onboardingComplete ? (
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between h-14 gap-3">
                                <div className="flex-1 space-y-0 text-left">
                                    <h1 className="text-2xl font-bold leading-[32px] text-foreground">
                                        {isEditing
                                            ? t('edit.dashboardName', {
                                                  name: user?.firstName || 'Alex',
                                              })
                                            : t('header.welcome', {
                                                  name:
                                                      user?.firstName ||
                                                      (i18n.language === 'ar' ? 'أليكس' : 'Alex'),
                                              })}
                                    </h1>
                                    <p className="text-base font-normal leading-6 text-muted-foreground">
                                        {isEditing
                                            ? t('edit.dashboardDescription')
                                            : t('header.subtitle')}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                onClick={() => router.push('/dashboard')}
                                                className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4"
                                            >
                                                {t('edit.cancel')}
                                            </Button>
                                            <Button
                                                onClick={() => router.push('/dashboard')}
                                                className="h-9 min-w-28.75 bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-lg text-sm px-4"
                                            >
                                                {t('edit.saveChanges')}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            onClick={() => router.push('?edit=true')}
                                            className="h-9 min-w-25 gap-2 border-primary/50 text-primary font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                                        >
                                            <PencilLine className="h-4 w-4" />
                                            {t('header.editDashboard')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div
                                className={cn(
                                    'flex flex-col rounded-[12px] transition-all w-full',
                                    isEditing &&
                                        'bg-[rgba(180,202,246,0.1)] dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 p-3',
                                )}
                            >
                                {isEditing && (
                                    <div className="flex flex-row justify-end items-center w-full h-[32px] mb-2 px-2">
                                        <DropdownMenu dir={isRTL ? 'rtl' : 'ltr'}>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-[32px] h-[32px] rounded-lg hover:bg-muted flex items-center justify-center border-none focus-visible:ring-0"
                                                >
                                                    <EllipsisVertical className="h-4 w-4 text-foreground/80" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="w-50 p-1.5 rounded-xl border-border shadow-[0px_12px_16px_-4px_rgba(0,0,0,0.08),0px_4px_6px_-2px_rgba(0,0,0,0.03)]"
                                            >
                                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer">
                                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {t('edit.rearrange')}
                                                    </span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <CircleMinus className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {t('edit.removeKpiCards')}
                                                    </span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}

                                <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4 min-h-35">
                                    {visibleStats.map((id) => {
                                        const stat = allStats.find((s) => s.id === id);
                                        if (!stat) return null;
                                        return (
                                            <StatCard
                                                key={stat.id}
                                                {...stat}
                                                iconContainerClassName={stat.containerClass}
                                                iconClassName={stat.iconClass}
                                                isEditing={isEditing}
                                                onDelete={() => handleDeleteCard('stat', stat.id)}
                                            />
                                        );
                                    })}

                                    {isEditing && visibleStats.length < 4 && (
                                        <StatCard
                                            key="placeholder-add"
                                            title=""
                                            value=""
                                            icon={Plus}
                                            isPlaceholder
                                            onAdd={() => setIsAddKpiOpen(true)}
                                        />
                                    )}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex justify-end pr-1">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddCardOpen(true)}
                                        className="h-9 min-w-30.5 text-primary border-primary hover:bg-primary/10 font-medium rounded-lg px-4 flex items-center gap-2 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {t('edit.addCards')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <AddKpiCardSheet
                        isOpen={isAddKpiOpen}
                        onClose={() => setIsAddKpiOpen(false)}
                        onAdd={handleAddStat}
                    />

                    <AddDashboardCardSheet
                        isOpen={isAddCardOpen}
                        onClose={() => setIsAddCardOpen(false)}
                        onAdd={() => {}}
                    />

                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
                            <div
                                className={cn(
                                    'relative transition-all flex-1',
                                    isEditing
                                        ? 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl z-10 flex flex-col'
                                        : 'h-104.25 overflow-hidden',
                                )}
                            >
                                {isEditing && (
                                    <EditOverlay
                                        type="table"
                                        onDelete={() => handleDeleteCard('requests', 'requests')}
                                        isRTL={isRTL}
                                    />
                                )}
                                <div className={cn('w-full', isEditing ? 'h-104.25' : 'h-full')}>
                                    <EmployeeRequestsTable />
                                </div>
                            </div>
                            <div
                                className={cn(
                                    'relative transition-all shrink-0',
                                    isEditing
                                        ? 'w-full lg:w-75.5 p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl z-10 flex flex-col'
                                        : 'w-full lg:w-67.5 h-104.25',
                                )}
                            >
                                {isEditing && (
                                    <EditOverlay
                                        type="actions"
                                        onDelete={() => handleDeleteCard('actions', 'actions')}
                                        isRTL={isRTL}
                                    />
                                )}
                                <div className={cn('w-full', isEditing ? 'h-104.25' : 'h-full')}>
                                    <QuickActionsCard />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 w-full">
                            <div
                                className={cn(
                                    'relative transition-all',
                                    isEditing
                                        ? 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl z-10 flex flex-col'
                                        : '',
                                )}
                            >
                                {isEditing && (
                                    <EditOverlay
                                        type="chart"
                                        onDelete={() => handleDeleteCard('attendance', 'attendance')}
                                        isRTL={isRTL}
                                    />
                                )}
                                <AttendanceRateChart />
                            </div>
                            <div
                                className={cn(
                                    'relative transition-all',
                                    isEditing
                                        ? 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl z-10 flex flex-col'
                                        : '',
                                )}
                            >
                                {isEditing && (
                                    <EditOverlay
                                        type="chart"
                                        onDelete={() => handleDeleteCard('insights', 'insights')}
                                        isRTL={isRTL}
                                    />
                                )}
                                <EmployeesInsightsChart />
                            </div>
                        </div>

                        <div
                            className={cn(
                                'w-full relative transition-all',
                                isEditing
                                    ? 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl z-10 flex flex-col'
                                    : 'overflow-hidden',
                            )}
                        >
                            {isEditing && (
                                <EditOverlay
                                    type="activity"
                                    onDelete={() => handleDeleteCard('activity', 'activity')}
                                    isRTL={isRTL}
                                />
                            )}
                            <RecentActivityTable />
                        </div>
                    </div>
                </div>
            ) : (
                <CompanySetupCard />
            )}

            <ConfirmationModal
                open={!!deleteModal}
                onOpenChange={() => setDeleteModal(null)}
                onConfirm={confirmDelete}
                title={t('edit.deleteConfirmTitle')}
                message={t('edit.deleteConfirmDescription')}
                confirmLabel={t('edit.delete')}
                cancelLabel={t('edit.cancel')}
                variant="danger"
            />
        </div>
    );
}
