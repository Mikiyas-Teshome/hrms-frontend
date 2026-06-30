'use client';

import { useMemo, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    horizontalListSortingStrategy,
    sortableKeyboardCoordinates,
    arrayMove,
} from '@dnd-kit/sortable';
import {
    PencilLine,
    GripVertical,
    EllipsisVertical,
    X,
    Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/main/stat-card';
import { EmployeeRequestsTable } from '@/components/dashboard/main/employee-requests-table';
import { QuickActionsCard } from '@/components/dashboard/main/quick-actions-card';
import { AttendanceRateChart } from '@/components/dashboard/main/attendance-rate-chart';
import { EmployeesInsightsChart } from '@/components/dashboard/main/employees-insights-chart';
import { RecentActivityTable } from '@/components/dashboard/main/recent-activity-table';
import { SummaryStatCardSkeleton } from '@/components/common/SummaryStatSkeleton';
import { TenantPayrollTrendsChart } from '@/components/dashboard/main/tenant-payroll-trends-chart';
import { CompanyPerformanceMatrix } from '@/components/dashboard/main/company-performance-matrix';
import {
    AdminHomeDashboardSkeleton,
    TenantSuperAdminHomeSkeleton,
} from '@/components/dashboard/layout/dashboard-skeleton';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { AddKpiCardSheet } from '@/components/dashboard/main/add-kpi-card-sheet';
import { AddDashboardCardSheet } from '@/components/dashboard/main/add-dashboard-card-sheet';
import { EditWidgetStructureSheet } from '@/components/dashboard/main/edit-widget-structure-sheet';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';
import { useLeaveCompanyOuId } from '@/features/leave/hooks/useLeaveCompanyOuId';
import { useAdminDashboardKpis } from '@/features/admin-dashboard/hooks/useAdminDashboardKpis';
import { useAggregatedAdminKpis } from '@/features/admin-dashboard/hooks/useAggregatedAdminKpis';
import { useAdminDashboardInitialLoading } from '@/features/admin-dashboard/hooks/useAdminDashboardInitialLoading';
import { MAX_ADMIN_KPI_CARDS, DEFAULT_ADMIN_KPI_SLUGS } from '@/features/admin-dashboard/admin-kpi-catalog.constants';
import {
  MAX_ADMIN_WIDGET_CARDS,
  DEFAULT_ADMIN_WIDGET_SLUGS,
  ADMIN_WIDGET_CATALOG_BY_SLUG,
} from '@/features/admin-dashboard/admin-widget-catalog.constants';
import { getResolvedWidgetVisualization } from '@/features/admin-dashboard/admin-widget-catalog.util';
import { buildAdminDashboardStatCards } from '@/features/admin-dashboard/admin-kpi-catalog.util';
import { SortableWidgetItem } from '@/components/dashboard/main/sortable-widget-item';
import { SortableDashboardSection } from '@/components/dashboard/main/sortable-dashboard-section';
import { useAdminDashboardLayout } from '@/features/admin-dashboard/hooks/useAdminDashboardLayout';
import { useTenantDashboardKpis } from '@/features/tenant-super-admin-dashboard/hooks/useTenantDashboardKpis';
import { buildTenantSuperAdminDashboardStats } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.data';
import { useTenantSuperAdminDashboardFiltersOptional } from '@/components/dashboard/layout/tenant-super-admin-dashboard-provider';
import { ALL_COMPANIES_VALUE } from '@/features/tenant-super-admin-dashboard/tenant-super-admin-dashboard.constants';
import { resolveOrgScope } from '@/features/tenant-super-admin-dashboard/scope/resolve-org-scope';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { WIDGET_GROUPS } from '@/features/admin-dashboard/admin-widget-groups.constants';
import type {
  AdminKpiSlug,
  AdminWidgetSlug,
  DashboardSectionId,
  WidgetCardStructure,
} from '@/features/admin-dashboard/admin-dashboard.types';

const TENANT_KPI_SLUGS: readonly string[] = ['total_employees', 'total_payout', 'tax_liability'];

interface EditOverlayProps {
    onDelete: () => void;
    onEdit?: () => void;
    canEdit?: boolean;
    isRTL: boolean;
    type: 'table' | 'chart' | 'actions' | 'activity';
}

function EditOverlay({ onDelete, onEdit, canEdit = false, isRTL, type }: EditOverlayProps) {
    const { t } = useTranslation('dashboard');

    const editLabel =
        type === 'chart'
            ? t('edit.editChart')
            : type === 'actions'
              ? t('edit.editQuickAction')
              : t('edit.editTable');

    return (
        <>
            <div className="flex flex-row justify-between items-center w-full h-[32px] px-2 mb-2">
                <div className="h-6 w-6 flex items-center justify-center">
                    <GripVertical className="h-6 w-6 text-muted-foreground cursor-grab active:cursor-grabbing" />
                </div>
                {canEdit && onEdit ? (
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
                            <DropdownMenuItem
                                className="flex items-center gap-2 p-2.5 rounded-lg cursor-pointer"
                                onClick={onEdit}
                            >
                                <PencilLine className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">
                                    {editLabel}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className="w-[32px]" />
                )}
            </div>
            <button
                onClick={onDelete}
                className={cn(
                    'absolute -top-2 w-6 h-6 bg-[#EF4444] rounded-full border-2 border-background flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-30 cursor-pointer',
                    isRTL ? '-left-2' : '-right-2',
                )}
            >
                <X className="w-3.5 h-3.5 text-white stroke-[3px]" />
            </button>
        </>
    );
}

export function UnifiedDashboard() {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';
    const searchParams = useSearchParams();
    const router = useRouter();
    const isEditing = searchParams.get('edit') === 'true';

    const { data: user, isLoading: isProfileLoading } = useProfile();
    const { hasPermission } = usePermissions();
    const isTenantSuperAdmin = user?.role === 'TENANT_SUPER_ADMIN';
    const firstName = user?.firstName ?? user?.fullName?.split(' ')[0] ?? '';

    const [isAddKpiOpen, setIsAddKpiOpen] = useState(false);
    const [isAddCardOpen, setIsAddCardOpen] = useState(false);
    const [editingWidgetSlug, setEditingWidgetSlug] = useState<AdminWidgetSlug | null>(null);
    const [deleteModal, setDeleteModal] = useState<{
        type: 'stat' | 'widget';
        id: AdminKpiSlug | AdminWidgetSlug;
    } | null>(null);

    const { toast } = useToast();

    const adminLayoutDefaults = useMemo<[AdminKpiSlug[], AdminWidgetSlug[]]>(
        () => isTenantSuperAdmin ? [[], []] : [DEFAULT_ADMIN_KPI_SLUGS, DEFAULT_ADMIN_WIDGET_SLUGS],
        [isTenantSuperAdmin],
    );

    const {
        eligible: executiveDashboardEligible,
        allowedKpiSlugs,
        allowedWidgetSlugs,
        visibleKpiSlugs,
        visibleWidgetSlugs,
        visibleWidgetConfigs,
        visibleSectionOrder,
        addKpiSlugs,
        removeKpiSlug,
        addWidgetSlugs,
        removeWidgetSlug,
        reorderWidgetSlug,
        replaceWidgetSlugs,
        reorderSection,
        updateWidgetConfig,
        resetDraft,
        saveLayout,
        isSaving,
        isLayoutReady,
        isLoading: isLayoutLoading,
    } = useAdminDashboardLayout(isEditing, true, adminLayoutDefaults[0], adminLayoutDefaults[1]);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    const widgetGroupMap = useMemo(
        () => {
            const map = new Map<string, AdminWidgetSlug[]>();
            for (const group of WIDGET_GROUPS) {
                const visible = visibleWidgetSlugs.filter((s): s is AdminWidgetSlug => group.slugs.includes(s));
                if (visible.length > 0) {
                    map.set(group.id, visible);
                }
            }
            return map;
        },
        [visibleWidgetSlugs],
    );

    const hasWidget = useCallback(
        (slug: AdminWidgetSlug) => visibleWidgetSlugs.includes(slug),
        [visibleWidgetSlugs],
    );

    const executiveDashboardEnabled = executiveDashboardEligible;
    const { companyOuId: leaveCompanyOuId } = useLeaveCompanyOuId();

    const { kpiMap: tenantKpiMap, isInitialLoading: isTenantKpiLoading } = useTenantDashboardKpis();
    const tenantStats = useMemo(
        () => buildTenantSuperAdminDashboardStats(t, tenantKpiMap),
        [t, tenantKpiMap],
    );

    const filtersOptional = useTenantSuperAdminDashboardFiltersOptional();
    const selectedCompanyId = filtersOptional?.selectedCompanyId ?? ALL_COMPANIES_VALUE;
    const { companies } = useCompanyOptions();
    const orgScope = useMemo(
        () => resolveOrgScope(selectedCompanyId, companies),
        [selectedCompanyId, companies],
    );

    const isAllCompanies = selectedCompanyId === ALL_COMPANIES_VALUE;
    const useAggregated = isTenantSuperAdmin && isAllCompanies;
    const widgetCompanyOuId = isTenantSuperAdmin && !isAllCompanies && orgScope?.companyOuIds?.[0]
        ? orgScope.companyOuIds[0]
        : leaveCompanyOuId;

    const selectedCompanyOuId = useAggregated
        ? undefined
        : (orgScope?.companyOuIds?.[0] ?? undefined);

    const singleCompanyAdminKpis = useAdminDashboardKpis(
        executiveDashboardEnabled && !useAggregated,
        visibleKpiSlugs,
        selectedCompanyOuId,
    );

    const aggregatedAdminKpis = useAggregatedAdminKpis(
        executiveDashboardEnabled && useAggregated,
        visibleKpiSlugs,
        orgScope?.companyOuIds ?? [],
        user?.companyId ?? '',
    );

    const effectiveAdminKpis = useAggregated ? aggregatedAdminKpis : singleCompanyAdminKpis;

    const isAdminInitialLoading = useAdminDashboardInitialLoading(executiveDashboardEnabled);

    const canViewAdminKpis = hasPermission('dashboard:view_admin_kpis');
    const canViewAdminWidgets = hasPermission('dashboard:view_admin_widgets');

    const filteredAllowedKpiSlugs = useMemo(
        () => canViewAdminKpis ? allowedKpiSlugs : DEFAULT_ADMIN_KPI_SLUGS,
        [canViewAdminKpis, allowedKpiSlugs],
    );

    const filteredAllowedWidgetSlugs = useMemo(
        () => canViewAdminWidgets ? allowedWidgetSlugs : [],
        [canViewAdminWidgets, allowedWidgetSlugs],
    );

    const adminKpiOnlySlugs = useMemo(
        () => visibleKpiSlugs.filter((slug) => !TENANT_KPI_SLUGS.includes(slug)),
        [visibleKpiSlugs],
    );

    const visibleStatCards = useMemo(
        () => buildAdminDashboardStatCards(t, visibleKpiSlugs, effectiveAdminKpis),
        [t, visibleKpiSlugs, effectiveAdminKpis],
    );

    const adminOnlyStatCards = useMemo(
        () => visibleStatCards.filter((card) => !TENANT_KPI_SLUGS.includes(card.slug as AdminKpiSlug)),
        [visibleStatCards],
    );

    const handleDeleteCard = (
        type: 'stat' | 'widget',
        id: AdminKpiSlug | AdminWidgetSlug,
    ) => {
        setDeleteModal({ type, id });
    };

    const handleWidgetStructureSave = (
        slug: AdminWidgetSlug,
        structure: WidgetCardStructure,
    ) => {
        updateWidgetConfig(slug, structure);
        setEditingWidgetSlug(null);
    };

    const openWidgetEditor = useCallback((slug: AdminWidgetSlug) => {
        if (ADMIN_WIDGET_CATALOG_BY_SLUG[slug]?.supportsStructureEdit) {
            setEditingWidgetSlug(slug);
        }
    }, []);

    const confirmDelete = () => {
        if (!deleteModal) return;
        if (deleteModal.type === 'stat') {
            removeKpiSlug(deleteModal.id as AdminKpiSlug);
        } else {
            removeWidgetSlug(deleteModal.id as AdminWidgetSlug);
        }
        setDeleteModal(null);
    };

    const handleCancelEdit = () => {
        resetDraft();
        router.push('/dashboard');
    };

    const handleSaveEdit = async () => {
        try {
            await saveLayout();
            toast({
                title: t('edit.dashboardSaved'),
                variant: 'success',
            });
            router.push('/dashboard');
        } catch (error) {
            toast({
                title: t('common.error', 'Error'),
                description:
                    error instanceof Error
                        ? error.message
                        : t('edit.dashboardSaveFailed'),
                variant: 'destructive',
            });
        }
    };

    const handleWidgetDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = visibleWidgetSlugs.indexOf(active.id as AdminWidgetSlug);
            const newIndex = visibleWidgetSlugs.indexOf(over.id as AdminWidgetSlug);
            if (oldIndex === -1 || newIndex === -1) return;

            reorderWidgetSlug(oldIndex, newIndex);
        },
        [visibleWidgetSlugs, reorderWidgetSlug],
    );

    const handleSectionDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const oldIndex = visibleSectionOrder.indexOf(active.id as DashboardSectionId);
            const newIndex = visibleSectionOrder.indexOf(over.id as DashboardSectionId);
            if (oldIndex === -1 || newIndex === -1) return;

            reorderSection(oldIndex, newIndex);
        },
        [visibleSectionOrder, reorderSection],
    );

    const sheetsSection = (
        <>
            <AddKpiCardSheet
                isOpen={isAddKpiOpen && isLayoutReady}
                onClose={() => setIsAddKpiOpen(false)}
                existingSlugs={visibleKpiSlugs}
                allowedSlugs={filteredAllowedKpiSlugs}
                onAdd={addKpiSlugs}
            />
            <AddDashboardCardSheet
                isOpen={isAddCardOpen && isLayoutReady}
                onClose={() => setIsAddCardOpen(false)}
                existingSlugs={visibleWidgetSlugs}
                allowedSlugs={filteredAllowedWidgetSlugs}
                widgetConfigs={visibleWidgetConfigs}
                onAdd={addWidgetSlugs}
            />
            <EditWidgetStructureSheet
                isOpen={editingWidgetSlug !== null}
                widgetSlug={editingWidgetSlug}
                widgetConfigs={visibleWidgetConfigs}
                onClose={() => setEditingWidgetSlug(null)}
                onSave={handleWidgetStructureSave}
                isRTL={isRTL}
            />
            <ConfirmationModal
                open={!!deleteModal}
                onOpenChange={() => setDeleteModal(null)}
                onConfirm={confirmDelete}
                title={
                    deleteModal?.type === 'widget'
                        ? t('edit.deleteWidgetConfirmTitle')
                        : t('edit.deleteConfirmTitle')
                }
                message={
                    deleteModal?.type === 'widget'
                        ? t('edit.deleteWidgetConfirmDescription')
                        : t('edit.deleteConfirmDescription')
                }
                confirmLabel={t('edit.delete')}
                cancelLabel={t('edit.cancel')}
                variant="danger"
            />
        </>
    );

    const renderWidgetContent = useCallback(
        (slug: AdminWidgetSlug) => {
            const isChart = slug === 'attendance_rate_chart' || slug === 'employees_insights_chart';
            switch (slug) {
                case 'employee_requests':
                    return (
                        <>
                            {isEditing && (
                                <EditOverlay
                                    type="table"
                                    onDelete={() => handleDeleteCard('widget', 'employee_requests')}
                                    isRTL={isRTL}
                                />
                            )}
                            <div className={cn('w-full', isEditing ? 'h-104.25' : 'h-full')}>
                                <EmployeeRequestsTable
                                    companyOuId={widgetCompanyOuId}
                                    enabled={executiveDashboardEnabled}
                                />
                            </div>
                        </>
                    );
                case 'quick_actions':
                    return (
                        <>
                            {isEditing && (
                                <EditOverlay
                                    type="actions"
                                    onDelete={() => handleDeleteCard('widget', 'quick_actions')}
                                    isRTL={isRTL}
                                />
                            )}
                            <div className={cn('w-full', isEditing ? 'h-104.25' : 'h-full')}>
                                <QuickActionsCard />
                            </div>
                        </>
                    );
                case 'attendance_rate_chart':
                    return (
                        <>
                            {isEditing && (
                                <EditOverlay
                                    type="chart"
                                    canEdit={
                                        ADMIN_WIDGET_CATALOG_BY_SLUG
                                            .attendance_rate_chart.supportsStructureEdit
                                    }
                                    onEdit={() => openWidgetEditor('attendance_rate_chart')}
                                    onDelete={() => handleDeleteCard('widget', 'attendance_rate_chart')}
                                    isRTL={isRTL}
                                />
                            )}
                            <AttendanceRateChart
                                companyOuId={widgetCompanyOuId}
                                enabled={executiveDashboardEnabled}
                                visualization={getResolvedWidgetVisualization(
                                    'attendance_rate_chart',
                                    visibleWidgetConfigs,
                                )}
                            />
                        </>
                    );
                case 'employees_insights_chart':
                    return (
                        <>
                            {isEditing && (
                                <EditOverlay
                                    type="chart"
                                    canEdit={
                                        ADMIN_WIDGET_CATALOG_BY_SLUG
                                            .employees_insights_chart.supportsStructureEdit
                                    }
                                    onEdit={() => openWidgetEditor('employees_insights_chart')}
                                    onDelete={() => handleDeleteCard('widget', 'employees_insights_chart')}
                                    isRTL={isRTL}
                                />
                            )}
                            <EmployeesInsightsChart
                                companyOuId={widgetCompanyOuId}
                                enabled={executiveDashboardEnabled}
                                visualization={getResolvedWidgetVisualization(
                                    'employees_insights_chart',
                                    visibleWidgetConfigs,
                                )}
                            />
                        </>
                    );
                case 'recent_activity':
                    return (
                        <>
                            {isEditing && (
                                <EditOverlay
                                    type="activity"
                                    onDelete={() => handleDeleteCard('widget', 'recent_activity')}
                                    isRTL={isRTL}
                                />
                            )}
                            <RecentActivityTable
                                companyId={user?.companyId ?? ''}
                                enabled={executiveDashboardEnabled}
                            />
                        </>
                    );
                default:
                    return null;
            }
        },
        [
            isEditing,
            isRTL,
            widgetCompanyOuId,
            executiveDashboardEnabled,
            visibleWidgetConfigs,
            user?.companyId,
            handleDeleteCard,
            openWidgetEditor,
        ],
    );

    const getWidgetEditClassName = useCallback(
        (slug: AdminWidgetSlug) => {
            switch (slug) {
                case 'employee_requests':
                    return 'flex-1 p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl';
                case 'quick_actions':
                    return 'w-full lg:w-75.5 p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl';
                case 'attendance_rate_chart':
                case 'employees_insights_chart':
                    return 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl';
                case 'recent_activity':
                    return 'p-4 bg-blue-50/50 dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 rounded-2xl';
                default:
                    return '';
            }
        },
        [],
    );

    const getWidgetViewClassName = useCallback(
        (slug: AdminWidgetSlug) => {
            switch (slug) {
                case 'employee_requests':
                    return 'h-104.25 overflow-hidden flex-1';
                case 'quick_actions':
                    return 'w-full lg:w-67.5 h-104.25';
                case 'attendance_rate_chart':
                case 'employees_insights_chart':
                    return '';
                case 'recent_activity':
                    return 'overflow-hidden';
                default:
                    return '';
            }
        },
        [],
    );

    const renderWidgetGroupView = useCallback(
        (groupId: string, slugs: AdminWidgetSlug[]) => {
            switch (groupId) {
                case 'requests-actions':
                    return (
                        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
                            {slugs.includes('employee_requests') && (
                                <div className={cn('relative transition-all', getWidgetViewClassName('employee_requests'))}>
                                    {renderWidgetContent('employee_requests')}
                                </div>
                            )}
                            {slugs.includes('quick_actions') && (
                                <div className={cn('relative transition-all shrink-0', getWidgetViewClassName('quick_actions'), !slugs.includes('employee_requests') && 'flex-1')}>
                                    {renderWidgetContent('quick_actions')}
                                </div>
                            )}
                        </div>
                    );
                case 'charts':
                    return (
                        <div className="grid gap-6 md:grid-cols-2 w-full">
                            {slugs.includes('attendance_rate_chart') && (
                                <div className={cn('relative transition-all', getWidgetViewClassName('attendance_rate_chart'), !slugs.includes('employees_insights_chart') && 'md:col-span-2')}>
                                    {renderWidgetContent('attendance_rate_chart')}
                                </div>
                            )}
                            {slugs.includes('employees_insights_chart') && (
                                <div className={cn('relative transition-all', getWidgetViewClassName('employees_insights_chart'), !slugs.includes('attendance_rate_chart') && 'md:col-span-2')}>
                                    {renderWidgetContent('employees_insights_chart')}
                                </div>
                            )}
                        </div>
                    );
                case 'activity':
                    return (
                        <div className={cn('w-full relative transition-all', getWidgetViewClassName('recent_activity'))}>
                            {renderWidgetContent('recent_activity')}
                        </div>
                    );
                default:
                    return null;
            }
        },
        [renderWidgetContent, getWidgetViewClassName],
    );

    const renderSectionView = useCallback(
        (sectionId: DashboardSectionId) => {
            if (widgetGroupMap.has(sectionId)) {
                return renderWidgetGroupView(sectionId, widgetGroupMap.get(sectionId)!);
            }
            switch (sectionId) {
                case 'payroll-trends':
                    return <TenantPayrollTrendsChart />;
                case 'company-matrix':
                    return <CompanyPerformanceMatrix />;
                default:
                    return null;
            }
        },
        [widgetGroupMap, renderWidgetGroupView],
    );

    const renderWidgetGroupEdit = useCallback(
        (groupId: string, slugs: AdminWidgetSlug[]) => {
            switch (groupId) {
                case 'requests-actions':
                    return (
                        <DndContext onDragEnd={handleWidgetDragEnd} sensors={sensors} collisionDetection={closestCenter}>
                            <SortableContext items={slugs} strategy={horizontalListSortingStrategy}>
                                <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
                                    {slugs.map((slug) => (
                                        <SortableWidgetItem key={slug} id={slug} className={cn(getWidgetEditClassName(slug), slug === 'employee_requests' && 'flex-1', slug === 'quick_actions' && !slugs.includes('employee_requests') && 'flex-1')}>
                                            {renderWidgetContent(slug)}
                                        </SortableWidgetItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    );
                case 'charts':
                    return (
                        <DndContext onDragEnd={handleWidgetDragEnd} sensors={sensors} collisionDetection={closestCenter}>
                            <SortableContext items={slugs} strategy={horizontalListSortingStrategy}>
                                <div className="grid gap-6 md:grid-cols-2 w-full">
                                    {slugs.map((slug) => (
                                        <SortableWidgetItem key={slug} id={slug} className={cn(getWidgetEditClassName(slug), slugs.length === 1 && 'md:col-span-2')}>
                                            {renderWidgetContent(slug)}
                                        </SortableWidgetItem>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    );
                case 'activity':
                    return (
                        <DndContext onDragEnd={handleWidgetDragEnd} sensors={sensors} collisionDetection={closestCenter}>
                            <SortableContext items={slugs} strategy={horizontalListSortingStrategy}>
                                {slugs.map((slug) => (
                                    <SortableWidgetItem key={slug} id={slug} className={getWidgetEditClassName(slug)}>
                                        {renderWidgetContent(slug)}
                                    </SortableWidgetItem>
                                ))}
                            </SortableContext>
                        </DndContext>
                    );
                default:
                    return null;
            }
        },
        [handleWidgetDragEnd, sensors, getWidgetEditClassName, renderWidgetContent],
    );

    const renderSectionEdit = useCallback(
        (sectionId: DashboardSectionId) => {
            if (widgetGroupMap.has(sectionId)) {
                return renderWidgetGroupEdit(sectionId, widgetGroupMap.get(sectionId)!);
            }
            switch (sectionId) {
                case 'payroll-trends':
                    return <TenantPayrollTrendsChart />;
                case 'company-matrix':
                    return <CompanyPerformanceMatrix />;
                default:
                    return null;
            }
        },
        [widgetGroupMap, renderWidgetGroupEdit],
    );

    const widgetsSection = visibleWidgetSlugs.length > 0 && !isEditing && (
        <div className="flex flex-col gap-8">
            {visibleSectionOrder.map((sectionId) => {
                if (!widgetGroupMap.has(sectionId)) return null;
                return (
                    <div key={sectionId}>
                        {renderSectionView(sectionId)}
                    </div>
                );
            })}
        </div>
    );

    const editWidgetsSection = visibleWidgetSlugs.length > 0 && isEditing && (
        <DndContext onDragEnd={handleSectionDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext items={visibleSectionOrder} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-8">
                    {visibleSectionOrder.map((sectionId) => {
                        if (!widgetGroupMap.has(sectionId)) return null;
                        return (
                            <SortableDashboardSection key={sectionId} id={sectionId}>
                                {renderSectionEdit(sectionId)}
                            </SortableDashboardSection>
                        );
                    })}
                </div>
            </SortableContext>
        </DndContext>
    );

    const isLoading = isProfileLoading || isLayoutLoading || (executiveDashboardEligible && isAdminInitialLoading);

    if (isLoading) {
        if (isTenantSuperAdmin) {
            return <TenantSuperAdminHomeSkeleton />;
        }
        return <AdminHomeDashboardSkeleton />;
    }

    if (isTenantSuperAdmin && executiveDashboardEligible) {
        return (
            <div className="flex flex-col min-h-full space-y-8">
                <div className="flex items-center justify-between h-14 gap-3">
                    <div className="flex-1 space-y-0">
                        <h1 className="text-2xl font-bold text-foreground">
                            {t('header.welcome', { name: firstName, defaultValue: `Welcome back, ${firstName}` })}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('tenantSuperAdmin.subtitle', "Here's what's happening with your organization today.")}
                        </p>
                    </div>
                    {isEditing ? (
                        <div className="flex items-center gap-3 shrink-0">
                            <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4"
                            >
                                {t('edit.cancel')}
                            </Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                                className="h-9 min-w-28.75 bg-primary hover:bg-primary/80 text-primary-foreground font-medium rounded-lg text-sm px-4"
                            >
                                {t('edit.saveChanges')}
                            </Button>
                        </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {isTenantKpiLoading
                        ? [1, 2, 3].map((i) => <SummaryStatCardSkeleton key={i} />)
                        : tenantStats.map((stat) => {
                              const live = tenantKpiMap[stat.slug];
                              if (live?.isLoading) {
                                  return <SummaryStatCardSkeleton key={stat.slug} />;
                              }
                              return (
                                  <StatCard
                                      key={stat.slug}
                                      title={stat.title}
                                      value={stat.value}
                                      icon={stat.icon}
                                      iconContainerClassName={stat.containerClass}
                                      iconClassName={stat.iconClass}
                                      trend={stat.trend}
                                      trendValue={stat.trendValue}
                                  />
                              );
                          })}

                    {canViewAdminKpis && adminOnlyStatCards.map((stat) => (
                        <StatCard
                            key={stat.slug}
                            title={stat.title}
                            value={stat.isLoading ? '…' : stat.value}
                            icon={stat.icon}
                            trend={stat.trend}
                            subText={stat.subText}
                            iconContainerClassName={stat.containerClass}
                            iconClassName={stat.iconClass}
                            isEditing={isEditing}
                            onDelete={() => handleDeleteCard('stat', stat.slug)}
                        />
                    ))}

                    {isEditing && canViewAdminKpis && adminKpiOnlySlugs.length < MAX_ADMIN_KPI_CARDS && (
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

                {isEditing && canViewAdminWidgets && visibleWidgetSlugs.length < MAX_ADMIN_WIDGET_CARDS && (
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

                {isEditing ? (
                    <DndContext onDragEnd={handleSectionDragEnd} sensors={sensors} collisionDetection={closestCenter}>
                        <SortableContext items={visibleSectionOrder} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-8">
                                {visibleSectionOrder.map((sectionId) => {
                                    const isWidgetGroup = widgetGroupMap.has(sectionId);
                                    if (isWidgetGroup && !canViewAdminWidgets) return null;
                                    return (
                                        <SortableDashboardSection key={sectionId} id={sectionId}>
                                            {renderSectionEdit(sectionId)}
                                        </SortableDashboardSection>
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="flex flex-col gap-8">
                        {visibleSectionOrder.map((sectionId) => {
                            const isWidgetGroup = widgetGroupMap.has(sectionId);
                            if (isWidgetGroup && !canViewAdminWidgets) return null;
                            return (
                                <div key={sectionId}>
                                    {renderSectionView(sectionId)}
                                </div>
                            );
                        })}
                    </div>
                )}

                {canViewAdminKpis && sheetsSection}
            </div>
        );
    }

    return (
        <div className="flex-col min-h-full flex">
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
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4"
                                        >
                                            {t('edit.cancel')}
                                        </Button>
                                        <Button
                                            onClick={handleSaveEdit}
                                            disabled={isSaving}
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

                    {executiveDashboardEligible && visibleKpiSlugs.length > 0 && (
                        <div className="space-y-4">
                            <div
                                className={cn(
                                    'flex flex-col rounded-[12px] transition-all w-full',
                                    isEditing &&
                                        'bg-[rgba(180,202,246,0.1)] dark:bg-slate-800/50 border-2 border-dashed border-[#B4CAF6] dark:border-blue-500/50 p-3',
                                )}
                            >
                                <div className="grid gap-4 w-full sm:grid-cols-2 lg:grid-cols-4 min-h-35">
                                    {visibleStatCards.map((stat) => (
                                        <StatCard
                                            key={stat.slug}
                                            title={stat.title}
                                            value={stat.isLoading ? '…' : stat.value}
                                            icon={stat.icon}
                                            trend={stat.trend}
                                            subText={stat.subText}
                                            iconContainerClassName={stat.containerClass}
                                            iconClassName={stat.iconClass}
                                            isEditing={isEditing}
                                            onDelete={() => handleDeleteCard('stat', stat.slug)}
                                        />
                                    ))}

                                    {isEditing && visibleKpiSlugs.length < MAX_ADMIN_KPI_CARDS && (
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

                            {isEditing && visibleWidgetSlugs.length < MAX_ADMIN_WIDGET_CARDS && (
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
                    )}
                </div>

                {executiveDashboardEligible && (isEditing ? editWidgetsSection : widgetsSection)}
                {executiveDashboardEligible && sheetsSection}
            </div>
        </div>
    );
}
