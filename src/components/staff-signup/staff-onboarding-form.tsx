'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PersonalInfoTab } from './tabs/personal-info-tab';
import { AddressTab } from './tabs/address-tab';
import { DocumentsTab } from './tabs/documents-tab';
import { BankingTab } from './tabs/banking-tab';
import {
    DocumentUploadsTab,
    type CategoryUploadState,
} from './tabs/document-uploads-tab';
import { filterOnboardingDocumentCategories } from './utils/onboarding-document-categories';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMyEmployeeProfile, useUpdateMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useProfile, useUpdateOnboardingComplete } from '@/features/auth/hooks/useAuth';
import { useDeferredAvatarUpload } from '@/features/auth/hooks/useDeferredAvatarUpload';
import { useCreateMyBankAccount } from '@/features/bank-account/hooks/useBankAccount';
import { useDocumentCategories } from '@/features/documents/hooks/useDocumentCategories';
import { fetchEmployeeDocuments, uploadEmployeeDocument } from '@/features/documents/documents.actions';
import { useToast } from '@/hooks/use-toast';
import {
    phoneValidation,
    optionalPhoneValidation,
    futureDateValidation,
    pastDateValidation,
    numericValidation,
    ibanValidation,
    swiftValidation,
} from '@/lib/validations';
import { StaffStepIndicator } from '@/components/staff-signup/staff-step-indicator';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
    staffOnboardingStepFromProfileStep,
    staffProfileStepFromOnboardingStep,
} from '@/lib/onboarding/staff-steps';
import { persistStaffOnboardingStep } from '@/lib/onboarding/persist-staff-onboarding-step';
import {
    clearStaffOnboardingStepSession,
    resolveStaffOnboardingStep,
} from '@/lib/onboarding/staff-onboarding-step-storage';
import { useQueryClient } from '@tanstack/react-query';
import { AUTH_PROFILE_QUERY_KEY } from '@/features/auth/auth-session.constants';
import { writeAuthSessionCache } from '@/features/auth/auth-session-cache.util';

export type OnboardingFormValues = {
    firstName: string;
    lastName: string;
    middleName?: string;
    gender: string;
    dateOfBirth: string | Date;
    jobTitle: string;
    nationality: string;
    nationalId?: string;
    personalEmail: string;
    phoneNumber: string;
    emergencyContactName: string;
    emergencyContactRelationship: string;
    emergencyContactPhone: string;
    country: string;
    state?: string;
    city: string;
    address: string;
    postalCode: string;
    homeCountry?: string;
    homeState?: string;
    homeCity?: string;
    homeAddress?: string;
    homePostalCode?: string;
    homePhone?: string;
    passportNumber?: string;
    passportExpiry?: string | Date;
    visaNumber?: string;
    visaExpiry?: string | Date;
    workPermitNumber?: string;
    workPermitExpiry?: string | Date;
    bankAccounts: {
        bankName: string;
        branchName?: string;
        accountName: string;
        accountNumber: string;
        iban?: string;
        swiftCode?: string;
    }[];
};

interface StaffOnboardingFormProps {
    onFinish: () => void;
}

export function StaffOnboardingForm({ onFinish }: StaffOnboardingFormProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);
    const router = useRouter();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { data: authUser } = useProfile();
    const profileStepFromUser = authUser
        ? staffProfileStepFromOnboardingStep(
              resolveStaffOnboardingStep(authUser.id, authUser.onboardingStep),
          )
        : 1;
    const [stepOverride, setStepOverride] = useState<number | null>(null);
    const currentStep = stepOverride ?? profileStepFromUser;
    const [uploadsByCategory, setUploadsByCategory] = useState<
        Record<string, CategoryUploadState>
    >({});
    const [documentValidationErrors, setDocumentValidationErrors] = useState<
        Record<string, string>
    >({});
    const [isUploadingDocuments, setIsUploadingDocuments] = useState(false);

    const { data: profile } = useMyEmployeeProfile();
    const {
        reference: avatarUrl,
        isUploading: isAvatarUploading,
        onFileSelect: onAvatarFileChange,
        onClear: onAvatarClear,
        persistPendingAvatar: uploadPendingAvatar,
    } = useDeferredAvatarUpload(authUser?.avatarUrl ?? profile?.avatarUrl ?? null);
    const {
        data: documentCategories = [],
        isLoading: isCategoriesLoading,
        isError: isCategoriesError,
        refetch: refetchDocumentCategories,
    } = useDocumentCategories({ enabled: Boolean(profile?.id) });
    const updateEmployee = useUpdateMyEmployeeProfile();
    const createBank = useCreateMyBankAccount();
    const { mutateAsync: updateOnboarding } = useUpdateOnboardingComplete();

    const persistProfileStep = useCallback(
        async (profileStep: number) => {
            if (!authUser?.id) {
                return;
            }
            const onboardingStep = staffOnboardingStepFromProfileStep(profileStep);
            const result = await persistStaffOnboardingStep(authUser.id, onboardingStep);
            if (result.user) {
                queryClient.setQueryData(AUTH_PROFILE_QUERY_KEY, result.user);
                writeAuthSessionCache(result.user);
            }
            setStepOverride(profileStep);
        },
        [authUser, queryClient],
    );

    const stepMeta = useMemo(
        () => [
            {
                title: t('staffSignup:onboarding.stepPersonalTitle'),
                subtitle: t('staffSignup:onboarding.stepPersonalSubtitle'),
            },
            {
                title: t('staffSignup:onboarding.stepAddressTitle'),
                subtitle: t('staffSignup:onboarding.stepAddressSubtitle'),
            },
            {
                title: t('staffSignup:onboarding.stepDocumentsTitle'),
                subtitle: t('staffSignup:onboarding.stepDocumentsSubtitle'),
            },
            {
                title: t('staffSignup:onboarding.stepBankingTitle'),
                subtitle: t('staffSignup:onboarding.stepBankingSubtitle'),
            },
            {
                title: t('staffSignup:onboarding.stepDocumentUploadsTitle'),
                subtitle: t('staffSignup:onboarding.stepDocumentUploadsSubtitle'),
            },
        ],
        [t],
    );

    const formatDateForSubmission = (date: string | Date | undefined): string | undefined => {
        if (!date) return undefined;
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(d.getTime())) return undefined;
            return d.toISOString();
        } catch {
            return undefined;
        }
    };

    const translatedSchema = useMemo(() => {
        return z.object({
            firstName: z.string().min(1, t('onboarding.errors.firstNameRequired')),
            lastName: z.string().min(1, t('onboarding.errors.lastNameRequired')),
            middleName: z.string().optional(),
            gender: z.string().min(1, t('onboarding.errors.genderRequired')),
            dateOfBirth: pastDateValidation(t('onboarding.errors.pastDateRequired')),
            jobTitle: z.string().min(1, t('onboarding.errors.jobTitleRequired')),
            nationality: z.string().min(1, t('onboarding.errors.nationalityRequired')),
            nationalId: z.string().optional(),
            personalEmail: z
                .string()
                .email(t('onboarding.errors.emailInvalid'))
                .min(1, t('onboarding.errors.emailRequired')),
            phoneNumber: phoneValidation(t('onboarding.errors.phoneInvalid')),
            emergencyContactName: z.string().min(1, t('onboarding.errors.contactNameRequired')),
            emergencyContactRelationship: z
                .string()
                .min(1, t('onboarding.errors.relationshipRequired')),
            emergencyContactPhone: phoneValidation(t('onboarding.errors.phoneInvalid')),
            country: z.string().min(1, t('onboarding.errors.countryRequired')),
            state: z.string().optional(),
            city: z.string().min(1, t('onboarding.errors.cityRequired')),
            address: z.string().min(1, t('onboarding.errors.addressRequired')),
            postalCode: numericValidation(t('onboarding.errors.numbersOnly')),
            homeCountry: z.string().optional(),
            homeState: z.string().optional(),
            homeCity: z.string().optional(),
            homeAddress: z.string().optional(),
            homePostalCode: numericValidation(t('onboarding.errors.numbersOnly')).optional(),
            homePhone: optionalPhoneValidation(t('onboarding.errors.phoneInvalid')),
            passportNumber: z.string().optional(),
            passportExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')).optional(),
            visaNumber: z.string().optional(),
            visaExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')).optional(),
            workPermitNumber: z.string().optional(),
            workPermitExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')).optional(),
            bankAccounts: z
                .array(
                    z.object({
                        bankName: z.string().min(1, t('onboarding.errors.bankNameRequired')),
                        branchName: z.string().optional(),
                        accountName: z.string().min(1, t('onboarding.errors.accountNameRequired')),
                        accountNumber: z
                            .string()
                            .min(1, t('onboarding.errors.accountNumberRequired')),
                        iban: ibanValidation(t('onboarding.errors.ibanInvalid', 'Invalid IBAN')).optional(),
                        swiftCode: swiftValidation(
                            t('onboarding.errors.swiftInvalid', 'Invalid SWIFT'),
                        ).optional(),
                    }),
                )
                .min(1),
        });
    }, [t]);

    const {
        register,
        control,
        formState: { errors },
        trigger,
        reset,
        watch,
    } = useForm<OnboardingFormValues>({
        resolver: zodResolver(translatedSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            middleName: '',
            gender: '',
            dateOfBirth: '',
            nationality: '',
            nationalId: '',
            personalEmail: '',
            phoneNumber: '',
            emergencyContactName: '',
            emergencyContactRelationship: '',
            emergencyContactPhone: '',
            country: 'AE',
            state: '',
            city: '',
            address: '',
            postalCode: '',
            homeCountry: '',
            homeState: '',
            homeCity: '',
            homeAddress: '',
            homePostalCode: '',
            homePhone: '',
            passportNumber: '',
            passportExpiry: '',
            visaNumber: '',
            visaExpiry: '',
            workPermitNumber: '',
            workPermitExpiry: '',
            bankAccounts: [
                {
                    bankName: '',
                    branchName: '',
                    accountName: '',
                    accountNumber: '',
                    iban: '',
                    swiftCode: '',
                },
            ],
        },
    });

    const watchedNationality = watch('nationality');
    const watchedCountry = watch('country');

    const applicableCategories = useMemo(() => {
        return filterOnboardingDocumentCategories(documentCategories, {
            nationality: watchedNationality || profile?.nationality,
            residenceCountry: watchedCountry || profile?.country,
            departmentOuId: profile?.orgUnit?.orgUnitId ?? profile?.companyOuId,
        });
    }, [
        documentCategories,
        watchedNationality,
        watchedCountry,
        profile?.nationality,
        profile?.country,
        profile?.orgUnit?.orgUnitId,
        profile?.companyOuId,
    ]);

    const categoriesResolved = !isCategoriesLoading && !isCategoriesError;
    const hasDocumentUploadStep = categoriesResolved && applicableCategories.length > 0;
    const totalSteps = categoriesResolved ? (hasDocumentUploadStep ? 5 : 4) : 5;
    const resolvedCurrentStep = Math.min(Math.max(1, currentStep), totalSteps);

    useEffect(() => {
        if (!categoriesResolved || currentStep <= totalSteps) {
            return;
        }
        void persistProfileStep(totalSteps);
    }, [categoriesResolved, currentStep, totalSteps, persistProfileStep]);

    useEffect(() => {
        if (!profile) {
            return;
        }

        reset({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            middleName: profile.middleName || '',
            gender: profile.gender || '',
            dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : '',
            jobTitle: profile.jobTitle || '',
            nationality: profile.nationality || '',
            nationalId: profile.nationalId || '',
            personalEmail: profile.personalEmail || profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            emergencyContactName: (profile as { emergencyContactName?: string }).emergencyContactName || '',
            emergencyContactRelationship: profile.emergencyContactRelationship || '',
            emergencyContactPhone: (profile as { emergencyContactPhone?: string }).emergencyContactPhone || '',
            country: profile.country || 'AE',
            state: profile.state || '',
            city: profile.city || '',
            address: profile.address || '',
            postalCode: profile.postalCode || '',
            homeCountry: profile.homeCountry || '',
            homeState: profile.homeState || '',
            homeCity: profile.homeCity || '',
            homeAddress: profile.homeAddress || '',
            homePostalCode: profile.homePostalCode || '',
            homePhone: profile.homePhone || '',
            passportNumber: profile.passportNumber || '',
            passportExpiry: profile.passportExpiry ? new Date(profile.passportExpiry) : '',
            visaNumber: profile.visaNumber || '',
            visaExpiry: profile.visaExpiry ? new Date(profile.visaExpiry) : '',
            workPermitNumber: profile.workPermitNumber || '',
            workPermitExpiry: profile.workPermitExpiry ? new Date(profile.workPermitExpiry) : '',
            bankAccounts: [
                {
                    bankName: '',
                    branchName: '',
                    accountName: '',
                    accountNumber: '',
                    iban: '',
                    swiftCode: '',
                },
            ],
        });
    }, [profile, reset]);

    useEffect(() => {
        if (currentStep === 5 && categoriesResolved && !hasDocumentUploadStep) {
            void persistProfileStep(4);
        }
    }, [currentStep, categoriesResolved, hasDocumentUploadStep, persistProfileStep]);

    useEffect(() => {
        if (resolvedCurrentStep !== 5 || !profile?.id) {
            return;
        }

        let isMounted = true;

        const loadExistingDocuments = async () => {
            const result = await fetchEmployeeDocuments({
                pagination: { page: 1, size: 100 },
                filter: { ownerId: profile.id },
            });

            if (!isMounted) {
                return;
            }

            const nextUploads: Record<string, CategoryUploadState> = {};
            for (const document of result.data) {
                nextUploads[document.categoryId] = {
                    file: null,
                    expiryDate: document.expiryDate
                        ? document.expiryDate.slice(0, 10)
                        : '',
                    uploadedDocumentId: document.id,
                    uploadedFileName: document.documentName,
                };
            }
            setUploadsByCategory((prev) => ({ ...nextUploads, ...prev }));
        };

        void loadExistingDocuments();

        return () => {
            isMounted = false;
        };
    }, [resolvedCurrentStep, profile?.id]);

    const validateDocumentUploads = (): boolean => {
        const errors: Record<string, string> = {};

        for (const category of applicableCategories) {
            const upload = uploadsByCategory[category.id];
            const hasUpload = Boolean(upload?.file || upload?.uploadedDocumentId);

            if (category.required && !hasUpload) {
                errors[category.id] = t(
                    'staffSignup:onboarding.documentUploads.errors.required',
                    { category: category.name },
                );
                continue;
            }

            if (category.expiryRequired && hasUpload && !upload?.expiryDate) {
                errors[category.id] = t(
                    'staffSignup:onboarding.documentUploads.errors.expiryRequired',
                );
            }
        }

        setDocumentValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast({
                title: t('staffSignup:onboarding.operationFailed'),
                description: t('staffSignup:onboarding.documentUploads.errors.incomplete'),
                variant: 'destructive',
            });
            return false;
        }

        return true;
    };

    const uploadPendingDocuments = async (employeeId: string) => {
        for (const category of applicableCategories) {
            const upload = uploadsByCategory[category.id];
            if (!upload?.file || upload.uploadedDocumentId) {
                continue;
            }

            const formData = new FormData();
            formData.append('file', upload.file);
            formData.append('categoryId', category.id);
            formData.append('ownerId', employeeId);
            if (upload.expiryDate) {
                formData.append('expiryDate', upload.expiryDate);
            }

            const result = await uploadEmployeeDocument(formData);
            if (!result.success) {
                throw new Error(result.error);
            }
        }
    };

    const uploadPendingAvatarIfNeeded = async () => {
        await uploadPendingAvatar();
    };

    const handleFinish = async () => {
        if (!profile?.id || resolvedCurrentStep !== totalSteps) {
            return;
        }

        const isValid = await trigger();
        if (!isValid) {
            return;
        }

        const data = watch();

        if (isCategoriesError) {
            toast({
                title: t('staffSignup:onboarding.operationFailed'),
                description: t('staffSignup:onboarding.documentUploads.loadError'),
                variant: 'destructive',
            });
            void refetchDocumentCategories();
            return;
        }

        if (hasDocumentUploadStep && !validateDocumentUploads()) {
            return;
        }

        try {
            setIsUploadingDocuments(true);
            await uploadPendingAvatarIfNeeded();
            await updateEmployee.mutateAsync({
                firstName: data.firstName,
                lastName: data.lastName,
                middleName: data.middleName || undefined,
                phoneNumber: data.phoneNumber,
                personalEmail: data.personalEmail.toLowerCase(),
                gender: data.gender,
                dateOfBirth: formatDateForSubmission(data.dateOfBirth),
                jobTitle: data.jobTitle,
                nationality: data.nationality,
                nationalId: data.nationalId || undefined,
                address: data.address,
                city: data.city,
                state: data.state || undefined,
                country: data.country,
                postalCode: data.postalCode || undefined,
                homeAddress: data.homeAddress || undefined,
                homeCity: data.homeCity || undefined,
                homeCountry: data.homeCountry || undefined,
                homePostalCode: data.homePostalCode || undefined,
                homeState: data.homeState || undefined,
                homePhone: data.homePhone || undefined,
                emergencyContactName: data.emergencyContactName,
                emergencyContactRelationship: data.emergencyContactRelationship,
                emergencyContactPhone: data.emergencyContactPhone,
                passportNumber: data.passportNumber || undefined,
                passportExpiry: formatDateForSubmission(data.passportExpiry),
                visaNumber: data.visaNumber || undefined,
                visaExpiry: formatDateForSubmission(data.visaExpiry),
                workPermitNumber: data.workPermitNumber || undefined,
                workPermitExpiry: formatDateForSubmission(data.workPermitExpiry),
            });

            if (data.bankAccounts && data.bankAccounts.length > 0) {
                for (let i = 0; i < data.bankAccounts.length; i++) {
                    const account = data.bankAccounts[i];
                    await createBank.mutateAsync({
                        bankName: account.bankName,
                        branchName: account.branchName || undefined,
                        accountName: account.accountName,
                        accountNumber: account.accountNumber,
                        iban: account.iban || undefined,
                        swiftCode: account.swiftCode || undefined,
                        isPrimary: i === 0,
                    });
                }
            }

            if (hasDocumentUploadStep) {
                await uploadPendingDocuments(profile.id);
            }

            const res = await updateOnboarding({
                userId: profile.userId!,
                onboardingComplete: true,
            });

            if (res) {
                if (profile.userId) {
                    clearStaffOnboardingStepSession(profile.userId);
                }
                toast({
                    title: t('onboarding.onboardingCompleted'),
                    description: t('onboarding.profileUpdated'),
                });
                if (onFinish) {
                    onFinish();
                } else {
                    router.push('/employee-success');
                }
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('onboarding.genericError');
            toast({
                title: t('onboarding.operationFailed'),
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsUploadingDocuments(false);
        }
    };

    const getFieldsForStep = (step: number): (keyof OnboardingFormValues)[] => {
        if (step === 1) {
            return [
                'firstName',
                'lastName',
                'gender',
                'dateOfBirth',
                'jobTitle',
                'nationality',
                'personalEmail',
                'phoneNumber',
                'emergencyContactName',
                'emergencyContactRelationship',
                'emergencyContactPhone',
            ];
        }
        if (step === 2) {
            return [
                'country',
                'city',
                'address',
                'postalCode',
                'homeCountry',
                'homeCity',
                'homeAddress',
                'homePostalCode',
                'homePhone',
            ];
        }
        if (step === 3) {
            return [
                'passportNumber',
                'passportExpiry',
                'visaNumber',
                'visaExpiry',
                'workPermitNumber',
                'workPermitExpiry',
            ];
        }
        return ['bankAccounts'];
    };

    const handleNextStep = async () => {
        const isValid = await trigger(getFieldsForStep(resolvedCurrentStep));
        if (!isValid || resolvedCurrentStep >= totalSteps) {
            return;
        }

        if (resolvedCurrentStep === 4) {
            if (isCategoriesLoading) {
                return;
            }
            if (isCategoriesError) {
                toast({
                    title: t('staffSignup:onboarding.operationFailed'),
                    description: t('staffSignup:onboarding.documentUploads.loadError'),
                    variant: 'destructive',
                });
                void refetchDocumentCategories();
                return;
            }
            if (!hasDocumentUploadStep) {
                return;
            }
        }

        await persistProfileStep(resolvedCurrentStep + 1);
    };

    const handlePreviousStep = async () => {
        if (resolvedCurrentStep > 1) {
            await persistProfileStep(resolvedCurrentStep - 1);
        }
    };

    const activeStep = stepMeta[resolvedCurrentStep - 1];
    const isSaving =
        updateEmployee.isPending ||
        isAvatarUploading ||
        createBank.isPending ||
        isUploadingDocuments;

    const handleCategoryUploadChange = (categoryId: string, state: CategoryUploadState) => {
        setUploadsByCategory((prev) => ({
            ...prev,
            [categoryId]: state,
        }));
        setDocumentValidationErrors((prev) => {
            if (!prev[categoryId]) {
                return prev;
            }
            const next = { ...prev };
            delete next[categoryId];
            return next;
        });
    };

    const handleFileValidationError = (categoryId: string, error: string | null) => {
        setDocumentValidationErrors((prev) => {
            if (!error) {
                if (!prev[categoryId]) {
                    return prev;
                }
                const next = { ...prev };
                delete next[categoryId];
                return next;
            }
            return { ...prev, [categoryId]: error };
        });
    };

    return (
        <div className="flex w-full max-w-3xl flex-col gap-3">
            <Card className="flex w-full flex-col overflow-hidden rounded-[12px] border border-border bg-card p-0 shadow-sm">
                <CardHeader className="flex flex-col gap-4 p-4 pb-0 sm:p-6">
                    <StaffStepIndicator currentStep={resolvedCurrentStep} totalSteps={totalSteps} />
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-xl font-semibold leading-5 text-foreground">
                            {activeStep.title}
                        </CardTitle>
                        <CardDescription className="m-0 text-sm leading-5 text-muted-foreground">
                            {activeStep.subtitle}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-6 p-4 sm:gap-8 sm:p-6">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && resolvedCurrentStep !== totalSteps) {
                                event.preventDefault();
                            }
                        }}
                        className="flex flex-col gap-6 sm:gap-8"
                    >
                        {resolvedCurrentStep === 1 && (
                            <PersonalInfoTab
                                register={register}
                                control={control}
                                errors={errors}
                                avatarUrl={avatarUrl}
                                onAvatarFileChange={onAvatarFileChange}
                                onAvatarClear={onAvatarClear}
                                isAvatarUploading={isAvatarUploading}
                            />
                        )}
                        {resolvedCurrentStep === 2 && (
                            <AddressTab register={register} control={control} errors={errors} />
                        )}
                        {resolvedCurrentStep === 3 && (
                            <DocumentsTab register={register} control={control} errors={errors} />
                        )}
                        {resolvedCurrentStep === 4 && (
                            <BankingTab register={register} control={control} errors={errors} />
                        )}
                        {resolvedCurrentStep === 5 && hasDocumentUploadStep && (
                            <DocumentUploadsTab
                                categories={applicableCategories}
                                uploadsByCategory={uploadsByCategory}
                                onUploadChange={handleCategoryUploadChange}
                                onFileValidationError={handleFileValidationError}
                                isLoadingCategories={isCategoriesLoading}
                                isCategoriesError={isCategoriesError}
                                onRetryCategories={() => void refetchDocumentCategories()}
                                validationErrors={documentValidationErrors}
                            />
                        )}

                        <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                            {resolvedCurrentStep > 1 ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handlePreviousStep}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="size-4 rtl:rotate-180" />
                                    {t('staffSignup:onboarding.back')}
                                </Button>
                            ) : (
                                <span className="hidden sm:block" />
                            )}

                            {resolvedCurrentStep < totalSteps ? (
                                <Button
                                    type="button"
                                    onClick={handleNextStep}
                                    disabled={resolvedCurrentStep === 4 && isCategoriesLoading}
                                    className="h-9 w-full sm:w-auto"
                                >
                                    {resolvedCurrentStep === 4 && isCategoriesLoading ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : null}
                                    {t('staffSignup:onboarding.continue')}
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => void handleFinish()}
                                    disabled={isSaving}
                                    className="h-9 w-full sm:w-auto"
                                >
                                    {isSaving ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : null}
                                    {t('staffSignup:onboarding.finishSetup')}
                                </Button>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
