'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
    DocumentApprovalState,
    DocumentCategory,
    DocumentComplianceStatus,
    EmployeeDocumentOwnerFilterInput,
} from '@/features/documents/documents.types';
import { EmployeeDirectoryEntry } from '@/features/employee/employee.types';

interface EmployeeDocumentFilterSectionProps {
    isVisible: boolean;
    onApply: (filters: EmployeeDocumentOwnerFilterInput) => void;
    onReset: () => void;
    initialFilters?: EmployeeDocumentOwnerFilterInput;
    employees: EmployeeDirectoryEntry[];
    categories: DocumentCategory[];
}

type FilterFormValues = {
    ownerId: string;
    categoryId: string;
    status: string;
    approvalState: string;
};

const ALL_VALUE = '__all__';

const DEFAULT_FORM_VALUES: FilterFormValues = {
    ownerId: ALL_VALUE,
    categoryId: ALL_VALUE,
    status: ALL_VALUE,
    approvalState: ALL_VALUE,
};

const EmployeeDocumentFilterSection: React.FC<EmployeeDocumentFilterSectionProps> = ({
    isVisible,
    onApply,
    onReset,
    initialFilters,
    employees,
    categories,
}) => {
    const { t } = useTranslation(['document', 'dashboard']);
    const [employeeFilterOpen, setEmployeeFilterOpen] = React.useState(false);
    const [employeeSearch, setEmployeeSearch] = React.useState('');

    const defaultValues = React.useMemo<FilterFormValues>(() => ({
        ownerId: initialFilters?.ownerId ?? ALL_VALUE,
        categoryId: initialFilters?.categoryId ?? ALL_VALUE,
        status: initialFilters?.status ?? ALL_VALUE,
        approvalState: initialFilters?.approvalState ?? ALL_VALUE,
    }), [initialFilters]);

    const { control, handleSubmit, reset, watch, setValue } = useForm<FilterFormValues>({
        defaultValues,
    });

    React.useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const selectedOwnerId = watch('ownerId');

    const employeeOptions = React.useMemo(
        () =>
            employees.map((employee) => ({
                id: employee.id,
                label: `${employee.firstName} ${employee.lastName}`.trim(),
            })),
        [employees],
    );

    const visibleEmployeeOptions = React.useMemo(() => {
        const query = employeeSearch.trim().toLowerCase();
        if (!query) {
            return employeeOptions.slice(0, 5);
        }
        return employeeOptions.filter((employee) => employee.label.toLowerCase().includes(query));
    }, [employeeOptions, employeeSearch]);

    const selectedEmployeeLabel = React.useMemo(
        () => employeeOptions.find((employee) => employee.id === selectedOwnerId)?.label,
        [employeeOptions, selectedOwnerId],
    );

    const applyFilters = (values: FilterFormValues) => {
        onApply({
            ownerId: values.ownerId === ALL_VALUE ? undefined : values.ownerId,
            categoryId: values.categoryId === ALL_VALUE ? undefined : values.categoryId,
            status: values.status === ALL_VALUE ? undefined : (values.status as DocumentComplianceStatus),
            approvalState:
                values.approvalState === ALL_VALUE
                    ? undefined
                    : (values.approvalState as DocumentApprovalState),
        });
    };

    const resetFilters = () => {
        reset(DEFAULT_FORM_VALUES);
        onReset();
    };

    const handleEmployeeFilterOpenChange = (open: boolean) => {
        setEmployeeFilterOpen(open);
        if (!open) {
            setEmployeeSearch('');
        }
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
                    <div className="flex flex-col gap-2 w-full space-y-3">
                        <span className="text-sm font-medium text-foreground">
                            {t('employeeDocuments.filters.employee', { ns: 'document' })}
                        </span>
                        <Popover open={employeeFilterOpen} onOpenChange={handleEmployeeFilterOpenChange}>
                            <PopoverTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={employeeFilterOpen}
                                    className={cn(
                                        'w-full justify-between font-normal h-10 px-4 rounded-[8px] bg-background border border-input',
                                        selectedOwnerId === ALL_VALUE && 'text-muted-foreground',
                                    )}
                                >
                                    {selectedOwnerId === ALL_VALUE
                                        ? t('employeeDocuments.filters.allEmployees', { ns: 'document' })
                                        : selectedEmployeeLabel || t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder={t('employeeDocuments.filters.searchEmployee', { ns: 'document' })}
                                        value={employeeSearch}
                                        onValueChange={setEmployeeSearch}
                                    />
                                    <CommandList className="max-h-60">
                                        <CommandEmpty>
                                            {t('employeeDocuments.filters.noEmployeeFound', { ns: 'document' })}
                                        </CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value={t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                                onSelect={() => {
                                                    setValue('ownerId', ALL_VALUE);
                                                    setEmployeeFilterOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        selectedOwnerId === ALL_VALUE ? 'opacity-100' : 'opacity-0',
                                                    )}
                                                />
                                                {t('employeeDocuments.filters.allEmployees', { ns: 'document' })}
                                            </CommandItem>
                                            {visibleEmployeeOptions.map((employee) => (
                                                <CommandItem
                                                    key={employee.id}
                                                    value={employee.label}
                                                    onSelect={() => {
                                                        setValue('ownerId', employee.id);
                                                        setEmployeeFilterOpen(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            'mr-2 h-4 w-4',
                                                            selectedOwnerId === employee.id ? 'opacity-100' : 'opacity-0',
                                                        )}
                                                    />
                                                    {employee.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <FormSelect
                        id="employee-documents-filter-category"
                        label={t('employeeDocuments.filters.category', { ns: 'document' })}
                        placeholder={t('employeeDocuments.filters.allCategories', { ns: 'document' })}
                        control={control}
                        name="categoryId"
                        options={[
                            { label: t('employeeDocuments.filters.allCategories', { ns: 'document' }), value: ALL_VALUE },
                            ...categories.map((category) => ({ label: category.name, value: category.id })),
                        ]}
                        t={t as (key: string) => string}
                        containerClassName="w-full space-y-3"
                    />

                    <FormSelect
                        id="employee-documents-filter-status"
                        label={t('employeeDocuments.filters.status', { ns: 'document' })}
                        placeholder={t('employeeDocuments.filters.allStatuses', { ns: 'document' })}
                        control={control}
                        name="status"
                        options={[
                            { label: t('employeeDocuments.filters.allStatuses', { ns: 'document' }), value: ALL_VALUE },
                            { label: t('employeeDocuments.compliance.compliant', { ns: 'document' }), value: DocumentComplianceStatus.COMPLIANT },
                            { label: t('employeeDocuments.compliance.nearExpiry', { ns: 'document' }), value: DocumentComplianceStatus.NEAR_EXPIRE },
                            { label: t('employeeDocuments.compliance.missing', { ns: 'document' }), value: DocumentComplianceStatus.MISSING },
                            { label: t('employeeDocuments.compliance.expired', { ns: 'document' }), value: DocumentComplianceStatus.EXPIRED },
                        ]}
                        t={t as (key: string) => string}
                        containerClassName="w-full space-y-3"
                    />

                    <FormSelect
                        id="employee-documents-filter-approval"
                        label={t('employeeDocuments.filters.approval', { ns: 'document' })}
                        placeholder={t('common.all', { ns: 'document' })}
                        control={control}
                        name="approvalState"
                        options={[
                            { label: t('common.all', { ns: 'document' }), value: ALL_VALUE },
                            { label: t('employeeDocuments.approval.pending', { ns: 'document' }), value: DocumentApprovalState.PENDING },
                            { label: t('employeeDocuments.approval.approved', { ns: 'document' }), value: DocumentApprovalState.APPROVED },
                            { label: t('employeeDocuments.approval.rejected', { ns: 'document' }), value: DocumentApprovalState.REJECTED },
                        ]}
                        t={t as (key: string) => string}
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

export default EmployeeDocumentFilterSection;
