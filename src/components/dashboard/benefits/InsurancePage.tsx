'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, Eye, Trash2, PencilLine, RefreshCw, ListFilter } from 'lucide-react';
import { insuranceStats } from '@/data/benefits';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormSelect } from '@/components/ui/FormSelect';
import AddInsuranceSheet from './AddInsuranceSheet';
import InsuranceDetailSheet from './InsuranceDetailSheet';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { useInsurances, useInsuranceStats, useDeleteInsurance, useUpdateInsuranceStatus } from '@/features/insurance/hooks/useInsurance';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { Insurance } from '@/features/insurance/insurance.types';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const InsurancePage = () => {
    const { t } = useTranslation(['dashboard']);
    const { toast } = useToast();
    const { hasPermission } = usePermissions();
    const canManageInsurance = hasPermission('benefits_insurance:update');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
    const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [insuranceToDelete, setInsuranceToDelete] = useState<string | null>(null);
    const [sortColumn, setSortColumn] = useState<string>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<{
        status?: string;
        coverageType?: string;
        assignment?: string;
    }>({});
    const form = useForm({
        defaultValues: {
            ouId: '',
        },
    });
    const filterForm = useForm({
        defaultValues: {
            status: 'all',
            coverageType: 'all',
            assignment: 'all',
        },
    });

    const selectedOuId = useWatch({
        control: form.control,
        name: 'ouId',
    });

    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();

    useEffect(() => {
        if (companiesData?.length && !form.getValues('ouId')) {
            form.setValue('ouId', companiesData[0].id);
        }
    }, [companiesData, form]);

    const { data, isLoading } = useInsurances({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch || undefined,
        ouId: selectedOuId || undefined,
        sortBy: mapInsuranceSortBy(sortColumn) ?? 'createdAt',
        sortOrder: sortDirection === 'asc' ? 'ASC' : 'DESC',
        status: appliedFilters.status,
        coverageType: appliedFilters.coverageType as any,
        assignment: appliedFilters.assignment as any,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
            setCurrentPage(1);
        }, 350);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const handleSort = (columnKey: string) => {
        if (sortColumn === columnKey) {
            setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortColumn(columnKey);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    const { data: statsData, isLoading: isLoadingStats } = useInsuranceStats(
        selectedOuId || undefined,
    );

    const isStatsLoading = !selectedOuId || isLoadingStats;

    const deleteMutation = useDeleteInsurance();
    const updateStatusMutation = useUpdateInsuranceStatus();

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);

    const dynamicStats = insuranceStats.map((stat) => {
        let value = stat.value;

        if (statsData) {
            switch (stat.id) {
                case 'numPlans':
                    value = statsData.totalPlans.toString();
                    break;
                case 'activePlans':
                    value = statsData.activePlans.toString();
                    break;
                case 'numProviders':
                    value = statsData.providerCount.toString();
                    break;
                case 'monthlySpending':
                    value = formatCurrency(statsData.monthlySpending);
                    break;
            }
        }

        return { ...stat, value };
    });

    const handleEdit = (insurance: Insurance) => {
        if (!canManageInsurance) return;
        setSelectedInsurance(insurance);
        setIsAddSheetOpen(true);
    };

    const handleView = (insurance: Insurance) => {
        setSelectedInsurance(insurance);
        setIsDetailSheetOpen(true);
    };

    const handleDelete = (id: string) => {
        if (!canManageInsurance) return;
        setInsuranceToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleUpdateStatus = (insurance: Insurance) => {
        if (!canManageInsurance) return;
        const isActive = insurance.status.toLowerCase() === 'active';
        const nextStatus = isActive ? 'inactive' : 'active';

        updateStatusMutation.mutate(
            { id: insurance.id, input: { status: nextStatus } },
            {
                onSuccess: (result) => {
                    if (result && !result.success) {
                        toast({
                            title: t('benefits.insurance.actions.statusUpdateError', { defaultValue: 'Failed to update status' }),
                            description: result.error,
                            variant: 'destructive',
                        });
                        return;
                    }
                    toast({
                        title: t('benefits.insurance.actions.statusUpdateSuccess', { defaultValue: 'Status updated successfully' }),
                    });
                },
                onError: () => {
                    toast({
                        title: t('benefits.insurance.actions.statusUpdateError', { defaultValue: 'Failed to update status' }),
                        variant: 'destructive',
                    });
                },
            },
        );
    };

    const handleConfirmDelete = async () => {
        if (!insuranceToDelete) return;
        try {
            const result = await deleteMutation.mutateAsync(insuranceToDelete);
            if (result && !result.success) {
                toast({
                    title: 'Error',
                    description: result.error || 'Failed to delete insurance',
                    variant: 'destructive',
                });
                return;
            }
            toast({
                title: 'Success',
                description: 'Insurance deleted successfully',
            });
        } catch {
            toast({
                title: 'Error',
                description: 'Failed to delete insurance',
                variant: 'destructive',
            });
        } finally {
            setIsDeleteModalOpen(false);
            setInsuranceToDelete(null);
        }
    };

    const columns: ColumnConfig<Insurance>[] = [
        {
            key: 'insuranceName',
            label: t('benefits.insurance.table.planName'),
            sortable: true,
        },
        {
            key: 'providerName',
            label: t('benefits.insurance.table.provider'),
            sortable: true,
        },
        {
            key: 'coverageType',
            label: t('benefits.insurance.table.coverageType'),
            sortable: true,
        },
        {
            key: 'assignment',
            label: 'Assignment',
            sortable: true,
            render: (item) => (
                <span className="capitalize">{item.assignment.toLowerCase().replace('_', ' ')}</span>
            )
        },
        {
            key: 'status',
            label: t('benefits.insurance.table.status'),
            render: (item) => (
                <Badge 
                    variant="outline" 
                    className={
                        item.status.toLowerCase() === 'active' 
                        ? "bg-green-500/10 text-green-600 border-green-500/20" 
                        : "bg-muted text-muted-foreground border-border"
                    }
                >
                    <div className={item.status.toLowerCase() === 'active' ? "w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" : "w-1.5 h-1.5 rounded-full bg-gray-500 mr-1.5"} />
                    {item.status}
                </Badge>
            )
        }
    ];

    const applyFilters = filterForm.handleSubmit((values) => {
        setAppliedFilters({
            status: values.status === 'all' ? undefined : values.status,
            coverageType: values.coverageType === 'all' ? undefined : values.coverageType,
            assignment: values.assignment === 'all' ? undefined : values.assignment,
        });
        setCurrentPage(1);
    });

    const resetFilters = () => {
        filterForm.reset({
            status: 'all',
            coverageType: 'all',
            assignment: 'all',
        });
        setAppliedFilters({});
        setCurrentPage(1);
    };

    const renderRowActions = (item: Insurance) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleView(item)}>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>View</span>
                </DropdownMenuItem>
                {canManageInsurance ? (
                    <>
                        <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(item)}>
                            <PencilLine className="h-4 w-4 text-muted-foreground" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            disabled={updateStatusMutation.isPending}
                            onClick={() => handleUpdateStatus(item)}
                        >
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {item.status.toLowerCase() === 'active'
                                    ? t('benefits.insurance.actions.markInactive', { defaultValue: 'Mark as inactive' })
                                    : t('benefits.insurance.actions.markActive', { defaultValue: 'Mark as active' })}
                            </span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => handleDelete(item.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </>
                ) : null}
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">
            <AddInsuranceSheet
                open={isAddSheetOpen}
                onOpenChange={(open) => {
                    setIsAddSheetOpen(open);
                    if (!open) setSelectedInsurance(null);
                }}
                insurance={selectedInsurance}
            />

            <InsuranceDetailSheet
                open={isDetailSheetOpen}
                onOpenChange={(open) => {
                    setIsDetailSheetOpen(open);
                    if (!open) setSelectedInsurance(null);
                }}
                insurance={selectedInsurance}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('benefits.insurance.delete.title', { defaultValue: 'Delete Insurance Plan' })}
                message={t('benefits.insurance.delete.message', { defaultValue: 'Are you sure you want to delete this insurance plan? This action cannot be undone.' })}
                confirmLabel={t('benefits.insurance.delete.confirm', { defaultValue: 'Delete' })}
                cancelLabel={t('common.cancel', { defaultValue: 'Cancel' })}
                onConfirm={handleConfirmDelete}
                isLoading={deleteMutation.isPending}
                variant="danger"
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl text-foreground font-bold leading-8 tracking-tight">
                    {t('benefits.insurance.title')}
                </h1>
                <div className="flex items-center gap-4">
                    <FormSelect
                        id="company-selector"
                        placeholder={isLoadingCompanies ? t("setup.loadingCompanies", { defaultValue: "Loading..." }) : "Filter by Company"}
                        control={form.control}
                        name="ouId"
                        options={companiesData?.map((company) => ({ label: company.name, value: company.id })) || []}
                        t={t}
                        containerClassName="w-[200px]"
                        onChange={() => setCurrentPage(1)}
                    />
                    {canManageInsurance ? (
                        <Button
                            onClick={() => {
                                setSelectedInsurance(null);
                                setIsAddSheetOpen(true);
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 h-9 rounded-lg transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4" />
                            <span>{t('benefits.insurance.addInsurance')}</span>
                        </Button>
                    ) : null}
                </div>
            </div>

            {isStatsLoading ? (
                <SummaryStatListSkeleton count={insuranceStats.length} />
            ) : (
                <SummaryStatList
                    stats={dynamicStats.map((stat) => ({
                        title: t(`benefits.insurance.stats.${stat.id}`),
                        value: stat.value,
                        icon: stat.icon,
                        iconBgColor: stat.bgColor,
                        iconColor: stat.color,
                        borderColor: stat.borderColor,
                    }))}
                />
            )}

            <div className="w-full">
                <UniversalDataTable
                    data={data?.data || []}
                    columns={columns}
                    enableSelection
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    searchPlaceholder="Search insurance..."
                    currentPage={currentPage}
                    totalPages={data?.pagination?.totalPages || 1}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    renderRowActions={renderRowActions}
                    totalItems={data?.pagination?.total || 0}
                    isLoading={isLoading}
                    sortColumn={sortColumn}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                    renderCustomFilter={(
                        <Button
                            variant="outline"
                            size="default"
                            className="h-10 gap-2 border-input"
                            onClick={() => setShowFilters((prev) => !prev)}
                        >
                            <ListFilter className="h-4 w-4" />
                            <span>Filter</span>
                        </Button>
                    )}
                    renderFilterPanel={
                        showFilters ? (
                            <form onSubmit={applyFilters} className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormSelect
                                        id="insurance-filter-status"
                                        label={t('benefits.insurance.table.status', { defaultValue: 'Status' })}
                                        control={filterForm.control}
                                        name="status"
                                        options={[
                                            { label: 'All', value: 'all' },
                                            { label: 'Active', value: 'active' },
                                            { label: 'Inactive', value: 'inactive' },
                                        ]}
                                        t={t}
                                    />
                                    <FormSelect
                                        id="insurance-filter-coverage"
                                        label={t('benefits.insurance.table.coverageType', { defaultValue: 'Coverage type' })}
                                        control={filterForm.control}
                                        name="coverageType"
                                        options={[
                                            { label: 'All', value: 'all' },
                                            { label: 'Health', value: 'HEALTH' },
                                            { label: 'Dental', value: 'DENTAL' },
                                            { label: 'Vision', value: 'VISION' },
                                            { label: 'Life', value: 'LIFE' },
                                            { label: 'Other', value: 'OTHER' },
                                        ]}
                                        t={t}
                                    />
                                    <FormSelect
                                        id="insurance-filter-assignment"
                                        label={t('benefits.insurance.table.assignment', { defaultValue: 'Assignment' })}
                                        control={filterForm.control}
                                        name="assignment"
                                        options={[
                                            { label: 'All', value: 'all' },
                                            { label: 'All Employees', value: 'ALL_EMPLOYEES' },
                                            { label: 'Individual', value: 'INDIVIDUAL' },
                                            { label: 'Department Based', value: 'DEPARTMENT_BASED' },
                                            { label: 'Role Based', value: 'ROLE_BASED' },
                                        ]}
                                        t={t}
                                    />
                                </div>
                                <div className="flex justify-end gap-3 mt-4">
                                    <Button type="button" variant="outline" onClick={resetFilters}>Reset</Button>
                                    <Button type="submit">Apply filters</Button>
                                </div>
                            </form>
                        ) : undefined
                    }
                />
            </div>
        </div>
    );
};

export default InsurancePage;

function mapInsuranceSortBy(column: string):
    | 'createdAt'
    | 'insuranceName'
    | 'providerName'
    | 'coverageType'
    | 'assignment'
    | 'status'
    | 'startDate'
    | null {
    if (column === 'insuranceName') return 'insuranceName';
    if (column === 'providerName') return 'providerName';
    if (column === 'coverageType') return 'coverageType';
    if (column === 'assignment') return 'assignment';
    if (column === 'status') return 'status';
    if (column === 'startDate') return 'startDate';
    if (column === 'createdAt') return 'createdAt';
    return null;
}
