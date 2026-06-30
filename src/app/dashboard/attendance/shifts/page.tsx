'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { buildShiftStatCards } from '@/features/attendance/attendance-stat-cards.util';
import StatCardsList from '@/components/dashboard/attendance/StatCardsList';
import ShiftsTable from '@/components/dashboard/attendance/ShiftsTable';
import { Plus } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { FormSelect } from '@/components/ui/FormSelect';
import { Button } from '@/components/ui/button';
import { ShiftSheet } from '@/components/dashboard/attendance/ShiftSheet';
import { useShiftTemplates, useShiftStats } from '@/features/attendance/hooks/useAttendance';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { PermissionScope } from '@/features/roles/roles.types';

export default function ShiftsPage() {
    const { t } = useTranslation('dashboard');
    const { hasPermission, hasScope, isTenantSuperAdmin, isSystemAdmin } = usePermissions();
    const isOwnScopeOnly =
        hasScope('shifts', 'read', 'own') &&
        !hasScope('shifts', 'read', 'department') &&
        !hasScope('shifts', 'read', 'company') &&
        !hasScope('shifts', 'read', 'all');
    const { data: profile } = useProfile();
    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
    const form = useForm({
        defaultValues: {
            companyId: '',
        },
    });
    const selectedCompanyId = useWatch({
        control: form.control,
        name: 'companyId',
    });

    const companyOuId = isOwnScopeOnly ? '' : (selectedCompanyId || profile?.companyId || '');
    const { data: shiftTemplates } = useShiftTemplates(companyOuId);
    const { data: shiftStats, isLoading: isLoadingStats } = useShiftStats(companyOuId || undefined);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (companiesData?.length && !selectedCompanyId) {
            form.setValue('companyId', companiesData[0].id);
        } else if (profile?.companyId && !selectedCompanyId) {
            form.setValue('companyId', profile.companyId);
        }
    }, [companiesData, profile, selectedCompanyId, form]);

    const stats = useMemo(
        () => buildShiftStatCards(shiftStats, shiftTemplates?.length, t),
        [shiftStats, shiftTemplates?.length, t],
    );

    return (
        <ProtectedRoute module="shifts">
            <div className="flex flex-col gap-8 w-full min-w-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between min-w-0">
                    <h2 className="text-2xl text-foreground font-bold leading-8 shrink-0">
                        {t('attendance.shiftsTitle')}
                    </h2>
                    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto min-w-0 sm:justify-end">
                        {!isOwnScopeOnly && (isSystemAdmin || isTenantSuperAdmin || hasScope('shifts', 'read', PermissionScope.ALL)) && (
                            <FormSelect
                                id="company-selector"
                                placeholder={isLoadingCompanies ? t('setup.loadingCompanies') : t('setup.selectCompanyPlaceholder')}
                                control={form.control}
                                name="companyId"
                                options={companiesData?.map((company) => ({ label: company.name, value: company.id })) || []}
                                t={t}
                                containerClassName="w-full min-w-0 sm:w-[200px]"
                            />
                        )}
                        {!isOwnScopeOnly && hasPermission('shifts:create') && (
                            <Button
                                onClick={() => setIsSheetOpen(true)}
                                className="h-9 gap-2 bg-primary hover:bg-primary/80 text-white rounded-[8px] px-4 w-full sm:w-auto shrink-0"
                            >
                                <Plus className="size-4 shrink-0" />
                                <span className="truncate">{t('attendance.addShift')}</span>
                            </Button>
                        )}
                    </div>
                </div>

                {!isOwnScopeOnly && <StatCardsList stats={stats} isLoading={isLoadingStats} />}

                <ShiftsTable companyId={selectedCompanyId} />

                <ShiftSheet
                    open={isSheetOpen}
                    onOpenChange={setIsSheetOpen}
                    defaultCompanyId={selectedCompanyId}
                />
            </div>
        </ProtectedRoute>
    );
}
