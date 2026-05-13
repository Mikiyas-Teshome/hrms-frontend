'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, CheckCircle2, UserCheck2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { ContractsTable } from '@/components/dashboard/employees/contracts/ContractsTable';
import { AddContractSheet } from '@/components/dashboard/employees/contracts/AddContractSheet';

import { contractTypes as initialContractTypes, ContractType } from '@/data/contracts';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';

export default function ContractsPage() {
    const { t } = useTranslation(['contracts', 'dashboard', 'employees']);
    const [contracts, setContracts] = useState<ContractType[]>(initialContractTypes);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<ContractType | null>(null);
    const [deletingContract, setDeletingContract] = useState<ContractType | null>(null);

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

    const handleDeleteConfirm = () => {
        if (deletingContract) {
            setContracts(prev => prev.filter(c => c.id !== deletingContract.id));
            setDeletingContract(null);
        }
    };

    const handleSaveContract = (data: any) => {
        const mappedData: Partial<ContractType> = {
            name: data.name,
            status: data.status,
            description: data.description || '',
            duration: data.isPermanent ? 'Permanent' : data.duration,
            probation: data.probation,
            renewable: data.isRenewable,
        };

        if (editingContract) {
            setContracts(prev => prev.map(c => c.id === editingContract.id ? { ...c, ...mappedData } as ContractType : c));
        } else {
            const newContract: ContractType = {
                id: Math.random().toString(36).substr(2, 9),
                name: mappedData.name!,
                status: mappedData.status as any,
                description: mappedData.description!,
                duration: mappedData.duration!,
                probation: mappedData.probation!,
                renewable: mappedData.renewable!,
                contractsSigned: 0,
            };
            setContracts(prev => [newContract, ...prev]);
        }
    };

    return (
        <div className="flex flex-col gap-8 p-6 lg:p-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('title')}
                </h1>
                <Button 
                    onClick={handleAddClick}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 rounded-lg flex items-center gap-2 shadow-sm transition-all"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('addContract')}</span>
                </Button>
            </div>

            {/* Stats */}
            <SummaryStatList stats={stats} />

            {/* Table */}
            <div className="bg-card overflow-hidden">
                <div className="p-0">
                    <ContractsTable 
                        data={contracts} 
                        onEdit={handleEditClick}
                        onDelete={setDeletingContract}
                        onImport={() => console.log('Import')}
                        onExport={() => console.log('Export')}
                        onFilterClick={() => console.log('Filter')}
                    />
                </div>
            </div>

            <AddContractSheet 
                open={isAddSheetOpen} 
                onOpenChange={setIsAddSheetOpen}
                onSubmit={handleSaveContract}
                initialData={editingContract ? {
                    id: editingContract.id,
                    name: editingContract.name,
                    status: editingContract.status,
                    description: editingContract.description,
                    duration: editingContract.duration === 'Permanent' ? '' : editingContract.duration,
                    probation: editingContract.probation,
                    isPermanent: editingContract.duration === 'Permanent',
                    isRenewable: editingContract.renewable
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
