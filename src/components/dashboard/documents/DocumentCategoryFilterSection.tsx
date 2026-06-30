'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import {
    DocumentCategoryAppliedTo,
    DocumentCategoryFilterInput,
} from '@/features/documents/documents.types';

interface DocumentCategoryFilterSectionProps {
    isVisible: boolean;
    onApply: (filters: DocumentCategoryFilterInput) => void;
    onReset: () => void;
    initialFilters?: DocumentCategoryFilterInput;
}

type FilterFormValues = {
    status: string;
    appliedTo: string;
    required: string;
    expiryRequired: string;
};

const DEFAULT_FORM_VALUES: FilterFormValues = {
    status: 'all',
    appliedTo: 'all',
    required: 'all',
    expiryRequired: 'all',
};

const DocumentCategoryFilterSection: React.FC<DocumentCategoryFilterSectionProps> = ({
    isVisible,
    onApply,
    onReset,
    initialFilters,
}) => {
    const { t } = useTranslation(['document', 'dashboard']);

    const defaultValues = React.useMemo<FilterFormValues>(() => ({
        status: initialFilters?.status ?? 'all',
        appliedTo: initialFilters?.appliedTo ?? 'all',
        required:
            initialFilters?.required === undefined
                ? 'all'
                : initialFilters.required
                  ? 'true'
                  : 'false',
        expiryRequired:
            initialFilters?.expiryRequired === undefined
                ? 'all'
                : initialFilters.expiryRequired
                  ? 'true'
                  : 'false',
    }), [initialFilters]);

    const { control, handleSubmit, reset } = useForm<FilterFormValues>({
        defaultValues,
    });

    React.useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const applyFilters = (values: FilterFormValues) => {
        onApply({
            status: values.status === 'all' ? undefined : values.status,
            appliedTo:
                values.appliedTo === 'all'
                    ? undefined
                    : (values.appliedTo as DocumentCategoryAppliedTo),
            required:
                values.required === 'all' ? undefined : values.required === 'true',
            expiryRequired:
                values.expiryRequired === 'all'
                    ? undefined
                    : values.expiryRequired === 'true',
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
            className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300"
        >
            <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 w-full">
                    <FormSelect
                        id="category-filter-status"
                        label={t('documentCategories.filters.status', { ns: 'document' })}
                        placeholder={t('documentCategories.filters.allStatuses', { ns: 'document' })}
                        control={control}
                        name="status"
                        options={[
                            { label: t('documentCategories.filters.allStatuses', { ns: 'document' }), value: 'all' },
                            { label: t('documentCategories.status.active', { ns: 'document' }), value: 'active' },
                            { label: t('documentCategories.status.inactive', { ns: 'document' }), value: 'inactive' },
                        ]}
                        t={t}
                        containerClassName="w-full space-y-3"
                    />

                    <FormSelect
                        id="category-filter-applied-to"
                        label={t('documentCategories.filters.appliedTo', { ns: 'document' })}
                        placeholder={t('documentCategories.appliedTo.allEmployees', { ns: 'document' })}
                        control={control}
                        name="appliedTo"
                        options={[
                            { label: t('common.all', { ns: 'document' }), value: 'all' },
                            { label: t('documentCategories.appliedTo.allEmployees', { ns: 'document' }), value: DocumentCategoryAppliedTo.ALL_EMPLOYEES },
                            { label: t('documentCategories.appliedTo.departmentSpecific', { ns: 'document' }), value: DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC },
                            { label: t('documentCategories.appliedTo.foreignEmployees', { ns: 'document' }), value: DocumentCategoryAppliedTo.FOREIGN_EMPLOYEE },
                        ]}
                        t={t}
                        containerClassName="w-full space-y-3"
                    />

                    <FormSelect
                        id="category-filter-required"
                        label={t('documentCategories.filters.required', { ns: 'document' })}
                        placeholder={t('common.all', { ns: 'document' })}
                        control={control}
                        name="required"
                        options={[
                            { label: t('common.all', { ns: 'document' }), value: 'all' },
                            { label: t('documentCategories.filters.yes', { ns: 'document' }), value: 'true' },
                            { label: t('documentCategories.filters.no', { ns: 'document' }), value: 'false' },
                        ]}
                        t={t}
                        containerClassName="w-full space-y-3"
                    />

                    <FormSelect
                        id="category-filter-expiry"
                        label={t('documentCategories.filters.expiryRequired', { ns: 'document' })}
                        placeholder={t('common.all', { ns: 'document' })}
                        control={control}
                        name="expiryRequired"
                        options={[
                            { label: t('common.all', { ns: 'document' }), value: 'all' },
                            { label: t('documentCategories.filters.yes', { ns: 'document' }), value: 'true' },
                            { label: t('documentCategories.filters.no', { ns: 'document' }), value: 'false' },
                        ]}
                        t={t}
                        containerClassName="w-full space-y-3"
                    />
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <Button
                        type="submit"
                        className="h-9 min-w-[102px] bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('attendance.applyFilters', { ns: 'dashboard', defaultValue: 'Apply filters' })}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={resetFilters}
                        className="h-9 min-w-[101px] border-muted-foreground text-foreground/80 hover:text-foreground font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('attendance.resetFilters', { ns: 'dashboard', defaultValue: 'Reset filters' })}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default DocumentCategoryFilterSection;
