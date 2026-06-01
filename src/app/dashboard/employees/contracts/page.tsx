'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, UserCheck2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { ContractsTable } from '@/components/dashboard/employees/contracts/ContractsTable';
import { AddContractSheet } from '@/components/dashboard/employees/contracts/AddContractSheet';
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
import { useInsurances } from '@/features/insurance/hooks/useInsurance';

function ContractsPageContent() {
    const { t } = useTranslation(['contracts', 'dashboard', 'employees']);
    const { toast } = useToast();
    const { hasPermission } = usePermissions();
    const canManageContractTypes = hasPermission('contracts:create');

    const { data: contractsData } = useContracts();
    const { data: insurancesData } = useInsurances({ limit: 100 });

    const createContractMutation = useCreateContract();
    const updateContractMutation = useUpdateContract();
    const deleteContractMutation = useDeleteContract();

    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<any | null>(null);
    const [deletingContract, setDeletingContract] = useState<any | null>(null);

    const contracts: ContractType[] = React.useMemo(() => {
        return contractsData?.data?.map((c: any) => ({
            id: c.id,
            name: c.contractName || `Contract ${c.contractNumber}`,
            description: c.description || c.documentUrl || 'Employment contract type template',
            duration: c.durationMonths ? `${c.durationMonths} months` : 'Permanent',
            probation: c.probationPeriodMonths ? `${c.probationPeriodMonths} months` : 'None',
            renewable: c.isRenewable,
            contractsSigned: c.assignments?.length || 0,
            status: c.status === 'active' ? 'Active' : 'Inactive',
            _raw: c
        })) || [];
    }, [contractsData]);

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
        setIsAddSheetOpen(true);
    };

    const handleEditClick = (contract: ContractType) => {
        setEditingContract(contract);
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
        const insurancesInput = data.insuranceIds?.map((id: string) => {
            const ins = insurancesData?.data?.find(i => i.id === id);
            if (!ins) return null;
            return {
                insuranceName: ins.insuranceName,
                providerName: ins.providerName,
                policyNumber: ins.policyNumber,
                cardId: ins.cardId || undefined,
                coverageType: ins.coverageType,
                coverageAmount: ins.coverageAmount || undefined,
                assignment: ins.assignment,
                renewalType: ins.renewalType,
                hasDependentsCoverage: ins.hasDependentsCoverage,
                maxDependents: ins.maxDependents || undefined,
                allowedDependents: ins.allowedDependents,
                includedServices: ins.includedServices,
                employmentType: ins.employmentType || undefined,
                minTenureMonths: ins.minTenureMonths || undefined,
                employerContribution: ins.employerContribution,
                employeeContribution: ins.employeeContribution,
                startDate: ins.startDate,
                endDate: ins.endDate,
                status: ins.status,
            };
        }).filter(Boolean);

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
            insurances: insurancesInput,
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
            setIsAddSheetOpen(false);
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
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('title')}
                </h1>
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

            {/* Stats */}
            <SummaryStatList stats={stats} />

            {/* Table */}
            <div className="bg-card overflow-hidden">
                <div className="p-0">
                    <ContractsTable
                        data={contracts}
                        onEdit={canManageContractTypes ? handleEditClick : undefined}
                        onDelete={canManageContractTypes ? setDeletingContract : undefined}
                    />
                </div>
            </div>

            <AddContractSheet 
                open={isAddSheetOpen} 
                onOpenChange={setIsAddSheetOpen}
                onSubmit={handleSaveContract}
                initialData={editingContract ? {
                    id: editingContract.id,
                    contractName: editingContract._raw?.contractName || '',
                    status: editingContract._raw?.status || 'active',
                    companyId: editingContract._raw?.ouId || '',
                    description: editingContract._raw?.description || '',
                    durationMonths: editingContract._raw?.durationMonths || undefined,
                    probationPeriodMonths: editingContract._raw?.probationPeriodMonths || undefined,
                    employmentType: editingContract._raw?.employmentType || 'full_time',
                    contractType: editingContract._raw?.contractType || 'permanent',
                    isRenewable: editingContract._raw?.isRenewable || false,
                    insuranceIds: editingContract._raw?.insurances?.map((ins: any) => ins.id) || [],
                    documentCategoryId: editingContract._raw?.documentCategoryId || '',
                    documentUrl: editingContract._raw?.documentUrl || '',
                    documentFileName: editingContract._raw?.documentUrl
                        ? editingContract._raw.documentUrl.split('/').pop()?.split('?')[0] || ''
                        : '',
                } : null}
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
