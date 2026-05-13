'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import { leavePoliciesStats } from '@/data/leave-policies';
import LeavePoliciesTable from './LeavePoliciesTable';
import AddLeavePolicySheet from './AddLeavePolicySheet';

const LeavePolicies = () => {
    const { t } = useTranslation('dashboard');
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">
                    {t('leavePolicies.title')}
                </h1>
                <Button 
                    className="bg-primary hover:bg-primary/90 text-white rounded-lg px-4 h-10 gap-2 w-fit"
                    onClick={() => setIsAddSheetOpen(true)}
                >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium text-sm">
                        {t('leavePolicies.addPolicy')}
                    </span>
                </Button>
            </div>

            <SummaryStatList stats={leavePoliciesStats} />

            <div className="flex flex-col gap-4">
                <LeavePoliciesTable />
            </div>

            <AddLeavePolicySheet 
                open={isAddSheetOpen} 
                onOpenChange={setIsAddSheetOpen} 
            />
        </div>
    );
};

export default LeavePolicies;
