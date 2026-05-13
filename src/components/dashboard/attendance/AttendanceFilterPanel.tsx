'use client';

import React from 'react';
import { useForm, Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { useAttendanceFilterOptions } from '@/features/attendance/hooks/useAttendance';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { OrganizationUnitType } from '@/features/organization/organization.types';
import { AttendanceStatus, ShiftType, PaginatedAttendanceRecordsFilterInput } from '@/features/attendance/attendance.types';
import { PermissionScope } from '@/features/roles/roles.types';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

interface AttendanceFilterPanelProps {
    onApply: (filters: PaginatedAttendanceRecordsFilterInput) => void;
    onReset: () => void;
    initialFilters?: PaginatedAttendanceRecordsFilterInput;
    className?: string;
}

export function AttendanceFilterPanel({
    onApply,
    onReset,
    initialFilters,
    className,
}: AttendanceFilterPanelProps) {
    const { t, i18n } = useTranslation('dashboard');
    const isRtl = i18n.language === 'ar';
    const { user } = useAuth();
    const { isSystemAdmin, isTenantSuperAdmin, hasScope } = usePermissions();
    const { data: options, isLoading: isLoadingOptions } = useAttendanceFilterOptions();
    const { data: hierarchy, isLoading: isLoadingHierarchy } = useOrganizationHierarchy();

    const { control, handleSubmit, reset, watch, setValue } = useForm<PaginatedAttendanceRecordsFilterInput>({
        defaultValues: initialFilters || {
            companyOuId: 'all',
            divisionOuId: 'all',
            subDivisionOuId: 'all',
            departmentOuId: 'all',
            shiftType: undefined,
            status: undefined,
            contractType: 'all',
        },
    });

    const selectedCompanyId = watch('companyOuId');
    const selectedDivisionId = watch('divisionOuId');
    const selectedSubDivisionId = watch('subDivisionOuId');

    // Reset logic: we don't auto-reset children anymore to allow independent filtering
    // across the hierarchy, as per the hybrid model requirement.
    const handleReset = () => {
        reset({
            companyOuId: 'all',
            divisionOuId: 'all',
            subDivisionOuId: 'all',
            departmentOuId: 'all',
            shiftType: undefined,
            status: undefined,
            contractType: 'all',
        });
        onReset();
    };

    const onSubmit = (data: PaginatedAttendanceRecordsFilterInput) => {
        // Filter out 'all' values before sending to API
        const sanitized = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === 'all' ? undefined : value,
            ])
        ) as PaginatedAttendanceRecordsFilterInput;
        onApply(sanitized);
    };

    const findUnit = React.useCallback((id: string, units: OrganizationUnitType[]): OrganizationUnitType | null => {
        for (const unit of units) {
            if (unit.id === id) return unit;
            if (unit.children) {
                const found = findUnit(id, unit.children);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const getAllUnitsOfType = React.useCallback((type: string, units: OrganizationUnitType[]): OrganizationUnitType[] => {
        let result: OrganizationUnitType[] = [];
        for (const unit of units) {
            if (unit.type === type) {
                result.push(unit);
            }
            if (unit.children) {
                result = result.concat(getAllUnitsOfType(type, unit.children));
            }
        }
        return result;
    }, []);

    const filteredCompanies = React.useMemo(() => {
        if (!hierarchy?.[0]?.children) return [];
        const sourceCompanies = hierarchy[0].children;
        if (isSystemAdmin || isTenantSuperAdmin || hasScope('attendance', 'read', PermissionScope.ALL)) {
            return sourceCompanies;
        }
        return sourceCompanies.filter((c: OrganizationUnitType) => c.id === user?.companyId);
    }, [hierarchy, isSystemAdmin, isTenantSuperAdmin, hasScope, user?.companyId]);

    const canSelectCompany = isSystemAdmin || isTenantSuperAdmin || hasScope('attendance', 'read', PermissionScope.ALL);

    const filteredDivisions = React.useMemo(() => {
        if (!hierarchy) return [];
        
        if (selectedCompanyId && selectedCompanyId !== 'all') {
            const company = findUnit(selectedCompanyId, hierarchy);
            return (company?.children as OrganizationUnitType[]) || [];
        }

        return getAllUnitsOfType('DIVISION', hierarchy);
    }, [hierarchy, selectedCompanyId, findUnit, getAllUnitsOfType]);

    const filteredSubDivisions = React.useMemo(() => {
        if (!hierarchy) return [];

        if (selectedDivisionId && selectedDivisionId !== 'all') {
            const division = findUnit(selectedDivisionId, hierarchy);
            return (division?.children as OrganizationUnitType[]) || [];
        }

        if (selectedCompanyId && selectedCompanyId !== 'all') {
            const company = findUnit(selectedCompanyId, hierarchy);
            return company ? getAllUnitsOfType('SUB_DIVISION', [company]) : [];
        }

        return getAllUnitsOfType('SUB_DIVISION', hierarchy);
    }, [hierarchy, selectedDivisionId, selectedCompanyId, findUnit, getAllUnitsOfType]);

    const filteredDepartments = React.useMemo(() => {
        if (!hierarchy) return [];

        if (selectedSubDivisionId && selectedSubDivisionId !== 'all') {
            const subDivision = findUnit(selectedSubDivisionId, hierarchy);
            return (subDivision?.children as OrganizationUnitType[]) || [];
        }

        if (selectedDivisionId && selectedDivisionId !== 'all') {
            const division = findUnit(selectedDivisionId, hierarchy);
            return division ? getAllUnitsOfType('DEPARTMENT', [division]) : [];
        }

        if (selectedCompanyId && selectedCompanyId !== 'all') {
            const company = findUnit(selectedCompanyId, hierarchy);
            return company ? getAllUnitsOfType('DEPARTMENT', [company]) : [];
        }

        return getAllUnitsOfType('DEPARTMENT', hierarchy);
    }, [hierarchy, selectedSubDivisionId, selectedDivisionId, selectedCompanyId, findUnit, getAllUnitsOfType]);

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)}
            className={cn(
                "box-border flex flex-col justify-end items-end p-4 gap-4 bg-black/[0.05] dark:bg-white/[0.05] border border-border dark:border-white/10 rounded-lg w-full",
                className
            )}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 px-6 gap-x-4 gap-y-6 w-full">
                {/* Company Filter */}
                {canSelectCompany && (
                    <div className="w-full">
                        <FormSelect
                            id="filter-company"
                            label={t('attendance.company', 'Company')}
                            control={control as any}
                            name="companyOuId"
                            placeholder={t('attendance.all', 'All')}
                            t={t}
                            containerClassName="w-full space-y-4"
                            options={[
                                { label: t('attendance.all', 'All'), value: 'all' },
                                ...(filteredCompanies.map(c => ({ label: c.name, value: c.id })) || [])
                            ]}
                        />
                    </div>
                )}

                {/* Division Filter */}
                {filteredDivisions.length > 0 && (
                    <div className="w-full">
                        <FormSelect
                            id="filter-division"
                            label={t('attendance.division', 'Division')}
                            control={control as any}
                            name="divisionOuId"
                            placeholder={t('attendance.all', 'All')}
                            t={t}
                            containerClassName="w-full space-y-4"
                            options={[
                                { label: t('attendance.all', 'All'), value: 'all' },
                                ...(filteredDivisions.map((d: OrganizationUnitType) => ({ label: d.name, value: d.id })) || [])
                            ]}
                        />
                    </div>
                )}

                {/* Sub-division Filter */}
                {filteredSubDivisions.length > 0 && (
                    <div className="w-full">
                        <FormSelect
                            id="filter-subdivision"
                            label={t('attendance.subdivision', 'Sub-division')}
                            control={control as any}
                            name="subDivisionOuId"
                            placeholder={t('attendance.all', 'All')}
                            t={t}
                            containerClassName="w-full space-y-4"
                            options={[
                                { label: t('attendance.all', 'All'), value: 'all' },
                                ...(filteredSubDivisions.map((s: OrganizationUnitType) => ({ label: s.name, value: s.id })) || [])
                            ]}
                        />
                    </div>
                )}

                {/* Department Filter */}
                {filteredDepartments.length > 0 && (
                    <div className="w-full">
                        <FormSelect
                            id="filter-department"
                            label={t('attendance.department', 'Department')}
                            control={control as any}
                            name="departmentOuId"
                            placeholder={t('attendance.all', 'All')}
                            t={t}
                            containerClassName="w-full space-y-4"
                            options={[
                                { label: t('attendance.all', 'All'), value: 'all' },
                                ...(filteredDepartments.map((d: OrganizationUnitType) => ({ label: d.name, value: d.id })) || [])
                            ]}
                        />
                    </div>
                )}

                {/* Shift Type Filter */}
                <div className="w-full">
                    <FormSelect
                        id="filter-shifttype"
                        label={t('attendance.shiftType', 'Shift type')}
                        control={control as any}
                        name="shiftType"
                        placeholder={t('attendance.all', 'All')}
                        t={t}
                        containerClassName="w-full space-y-4"
                        options={[
                            { label: t('attendance.all', 'All'), value: 'all' },
                            ...Object.values(ShiftType).map(s => ({ 
                                label: s.charAt(0) + s.slice(1).toLowerCase(), 
                                value: s 
                            }))
                        ]}
                    />
                </div>

                {/* Status Filter */}
                <div className="w-full">
                    <FormSelect
                        id="filter-status"
                        label={t('attendance.status', 'Status')}
                        control={control as any}
                        name="status"
                        placeholder={t('attendance.all', 'All')}
                        t={t}
                        containerClassName="w-full space-y-4"
                        options={[
                            { label: t('attendance.all', 'All'), value: 'all' },
                            ...Object.values(AttendanceStatus).map(s => ({ 
                                label: s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' '), 
                                value: s 
                            }))
                        ]}
                    />
                </div>

                {/* Contract Type Filter */}
                <div className="w-full">
                    <FormSelect
                        id="filter-contracttype"
                        label={t('attendance.contractType', 'Contract type')}
                        control={control as any}
                        name="contractType"
                        placeholder={t('attendance.all', 'All')}
                        t={t}
                        containerClassName="w-full space-y-4"
                        options={[
                            { label: t('attendance.all', 'All'), value: 'all' },
                            ...(options?.contractTypes.map(c => ({ label: c, value: c })) || [])
                        ]}
                    />
                </div>
            </div>

            <div className={cn(
                "flex flex-row items-center gap-3 px-6 mt-4 w-full",
                isRtl ? "justify-start" : "justify-end"
            )}>
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleReset}
                    className="text-muted-foreground dark:text-white/60 font-medium hover:bg-transparent"
                >
                    {t('attendance.resetFilters', 'Reset filters')}
                </Button>
                <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white font-medium px-6 h-9 rounded-lg shadow-sm"
                >
                    {t('attendance.applyFilters', 'Apply filters')}
                </Button>
            </div>
        </form>
    );
}
