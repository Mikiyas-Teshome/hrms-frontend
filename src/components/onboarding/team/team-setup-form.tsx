'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { teamSetupSchema, type TeamSetupValues } from '@/components/onboarding/schemas/team-setup';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DirectoryTab } from '@/components/onboarding/team/tabs/directory-tab';
import { AssignManagerTab } from '@/components/onboarding/team/tabs/assign-manager';
import { useOnboarding } from '@/components/onboarding/context/OnboardingContext';
import { useToast } from '@/hooks/use-toast';

interface TeamSetupFormProps {
    onNext?: () => void;
    onBack?: () => void;
}

export function TeamSetupForm({ onNext, onBack }: TeamSetupFormProps) {
    const { t } = useTranslation('teamSetup');
    const router = useRouter();
    const { setTeamData, teamData } = useOnboarding();
    const [activeTab, setActiveTab] = useState('directory');
    const { toast } = useToast();

    // Directory State
    const {
        control: directoryControl,
        handleSubmit: handleDirectorySubmit,
        formState: {},
    } = useForm<TeamSetupValues>({
        resolver: zodResolver(teamSetupSchema),
        defaultValues:
            Object.keys(teamData).length > 0
                ? teamData
                : {
                      employees: [],
                  },
    });

    const { fields: directoryFields, append: appendEmployee } = useFieldArray({
        control: directoryControl,
        name: 'employees',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (data: TeamSetupValues) => {
        setIsSubmitting(true);
        try {
            setTeamData(data);
            if (onNext) {
                await onNext();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onInvalid = () => {
        toast({
            variant: 'destructive',
            title: 'Validation Error',
            description: 'Please check the employee list for errors.',
        });
    };

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 pb-2">
            {/* Custom Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex">
                    <TabsList className="h-9 w-full max-w-154.5 bg-secondary p-0.75 rounded-[10px] border-none">
                        <TabsTrigger
                            value="directory"
                            className="flex-1 h-7 rounded-[8px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary text-muted-foreground font-medium text-sm transition-all"
                        >
                            {t('tabs.directory') || 'Employee directory'}
                        </TabsTrigger>
                        <TabsTrigger
                            value="department"
                            className="flex-1 h-7 rounded-[8px] data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary text-muted-foreground font-medium text-sm transition-all"
                        >
                            {t('tabs.department') || 'Assign Managers'}
                        </TabsTrigger>
                    </TabsList>
                </div>
            </Tabs>

            <form onSubmit={handleDirectorySubmit(onSubmit, onInvalid)} className="space-y-8">
                {activeTab === 'directory' ? (
                    <DirectoryTab
                        t={t}
                        directoryFields={directoryFields}
                        appendEmployee={appendEmployee}
                        onNextTab={() => setActiveTab('department')}
                    />
                ) : activeTab === 'department' ? (
                    <AssignManagerTab t={t} />
                ) : null}

                {/* Info Alert */}
                <div className="flex items-start gap-4 rounded-xl bg-primary/10 border border-primary/20 p-5">
                    <Info className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-[11px] leading-relaxed text-brand-800 rtl:text-start">
                        {t('info.text')}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8">
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
                        className="flex items-center gap-2 transition-transform hover:-translate-x-1 rtl:translate-x-1 rtl:flex-row-reverse"
                    >
                        <ArrowLeft className="size-4 rtl:rotate-180" />
                        {t('actions.back')}
                    </Button>
                    <Button type="submit" size="lg" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('actions.finishSetup', { defaultValue: 'Finish Setup' })}
                    </Button>
                </div>
            </form>
        </div>
    );
}
