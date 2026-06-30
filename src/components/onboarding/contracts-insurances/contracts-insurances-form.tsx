'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { useContracts } from '@/features/contracts/hooks/useContracts';
import {
    OnboardingStepTabs,
    OnboardingStepTabsList,
    OnboardingStepTabTrigger,
    OnboardingStepTabsContent,
} from '@/components/onboarding/shared/onboarding-step-tabs';
import { InsuranceTab } from './insurance-tab';
import { ContractTab } from './contract-tab';

interface ContractsInsurancesFormProps {
    onNext?: () => void;
    onBack?: () => void;
}

export function ContractsInsurancesForm({ onNext, onBack }: ContractsInsurancesFormProps) {
    const { t } = useTranslation('contractsInsurances');
    const router = useRouter();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('insurances');
    const [isSaving, setIsSaving] = useState(false);

    const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
    const companyOptions = useMemo(() => {
        return (companiesData as any[])?.map((c) => ({
            label: c.name || c.legalName || c.id,
            value: c.id,
        })) || [];
    }, [companiesData]);

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
    const effectiveCompanyId = selectedCompanyId || companyOptions[0]?.value || '';
    const selectedCompanyName = useMemo(() => {
        return companyOptions.find(c => c.value === effectiveCompanyId)?.label || '';
    }, [companyOptions, effectiveCompanyId]);

    const contractFilter = useMemo(
        () =>
            effectiveCompanyId
                ? {
                      limit: 1,
                      page: 1,
                      ouId: effectiveCompanyId,
                  }
                : undefined,
        [effectiveCompanyId],
    );

    const { data: contractsResponse, isLoading: isLoadingContracts } = useContracts(
        contractFilter,
        { enabled: Boolean(effectiveCompanyId) },
    );

    const hasContractTemplate =
        (contractsResponse?.pagination?.total ?? contractsResponse?.data?.length ?? 0) > 0;

    const continueDisabled =
        isSaving || isLoadingContracts || !effectiveCompanyId || !hasContractTemplate;

    const handleContinue = async () => {
        if (!effectiveCompanyId) {
            toast({
                title: t('actions.error', { defaultValue: 'Error' }),
                description: t('actions.selectCompanyFirst', {
                    defaultValue: 'Please select a company first.',
                }),
                variant: 'destructive',
            });
            return;
        }

        if (!hasContractTemplate) {
            setActiveTab('contracts');
            toast({
                title: t('actions.error', { defaultValue: 'Error' }),
                description: t('actions.contractTemplateRequired'),
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            if (onNext) {
                onNext();
            } else {
                router.push('/onboarding/team-setup');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 pb-16">
            <OnboardingStepTabs value={activeTab} onValueChange={setActiveTab}>
                <OnboardingStepTabsList>
                    <OnboardingStepTabTrigger value="insurances">
                        {t('insurancesTab')}
                    </OnboardingStepTabTrigger>
                    <OnboardingStepTabTrigger value="contracts">
                        {t('contractsTab')}
                    </OnboardingStepTabTrigger>
                </OnboardingStepTabsList>

                <div className="w-full space-y-2">
                    <Label className="text-sm font-semibold text-foreground">{t('selectCompany')}</Label>
                    <Select
                        onValueChange={(val) => {
                            if (val) setSelectedCompanyId(val);
                        }}
                        value={effectiveCompanyId}
                    >
                        <SelectTrigger
                            id="onboarding-company-selector"
                            className="h-11 w-full rounded-lg bg-background border border-input text-sm"
                        >
                            <SelectValue
                                placeholder={
                                    isLoadingCompanies
                                        ? 'Loading...'
                                        : t('selectCompanyPlaceholder')
                                }
                            />
                        </SelectTrigger>
                        <SelectContent position="popper" sideOffset={4}>
                            {companyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <OnboardingStepTabsContent value="insurances">
                    <InsuranceTab
                        selectedCompanyId={effectiveCompanyId}
                        companyName={selectedCompanyName}
                        onContinueToContract={() => setActiveTab('contracts')}
                    />
                </OnboardingStepTabsContent>

                <OnboardingStepTabsContent value="contracts">
                    <ContractTab
                        selectedCompanyId={effectiveCompanyId}
                        companyName={selectedCompanyName}
                    />
                </OnboardingStepTabsContent>
            </OnboardingStepTabs>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200/60 dark:border-zinc-800/80">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                        if (onBack) {
                            onBack();
                        } else {
                            router.push('/onboarding/payroll-structure');
                        }
                    }}
                    className="flex items-center gap-2 text-sm font-semibold text-foreground/80 transition-transform hover:-translate-x-1 rtl:hover:translate-x-1"
                >
                    <ArrowLeft className="h-4 w-4" />
                    {t('actions.back')}
                </Button>
                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={continueDisabled}
                    className="h-11 rounded-[10px] bg-primary hover:bg-primary/90 px-8 text-sm font-semibold text-white transition-all shadow-sm"
                >
                    {isSaving ? 'Saving...' : t('actions.continue')}
                </Button>
            </div>
        </div>
    );
}
