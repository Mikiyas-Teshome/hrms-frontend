'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, UserCheck2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormSelect } from '@/components/ui/FormSelect';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { SummaryStatListSkeleton } from '@/components/common/SummaryStatSkeleton';
import { ContractsTable } from '@/components/dashboard/employees/contracts/ContractsTable';
import {
    AddContractSheet,
    type ContractTypeValues,
} from '@/components/dashboard/employees/contracts/AddContractSheet';
import { ContractType } from '@/data/contracts';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
    useContracts,
    useCreateContract,
    useUpdateContract,
    useDeleteContract,
} from '@/features/contracts/hooks/useContracts';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import {
    buildCompanyNameByOuIdMap,
    resolveCompanyLabel,
} from '@/features/organization/organization-unit-options.util';

function ContractsPageContent() {
    const { t } = useTranslation(['contracts', 'dashboard', 'employees']);
    const { toast } = useToast();
    const { hasPermission } = usePermissions();
    const canManageContractTypes = hasPermission('contracts:create');

    const companyForm = useForm({
        defaultValues: {
            ouId: '',
        },
    });
    const selectedOuId = useWatch({
        control: companyForm.control,
        name: 'ouId',
    });
    const selectedCompanyOuId = selectedOuId?.trim() ?? '';

    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
    const companyNameByOuId = useMemo(
        () => buildCompanyNameByOuIdMap(companiesData ?? []),
        [companiesData],
    );

    useEffect(() => {
        if (companiesData?.length && !companyForm.getValues('ouId')) {
            companyForm.setValue('ouId', companiesData[0].id);
        }
    }, [companiesData, companyForm]);

    const {
        data: contractsData,
        isLoading: isContractsLoading,
        isFetching: isContractsFetching,
    } = useContracts(
        selectedCompanyOuId ? { ouId: selectedCompanyOuId, limit: 100 } : undefined,
        { enabled: Boolean(selectedCompanyOuId) },
    );

    const isContractsPageLoading =
        isLoadingCompanies ||
        !selectedCompanyOuId ||
        isContractsLoading ||
        isContractsFetching;
    const createContractMutation = useCreateContract();
    const updateContractMutation = useUpdateContract();
    const deleteContractMutation = useDeleteContract();

    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<any | null>(null);
    const [sheetInitialData, setSheetInitialData] = useState<ContractTypeValues | null>(null);
    const [deletingContract, setDeletingContract] = useState<any | null>(null);

    const mapContractToInitialData = (contract: ContractType & { _raw?: any }): ContractTypeValues => ({
        id: contract.id,
        contractName: contract._raw?.contractName || '',
        status: contract._raw?.status || 'active',
        companyId: contract._raw?.ouId || '',
        description: contract._raw?.description || '',
        durationMonths: contract._raw?.durationMonths || undefined,
        probationPeriodMonths: contract._raw?.probationPeriodMonths || undefined,
        employmentType: contract._raw?.employmentType || 'full_time',
        contractType: contract._raw?.contractType || 'permanent',
        isRenewable: contract._raw?.isRenewable || false,
        insuranceIds: contract._raw?.insurances?.map((ins: any) => ins.id) || [],
        documentCategoryId: contract._raw?.documentCategoryId || '',
        documentUrl: contract._raw?.documentUrl || '',
        documentFileName: contract._raw?.documentUrl
            ? contract._raw.documentUrl.split('/').pop()?.split('?')[0] || ''
            : '',
    });

    const handleSheetOpenChange = (open: boolean) => {
        setIsAddSheetOpen(open);
        if (!open) {
            setEditingContract(null);
            setSheetInitialData(null);
        }
    };

    const contracts: (ContractType & { _raw?: unknown })[] = useMemo(() => {
        return (
            contractsData?.data?.map((c: any) => ({
                id: c.id,
                name: c.contractName || `Contract ${c.contractNumber}`,
                description: c.description || c.documentUrl || 'Employment contract type template',
                duration: c.durationMonths ? `${c.durationMonths} months` : 'Permanent',
                probation: c.probationPeriodMonths ? `${c.probationPeriodMonths} months` : 'None',
                renewable: c.isRenewable,
                contractsSigned: c.contractsSignedCount ?? 0,
                status: c.status === 'active' ? ('Active' as const) : ('Inactive' as const),
                ouId: c.ouId,
                companyName: resolveCompanyLabel(c.ouId, companyNameByOuId),
                _raw: c,
            })) || []
        );
    }, [contractsData, companyNameByOuId]);

    const stats = [
        {
            title: t('numContracts'),
            value: contracts.length,
            icon: FileText,
            iconColor: 'text-blue-600',
            iconBgColor: 'bg-blue-50',
            borderColor: 'border-blue-100',
        },
        {
            title: t('activeContracts'),
            value: contracts.filter(c => c.status === 'Active').length,
            icon: RefreshCw,
            iconColor: 'text-emerald-600',
            iconBgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-100',
        },
        {
            title: t('signedByEmployees'),
            value: contracts.reduce((acc, curr) => acc + (curr.contractsSigned || 0), 0),
            icon: UserCheck2,
            iconColor: 'text-indigo-600',
            iconBgColor: 'bg-indigo-50',
            borderColor: 'border-indigo-100',
        },
        {
            title: t('renewableContracts'),
            value: contracts.filter(c => c.renewable).length,
            icon: RefreshCw,
            iconColor: 'text-purple-600',
            iconBgColor: 'bg-purple-50',
            borderColor: 'border-purple-100',
        },
    ];

    const handleAddClick = () => {
        setEditingContract(null);
        setSheetInitialData(null);
        setIsAddSheetOpen(true);
    };

    const handleEditClick = (contract: ContractType & { _raw?: any }) => {
        setEditingContract(contract);
        setSheetInitialData(mapContractToInitialData(contract));
        setIsAddSheetOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (deletingContract) {
            try {
                await deleteContractMutation.mutateAsync(deletingContract.id);
                toast({
                    title: 'Success',
                    description: 'Contract type deleted successfully',
                });
            } catch (error: any) {
                toast({
                    title: 'Error',
                    description: error.message || 'Failed to delete contract',
                    variant: 'destructive',
                });
            } finally {
                setDeletingContract(null);
            }
        }
    };

    const handleSaveContract = async (data: any) => {
        const input: any = {
            contractNumber: data.contractNumber || `CON-${Math.floor(100000 + Math.random() * 900000)}`,
            contractName: data.contractName,
            description: data.description || undefined,
            contractType: data.contractType,
            employmentType: data.employmentType || undefined,
            status: data.status,
            durationMonths: data.durationMonths || undefined,
            isRenewable: data.isRenewable,
            probationPeriodMonths: data.probationPeriodMonths || undefined,
            ouId: data.companyId || selectedCompanyOuId || editingContract?._raw?.ouId || undefined,
            insuranceIds: data.insuranceIds?.length ? data.insuranceIds : undefined,
            documentUrl: data.documentUrl || undefined,
        };

        try {
            if (editingContract) {
                await updateContractMutation.mutateAsync({
                    id: editingContract.id,
                    input: {
                        contractNumber: editingContract._raw?.contractNumber,
                        contractName: input.contractName,
                        description: input.description,
                        contractType: input.contractType,
                        employmentType: input.employmentType,
                        status: input.status,
                        durationMonths: input.durationMonths,
                        isRenewable: input.isRenewable,
                        probationPeriodMonths: input.probationPeriodMonths,
                        documentUrl: input.documentUrl,
                        insuranceIds: input.insuranceIds,
                    },
                });
                toast({
                    title: 'Success',
                    description: 'Contract type updated successfully',
                });
            } else {
                await createContractMutation.mutateAsync(input);
                toast({
                    title: 'Success',
                    description: 'Contract type created successfully',
                });
            }
            handleSheetOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save contract',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('title')}
                </h1>
                <div className="flex items-center gap-4">
                    <FormSelect
                        id="contracts-company-selector"
                        placeholder={
                            isLoadingCompanies
                                ? t('dashboard:setup.loadingCompanies', { defaultValue: 'Loading...' })
                                : t('filterCompany')
                        }
                        control={companyForm.control}
                        name="ouId"
                        options={
                            companiesData?.map((company) => ({
                                label: company.name || company.id,
                                value: company.id,
                            })) || []
                        }
                        t={t}
                        containerClassName="w-[200px]"
                    />
                    {canManageContractTypes && (
                        <Button
                            onClick={handleAddClick}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                        >
                            <Plus className="h-4 w-4" />
                            <span>{t('addContract')}</span>
                        </Button>
                    )}
                </div>
            </div>

            {isContractsPageLoading ? (
                <SummaryStatListSkeleton count={4} />
            ) : (
                <SummaryStatList stats={stats} />
            )}

            <div className="bg-card overflow-hidden">
                <div className="p-0">
                    <ContractsTable
                        data={contracts}
                        isLoading={isContractsPageLoading}
                        onEdit={canManageContractTypes ? handleEditClick : undefined}
                        onDelete={canManageContractTypes ? setDeletingContract : undefined}
                    />
                </div>
            </div>

            <AddContractSheet
                open={isAddSheetOpen}
                onOpenChange={handleSheetOpenChange}
                onSubmit={handleSaveContract}
                defaultCompanyId={selectedCompanyOuId}
                initialData={sheetInitialData}
            />

            <ConfirmationModal
                open={!!deletingContract}
                onOpenChange={(open) => !open && setDeletingContract(null)}
                onConfirm={handleDeleteConfirm}
                title={t('employees:delete')}
                message={t('employees:deleteConfirmationMessage', { name: deletingContract?.name })}
                confirmLabel={t('employees:delete')}
                cancelLabel={t('employees:cancel')}
            />
        </div>
    );
}

export default function ContractsPage() {
    return (
        <ProtectedRoute module="contracts" actions={['read', 'create']}>
            <ContractsPageContent />
        </ProtectedRoute>
    );
}
