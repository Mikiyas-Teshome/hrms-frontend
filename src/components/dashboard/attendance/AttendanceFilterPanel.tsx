'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
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

type AttendanceFilterVariant = 'overview' | 'overtime';

const OVERTIME_STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'PAID'] as const;

interface AttendanceFilterPanelProps {
    onApply: (filters: PaginatedAttendanceRecordsFilterInput) => void;
    onReset: () => void;
    initialFilters?: PaginatedAttendanceRecordsFilterInput;
    className?: string;
    variant?: AttendanceFilterVariant;
}

const findUnit = (id: string, units: OrganizationUnitType[]): OrganizationUnitType | null => {
    for (const unit of units) {
        if (unit.id === id) return unit;
        if (unit.children) {
            const found = findUnit(id, unit.children);
            if (found) return found;
        }
    }
    return null;
};

const getAllUnitsOfType = (type: string, units: OrganizationUnitType[]): OrganizationUnitType[] => {
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
};

export function AttendanceFilterPanel({
    onApply,
    onReset,
    initialFilters,
    className,
    variant = 'overview',
}: AttendanceFilterPanelProps) {
    const { t, i18n } = useTranslation('dashboard');
    const isRtl = i18n.language === 'ar';
    const { user } = useAuth();
    const { isSystemAdmin, isTenantSuperAdmin, hasScope } = usePermissions();
    const isOwnScopeOnly = hasScope('attendance', 'read', 'own') && !hasScope('attendance', 'read', 'company') && !hasScope('attendance', 'read', 'all');
    const { data: options } = useAttendanceFilterOptions();
    const { data: hierarchy } = useOrganizationHierarchy();

    const defaultFormValues: PaginatedAttendanceRecordsFilterInput = {
        companyOuId: 'all',
        divisionOuId: 'all',
        subDivisionOuId: 'all',
        departmentOuId: 'all',
        shiftType: undefined,
        status: undefined,
        overtimeStatus: undefined,
        contractType: 'all',
        ...initialFilters,
    };

    const { control, handleSubmit, reset } = useForm<PaginatedAttendanceRecordsFilterInput>({
        defaultValues: defaultFormValues,
    });

    React.useEffect(() => {
        reset({
            companyOuId: 'all',
            divisionOuId: 'all',
            subDivisionOuId: 'all',
            departmentOuId: 'all',
            shiftType: undefined,
            status: undefined,
            overtimeStatus: undefined,
            contractType: 'all',
            ...initialFilters,
        });
    }, [initialFilters, reset]);

    const selectedCompanyId = useWatch({
        control,
        name: 'companyOuId',
    });
    const selectedDivisionId = useWatch({
        control,
        name: 'divisionOuId',
    });
    const selectedSubDivisionId = useWatch({
        control,
        name: 'subDivisionOuId',
    });

    const handleReset = () => {
        reset({
            companyOuId: 'all',
            divisionOuId: 'all',
            subDivisionOuId: 'all',
            departmentOuId: 'all',
            shiftType: undefined,
            status: undefined,
            overtimeStatus: undefined,
            contractType: 'all',
        });
        onReset();
    };

    const onSubmit = (data: PaginatedAttendanceRecordsFilterInput) => {
        const sanitized = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === 'all' ? undefined : value,
            ])
        ) as PaginatedAttendanceRecordsFilterInput;

        if (variant === 'overtime') {
            sanitized.status = undefined;
        } else {
            sanitized.overtimeStatus = undefined;
        }

        onApply(sanitized);
    };


    const filteredCompanies = React.useMemo(() => {
        if (!hierarchy?.[0]?.children) return [];
        const sourceCompanies = hierarchy[0].children;
        if (isSystemAdmin || isTenantSuperAdmin || hasScope('attendance', 'read', PermissionScope.ALL)) {
            return sourceCompanies;
        }
        return sourceCompanies.filter((c: OrganizationUnitType) => c.id === user?.companyId);
    }, [hierarchy, isSystemAdmin, isTenantSuperAdmin, hasScope, user?.companyId]);

    const canSelectCompany = !isOwnScopeOnly && (isSystemAdmin || isTenantSuperAdmin || hasScope('attendance', 'read', PermissionScope.ALL));

    const filteredDivisions = React.useMemo(() => {
        if (!hierarchy) return [];
        
        if (selectedCompanyId && selectedCompanyId !== 'all') {
            const company = findUnit(selectedCompanyId, hierarchy);
            return (company?.children as OrganizationUnitType[]) || [];
        }

        return getAllUnitsOfType('DIVISION', hierarchy);
    }, [hierarchy, selectedCompanyId]);

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
    }, [hierarchy, selectedDivisionId, selectedCompanyId]);

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
    }, [hierarchy, selectedSubDivisionId, selectedDivisionId, selectedCompanyId]);

    return (
        <form 
            onSubmit={handleSubmit(onSubmit)}
            className={cn(
                "box-border flex flex-col justify-end items-end p-4 gap-4 bg-black/[0.05] dark:bg-white/[0.05] border border-border dark:border-white/10 rounded-lg w-full",
                className
            )}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 px-6 gap-x-4 gap-y-6 w-full">
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

                {!isOwnScopeOnly && filteredDivisions.length > 0 && (
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

                {!isOwnScopeOnly && filteredSubDivisions.length > 0 && (
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

                {!isOwnScopeOnly && filteredDepartments.length > 0 && (
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
                            ...Object.values(ShiftType).map((s) => ({
                                label: t(`attendance.shiftTypes.${s}`, s.charAt(0) + s.slice(1).toLowerCase()),
                                value: s,
                            })),
                        ]}
                    />
                </div>

                {variant === 'overtime' ? (
                    <div className="w-full">
                        <FormSelect
                            id="filter-overtime-status"
                            label={t('attendance.overtimeStatus', 'Overtime status')}
                            control={control as any}
                            name="overtimeStatus"
                            placeholder={t('attendance.all', 'All')}
                            t={t}
                            containerClassName="w-full space-y-4"
                            options={[
                                { label: t('attendance.all', 'All'), value: 'all' },
                                ...OVERTIME_STATUS_OPTIONS.map((s) => ({
                                    label: t(`attendance.overtimeStatusLabels.${s}`, s.charAt(0) + s.slice(1).toLowerCase()),
                                    value: s,
                                })),
                            ]}
                        />
                    </div>
                ) : (
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
                                ...Object.values(AttendanceStatus).map((s) => ({
                                    label: t(`attendance.statusLabels.${s}`, s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ')),
                                    value: s,
                                })),
                            ]}
                        />
                    </div>
                )}

                {!isOwnScopeOnly && (
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
                )}
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
