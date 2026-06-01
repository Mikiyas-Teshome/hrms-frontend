'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { teamSetupSchema, type TeamSetupValues } from '@/components/onboarding/schemas/team-setup';
import { useState } from 'react';
import { DirectoryTab } from '@/components/onboarding/team/tabs/directory-tab';
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
            <form onSubmit={handleDirectorySubmit(onSubmit, onInvalid)} className="space-y-8">
                <DirectoryTab
                    t={t}
                    directoryFields={directoryFields}
                    appendEmployee={appendEmployee}
                />

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
