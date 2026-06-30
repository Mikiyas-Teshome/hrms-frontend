'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { EmployeeComplianceFilterInput } from '@/features/documents/documents.types';

interface ComplianceFilterSectionProps {
    isVisible: boolean;
    onApply: (filters: EmployeeComplianceFilterInput) => void;
    onReset: () => void;
    initialFilters?: EmployeeComplianceFilterInput;
    departments: Array<{ id: string; name: string }>;
}

type FilterFormValues = {
    complianceStatus: string;
    department: string;
};

const ALL_VALUE = '__all__';

const DEFAULT_FORM_VALUES: FilterFormValues = {
    complianceStatus: ALL_VALUE,
    department: ALL_VALUE,
};

const ComplianceFilterSection: React.FC<ComplianceFilterSectionProps> = ({
    isVisible,
    onApply,
    onReset,
    initialFilters,
    departments,
}) => {
    const { t } = useTranslation(['document', 'dashboard']);

    const defaultValues = React.useMemo<FilterFormValues>(() => ({
        complianceStatus: initialFilters?.complianceStatus ?? ALL_VALUE,
        department: initialFilters?.department ?? ALL_VALUE,
    }), [initialFilters]);

    const { control, handleSubmit, reset } = useForm<FilterFormValues>({
        defaultValues,
    });

    React.useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const applyFilters = (values: FilterFormValues) => {
        onApply({
            complianceStatus: values.complianceStatus === ALL_VALUE ? undefined : values.complianceStatus,
            department: values.department === ALL_VALUE ? undefined : values.department,
        });
    };

    const resetFilters = () => {
        reset(DEFAULT_FORM_VALUES);
        onReset();
    };

    if (!isVisible) {
        return null;
    }

    return (
        <form
            onSubmit={handleSubmit(applyFilters)}
            className="mb-6 w-full animate-in fade-in slide-in-from-top-2 rounded-lg border border-border bg-black/5 p-4 duration-300 dark:bg-white/5 sm:p-6"
        >
            <div className="flex flex-col items-end gap-4 lg:flex-row lg:gap-6">
                <div className="grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormSelect
                        id="compliance-filter-status"
                        label={t('complianceTracking.filters.complianceStatus', { ns: 'document' })}
                        placeholder={t('complianceTracking.filters.allStatuses', { ns: 'document' })}
                        control={control}
                        name="complianceStatus"
                        options={[
                            {
                                label: t('complianceTracking.filters.allStatuses', { ns: 'document' }),
                                value: ALL_VALUE,
                            },
                            {
                                label: t('complianceTracking.compliance.compliant', { ns: 'document' }),
                                value: 'COMPLIANT',
                            },
                            {
                                label: t('complianceTracking.compliance.nonCompliant', { ns: 'document' }),
                                value: 'NON_COMPLIANT',
                            },
                        ]}
                        t={t}
                    />
                    <FormSelect
                        id="compliance-filter-department"
                        label={t('complianceTracking.filters.department', { ns: 'document' })}
                        placeholder={t('complianceTracking.filters.allDepartments', { ns: 'document' })}
                        control={control}
                        name="department"
                        options={[
                            {
                                label: t('complianceTracking.filters.allDepartments', { ns: 'document' }),
                                value: ALL_VALUE,
                            },
                            ...departments.map((department) => ({
                                label: department.name,
                                value: department.name,
                            })),
                        ]}
                        t={t}
                    />
                </div>
                <div className="flex w-full shrink-0 gap-2 sm:w-auto">
                    <Button type="button" variant="outline" className="h-10 flex-1 sm:flex-none" onClick={resetFilters}>
                        {t('common.clearFilters', { ns: 'document' })}
                    </Button>
                    <Button type="submit" className="h-10 flex-1 sm:flex-none">
                        {t('attendance.applyFilters', { ns: 'dashboard', defaultValue: 'Apply filters' })}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default ComplianceFilterSection;
