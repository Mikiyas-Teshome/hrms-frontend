'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SummaryStatList from '@/components/dashboard/shared/SummaryStatList';
import LeaveTypesTable from './LeaveTypesTable';
import CreateLeaveTypeSheet from './CreateLeaveTypeSheet';
import { useTranslation } from 'react-i18next';
import { leaveTypeStats } from '@/data/leave-types';
import { FormSelect } from '@/components/ui/FormSelect';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';

const LeaveTypesPage = () => {
    const { t } = useTranslation('dashboard');
    const { data: profile } = useProfile();
    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
    const form = useForm({
        defaultValues: {
            companyId: '',
        },
    });
    const selectedCompanyId = form.watch('companyId');
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    useEffect(() => {
        if (companiesData?.length && !selectedCompanyId) {
            form.setValue('companyId', companiesData[0].id);
        } else if (profile?.companyId && !selectedCompanyId) {
            form.setValue('companyId', profile.companyId);
        }
    }, [companiesData, profile, selectedCompanyId, form]);

    const handleAddLeaveTypeClick = () => {
        setIsSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl text-foreground font-bold leading-8">{t('leaveTypes.title')}</h2>
                <div className="flex items-center gap-4">
                    <FormSelect
                        id="company-selector"
                        placeholder={isLoadingCompanies ? t("setup.loadingCompanies") : t("setup.selectCompanyPlaceholder")}
                        control={form.control}
                        name="companyId"
                        options={companiesData?.map((company) => ({ label: company.name, value: company.id })) || []}
                        t={t}
                        containerClassName="w-[200px]"
                    />
                    <Button
                        onClick={handleAddLeaveTypeClick}
                        className="flex items-center gap-2 w-fit px-4 py-2 h-9 rounded-[8px] cursor-pointer bg-primary hover:bg-primary/80 text-white border-0 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{t('leaveTypes.addLeaveType')}</span>
                    </Button>
                </div>
            </div>
            <SummaryStatList
                stats={leaveTypeStats.map((stat) => ({
                    title: t(`leaveTypes.stats.${stat.title.includes('Number') ? 'number' : stat.title.includes('Active') ? 'active' : stat.title.includes('Unpaid') ? 'unpaid' : 'paid'}`, stat.title),
                    value: stat.value,
                    icon: stat.icon,
                    borderColor: stat.borderColor
                }))}
            />
            <LeaveTypesTable companyId={selectedCompanyId} />
            
            <CreateLeaveTypeSheet 
                open={isSheetOpen} 
                onOpenChange={setIsSheetOpen} 
                defaultCompanyId={selectedCompanyId}
            />
        </div>
    );
};

export default LeaveTypesPage;
