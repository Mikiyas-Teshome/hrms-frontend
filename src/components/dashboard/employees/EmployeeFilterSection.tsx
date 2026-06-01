'use client';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { OrganizationUnitType } from '@/features/organization/organization.types';
import { EmployeeListFilterInput, EmployeeStatus } from '@/features/employee/employee.types';

interface EmployeeFilterSectionProps {
    isVisible: boolean;
    onReset: () => void;
    onApply: (filters: EmployeeListFilterInput) => void;
    initialFilters?: EmployeeListFilterInput;
}

type FilterValue = EmployeeListFilterInput & {
    companyOuId?: string;
    divisionOuId?: string;
    subDivisionOuId?: string;
    departmentOuId?: string;
    status?: EmployeeStatus;
};

const DEFAULT_FILTERS: FilterValue = {
    companyOuId: 'all',
    divisionOuId: 'all',
    subDivisionOuId: 'all',
    departmentOuId: 'all',
    status: 'all' as unknown as EmployeeStatus,
};

const findUnit = (id: string, units: OrganizationUnitType[]): OrganizationUnitType | null => {
    for (const unit of units) {
        if (unit.id === id) return unit;
        const found = findUnit(id, unit.children ?? []);
        if (found) return found;
    }
    return null;
};

const getAllUnitsOfType = (type: OrganizationUnitType['type'], units: OrganizationUnitType[]): OrganizationUnitType[] => {
    let result: OrganizationUnitType[] = [];
    for (const unit of units) {
        if (unit.type === type) {
            result.push(unit);
        }
        result = result.concat(getAllUnitsOfType(type, unit.children ?? []));
    }
    return result;
};

const EmployeeFilterSection: React.FC<EmployeeFilterSectionProps> = ({ 
    isVisible, 
    onReset, 
    onApply,
    initialFilters,
}) => {
    const { t } = useTranslation('employees');
    const { data: hierarchy = [] } = useOrganizationHierarchy();

    const defaultValues = React.useMemo<FilterValue>(() => ({
        ...DEFAULT_FILTERS,
        ...initialFilters,
        companyOuId: initialFilters?.companyOuId ?? 'all',
        divisionOuId: initialFilters?.divisionOuId ?? 'all',
        subDivisionOuId: initialFilters?.subDivisionOuId ?? 'all',
        departmentOuId: initialFilters?.departmentOuId ?? 'all',
        status: initialFilters?.status ?? ('all' as unknown as EmployeeStatus),
    }), [initialFilters]);

    const { control, handleSubmit, reset } = useForm<FilterValue>({
        defaultValues,
    });

    React.useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const selectedCompanyOuId = useWatch({
        control,
        name: 'companyOuId',
    });
    const selectedDivisionOuId = useWatch({
        control,
        name: 'divisionOuId',
    });
    const selectedSubDivisionOuId = useWatch({
        control,
        name: 'subDivisionOuId',
    });

    const companies = React.useMemo(() => getAllUnitsOfType('COMPANY', hierarchy), [hierarchy]);
    const divisions = React.useMemo(() => {
        if (selectedCompanyOuId && selectedCompanyOuId !== 'all') {
            const company = findUnit(selectedCompanyOuId, hierarchy);
            return company ? getAllUnitsOfType('DIVISION', [company]) : [];
        }
        return getAllUnitsOfType('DIVISION', hierarchy);
    }, [hierarchy, selectedCompanyOuId]);
    const subDivisions = React.useMemo(() => {
        if (selectedDivisionOuId && selectedDivisionOuId !== 'all') {
            const division = findUnit(selectedDivisionOuId, hierarchy);
            return division ? getAllUnitsOfType('SUB_DIVISION', [division]) : [];
        }
        return getAllUnitsOfType('SUB_DIVISION', hierarchy);
    }, [hierarchy, selectedDivisionOuId]);
    const departments = React.useMemo(() => {
        if (selectedSubDivisionOuId && selectedSubDivisionOuId !== 'all') {
            const subDivision = findUnit(selectedSubDivisionOuId, hierarchy);
            return subDivision ? getAllUnitsOfType('DEPARTMENT', [subDivision]) : [];
        }
        if (selectedDivisionOuId && selectedDivisionOuId !== 'all') {
            const division = findUnit(selectedDivisionOuId, hierarchy);
            return division ? getAllUnitsOfType('DEPARTMENT', [division]) : [];
        }
        return getAllUnitsOfType('DEPARTMENT', hierarchy);
    }, [hierarchy, selectedDivisionOuId, selectedSubDivisionOuId]);

    const applyFilters = (filters: FilterValue) => {
        onApply({
            companyOuId: filters.companyOuId === 'all' ? undefined : filters.companyOuId,
            divisionOuId: filters.divisionOuId === 'all' ? undefined : filters.divisionOuId,
            subDivisionOuId: filters.subDivisionOuId === 'all' ? undefined : filters.subDivisionOuId,
            departmentOuId: filters.departmentOuId === 'all' ? undefined : filters.departmentOuId,
            status: filters.status === ('all' as unknown as EmployeeStatus) ? undefined : filters.status,
        });
    };

    const resetFilters = () => {
        reset(DEFAULT_FILTERS);
        onReset();
    };

    if (!isVisible) return null;

    return (
        <form
            onSubmit={handleSubmit(applyFilters)}
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
        >
            <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 flex-1 w-full">
                    <div className="space-y-3">
                        <FormSelect
                            id="employee-filter-company"
                            label={t('company', 'Company')}
                            control={control as any}
                            name="companyOuId"
                            placeholder={t('all')}
                            t={t}
                            containerClassName="w-full space-y-3"
                            options={[
                                { label: t('all'), value: 'all' },
                                ...companies.map((company) => ({ label: company.name, value: company.id })),
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <FormSelect
                            id="employee-filter-division"
                            label={t('division', 'Division')}
                            control={control as any}
                            name="divisionOuId"
                            placeholder={t('all')}
                            t={t}
                            containerClassName="w-full space-y-3"
                            options={[
                                { label: t('all'), value: 'all' },
                                ...divisions.map((division) => ({ label: division.name, value: division.id })),
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <FormSelect
                            id="employee-filter-subdivision"
                            label={t('subDivision', 'Sub-division')}
                            control={control as any}
                            name="subDivisionOuId"
                            placeholder={t('all')}
                            t={t}
                            containerClassName="w-full space-y-3"
                            options={[
                                { label: t('all'), value: 'all' },
                                ...subDivisions.map((subDivision) => ({ label: subDivision.name, value: subDivision.id })),
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <FormSelect
                            id="employee-filter-department"
                            label={t('department')}
                            control={control as any}
                            name="departmentOuId"
                            placeholder={t('all')}
                            t={t}
                            containerClassName="w-full space-y-3"
                            options={[
                                { label: t('all'), value: 'all' },
                                ...departments.map((department) => ({ label: department.name, value: department.id })),
                            ]}
                        />
                    </div>

                    <div className="space-y-3">
                        <FormSelect
                            id="employee-filter-status"
                            label={t('status')}
                            control={control as any}
                            name="status"
                            placeholder={t('all')}
                            t={t}
                            containerClassName="w-full space-y-3"
                            options={[
                                { label: t('all'), value: 'all' },
                                { label: t('active'), value: EmployeeStatus.ACTIVE },
                                { label: t('inactive', 'Inactive'), value: EmployeeStatus.INACTIVE },
                                { label: t('onLeave'), value: EmployeeStatus.ON_LEAVE },
                                { label: t('terminated'), value: EmployeeStatus.TERMINATED },
                                { label: t('invited', 'Invited'), value: EmployeeStatus.INVITED },
                            ]}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <Button 
                        type="submit"
                        className="h-9 min-w-[102px] bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('applyFilters')}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={resetFilters}
                        className="h-9 min-w-[101px] border-muted-foreground text-foreground/80 hover:text-foreground font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('resetFilters')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default EmployeeFilterSection;
