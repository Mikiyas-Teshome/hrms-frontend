/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PersonalInfoTab } from './tabs/personal-info-tab';
import { AddressTab } from './tabs/address-tab';
import { DocumentsTab } from './tabs/documents-tab';
import { BankingTab } from './tabs/banking-tab';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
    Tabs, 
    TabsList, 
    TabsTrigger,
    TabsContent
} from "@/components/ui/tabs";
import { useMyEmployeeProfile, useUpdateEmployee } from '@/features/employee/hooks/useEmployee';
import { useUpdateOnboardingComplete } from '@/features/auth/hooks/useAuth';
import { useCreateBankAccount } from '@/features/bank-account/hooks/useBankAccount';
import { useToast } from '@/hooks/use-toast';
import { 
    phoneValidation, 
    optionalPhoneValidation, 
    futureDateValidation, 
    pastDateValidation, 
    numericValidation,
    ibanValidation,
    swiftValidation
} from '@/lib/validations';

const onboardingSchema = z.object({
    // Personal Info
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    middleName: z.string().optional(),
    gender: z.string().min(1, 'Gender is required'),
    dateOfBirth: pastDateValidation('Date of birth is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    nationality: z.string().min(1, 'Nationality is required'),
    nationalId: z.string().optional(),
    
    // Contact Info
    personalEmail: z.string().email('Invalid email').min(1, 'Email is required'),
    phoneNumber: phoneValidation('Phone number is required'),
    
    // Emergency Contact
    emergencyContactName: z.string().min(1, 'Name is required'),
    emergencyContactRelationship: z.string().min(1, 'Relationship is required'),
    emergencyContactPhone: phoneValidation('Phone number is required'),
    
    // Current Address
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    postalCode: numericValidation('Postal code must be numeric'),

    // Home Address
    homeCountry: z.string().optional(),
    homeState: z.string().optional(),
    homeCity: z.string().optional(),
    homeAddress: z.string().optional(),
    homePostalCode: numericValidation('Postal code must be numeric'),
    homePhone: optionalPhoneValidation('Invalid phone number'),

    // Documents
    passportNumber: z.string().optional(),
    passportExpiry: futureDateValidation('Passport expiry must be in the future'),
    visaNumber: z.string().optional(),
    visaExpiry: futureDateValidation('Visa expiry must be in the future'),
    workPermitNumber: z.string().optional(),
    workPermitExpiry: futureDateValidation('Work permit expiry must be in the future'),
    
    // Bank Info
    bankAccounts: z.array(z.object({
        bankName: z.string().min(1, 'Bank name is required'),
        branchName: z.string().optional(),
        accountName: z.string().min(1, 'Account holder name is required'),
        accountNumber: z.string().min(1, 'Account number is required'),
        iban: ibanValidation('Invalid IBAN'),
        swiftCode: swiftValidation('Invalid SWIFT'),
    })).min(1),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

interface StaffOnboardingFormProps {
    onFinish: () => void;
}

export function StaffOnboardingForm({}: StaffOnboardingFormProps) {
    const { t } = useTranslation(['staffSignup', 'onboarding', 'common']);
    const router = useRouter();
    const { toast } = useToast();
    const [tab, setTab] = useState<'personal' | 'address' | 'documents' | 'banking'>('personal');

    const { data: profile } = useMyEmployeeProfile();
    const updateEmployee = useUpdateEmployee();
    const createBank = useCreateBankAccount();
    const { mutateAsync: updateOnboarding } = useUpdateOnboardingComplete();

    const formatDateForSubmission = (date: string | Date | undefined): string | undefined => {
        if (!date) return undefined;
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            if (isNaN(d.getTime())) return undefined;
            return d.toISOString();
        } catch  {
            return undefined;
        }
    };

    const translatedSchema = useMemo(() => {
        return z.object({
            // Personal Info
            firstName: z.string().min(1, t('onboarding.errors.firstNameRequired')),
            lastName: z.string().min(1, t('onboarding.errors.lastNameRequired')),
            middleName: z.string().optional(),
            gender: z.string().min(1, t('onboarding.errors.genderRequired')),
            dateOfBirth: pastDateValidation(t('onboarding.errors.pastDateRequired')),
            jobTitle: z.string().min(1, t('onboarding.errors.jobTitleRequired')),
            nationality: z.string().min(1, t('onboarding.errors.nationalityRequired')),
            nationalId: z.string().optional(),

            // Contact Info
            personalEmail: z
                .string()
                .email(t('onboarding.errors.emailInvalid'))
                .min(1, t('onboarding.errors.emailRequired')),
            phoneNumber: phoneValidation(t('onboarding.errors.phoneInvalid')),

            // Emergency Contact
            emergencyContactName: z.string().min(1, t('onboarding.errors.contactNameRequired')),
            emergencyContactRelationship: z
                .string()
                .min(1, t('onboarding.errors.relationshipRequired')),
            emergencyContactPhone: phoneValidation(t('onboarding.errors.phoneInvalid')),

            // Current Address
            country: z.string().min(1, t('onboarding.errors.countryRequired')),
            state: z.string().optional(),
            city: z.string().min(1, t('onboarding.errors.cityRequired')),
            address: z.string().min(1, t('onboarding.errors.addressRequired')),
            postalCode: numericValidation(t('onboarding.errors.numbersOnly')),

            // Home Address
            homeCountry: z.string().optional(),
            homeState: z.string().optional(),
            homeCity: z.string().optional(),
            homeAddress: z.string().optional(),
            homePostalCode: numericValidation(t('onboarding.errors.numbersOnly')),
            homePhone: optionalPhoneValidation(t('onboarding.errors.phoneInvalid')),

            // Documents
            passportNumber: z.string().optional(),
            passportExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')),
            visaNumber: z.string().optional(),
            visaExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')),
            workPermitNumber: z.string().optional(),
            workPermitExpiry: futureDateValidation(t('onboarding.errors.futureDateRequired')),

            // Bank Info
            bankAccounts: z
                .array(
                    z.object({
                        bankName: z.string().min(1, t('onboarding.errors.bankNameRequired')),
                        branchName: z.string().optional(),
                        accountName: z.string().min(1, t('onboarding.errors.accountNameRequired')),
                        accountNumber: z
                            .string()
                            .min(1, t('onboarding.errors.accountNumberRequired')),
                        iban: ibanValidation(t('onboarding.errors.ibanInvalid', 'Invalid IBAN')),
                        swiftCode: swiftValidation(
                            t('onboarding.errors.swiftInvalid', 'Invalid SWIFT'),
                        ),
                    }),
                )
                .min(1),
        });
    }, [t]);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        trigger,
        reset,
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



    useEffect(() => {
        if (profile) {
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
                // Emergency Contact
                emergencyContactName: (profile as any).emergencyContactName || '',
                emergencyContactRelationship: profile.emergencyContactRelationship || '',
                emergencyContactPhone: (profile as any).emergencyContactPhone || '',
                // Address
                country: profile.country || 'AE',
                state: profile.state || '',
                city: profile.city || '',
                address: profile.address || '',
                postalCode: profile.postalCode || '',
                // Home Address
                homeCountry: profile.homeCountry || '',
                homeState: profile.homeState || '',
                homeCity: profile.homeCity || '',
                homeAddress: profile.homeAddress || '',
                homePostalCode: profile.homePostalCode || '',
                homePhone: profile.homePhone || '',
                // Documents
                passportNumber: profile.passportNumber || '',
                passportExpiry: profile.passportExpiry ? new Date(profile.passportExpiry) : '',
                visaNumber: profile.visaNumber || '',
                visaExpiry: profile.visaExpiry ? new Date(profile.visaExpiry) : '',
                workPermitNumber: profile.workPermitNumber || '',
                workPermitExpiry: profile.workPermitExpiry
                    ? new Date(profile.workPermitExpiry)
                    : '',
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
        }
    }, [profile, reset]);

    const onSubmit = async (data: OnboardingFormValues) => {
        if (!profile?.id) return;
        try {
            // 1. Update Employee Details
            await updateEmployee.mutateAsync({
                id: profile.id,
                input: {
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
                },
            });

            // 2. Create Bank Accounts
            if (data.bankAccounts && data.bankAccounts.length > 0) {
                for (let i = 0; i < data.bankAccounts.length; i++) {
                    const account = data.bankAccounts[i];
                    await createBank.mutateAsync({
                        employeeId: profile.id,
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

            // 3. Mark Onboarding as Complete
            const res = await updateOnboarding({
                userId: profile.userId!,
                onboardingComplete: true,
            });

            if (res) {
                toast({
                    title: t('onboarding.onboardingCompleted'),
                    description: t('onboarding.profileUpdated'),
                });

                router.push('/employee-success');
            }
        } catch (error: any) {
            console.error('Onboarding submission failed:', error);
            toast({
                title: t('onboarding.operationFailed'),
                description: error.message || t('onboarding.genericError'),
                variant: 'destructive',
            });
        }
    };

    const handleNextTab = async () => {
        let fieldsToValidate: (keyof OnboardingFormValues)[] = [];

        if (tab === 'personal') {
            fieldsToValidate = [
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
        } else if (tab === 'address') {
            fieldsToValidate = [
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
        } else if (tab === 'documents') {
            fieldsToValidate = [
                'passportNumber',
                'passportExpiry',
                'visaNumber',
                'visaExpiry',
                'workPermitNumber',
                'workPermitExpiry',
            ];
        }

        const isValid = await trigger(fieldsToValidate);
        if (isValid) {
            if (tab === 'personal') setTab('address');
            else if (tab === 'address') setTab('documents');
            else if (tab === 'documents') setTab('banking');
        }
    };

    // const tabLabels = {
    //     personal: t('onboarding.personalInfo'),
    //     address: t('onboarding.addressDocs'),
    //     documents: t('onboarding.identityDocuments'),
    //     banking: t('onboarding.bankingInfo'),
    // };

    return (
        <div className="w-full max-w-2xl flex flex-col gap-3">
            <Card className="w-full bg-card border border-border shadow-[0px_32px_64px_-12px_rgba(0,0,0,0.14)] rounded-[12px] flex flex-col p-0 overflow-hidden">
                <CardHeader className="flex flex-col gap-2 p-6 pb-0">
                    <CardTitle className="text-xl font-semibold text-foreground leading-5">
                        {t('onboarding.setupTitle')}
                    </CardTitle>
                    <CardDescription className="text-sm font-normal text-muted-foreground leading-5 m-0">
                        {t('onboarding.setupSubtitle')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col p-6 gap-8">
                    <Tabs
                        value={tab}
                        onValueChange={(v) => setTab(v as any)}
                        className="w-full flex flex-col gap-8"
                    >
                        <TabsList className="flex items-center p-0.75 bg-secondary rounded-[10px] w-full h-9">
                            <TabsTrigger
                                value="personal"
                                className="flex-1 h-7 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-all font-medium text-sm text-foreground border-none outline-none focus-visible:ring-0"
                            >
                                {t('onboarding.personalInfo')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="address"
                                className="flex-1 h-7 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-all font-medium text-sm text-foreground border-none outline-none focus-visible:ring-0"
                            >
                                {t('onboarding.currentResidence')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="documents"
                                className="flex-1 h-7 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-all font-medium text-sm text-foreground border-none outline-none focus-visible:ring-0"
                            >
                                {t('onboarding.identityDocuments')}
                            </TabsTrigger>
                            <TabsTrigger
                                value="banking"
                                className="flex-1 h-7 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-[0px_1px_3px_rgba(0,0,0,0.1)] transition-all font-medium text-sm text-foreground border-none outline-none focus-visible:ring-0"
                            >
                                {t('onboarding.bankingInfo')}
                            </TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
                            <TabsContent
                                value="personal"
                                className="m-0 focus-visible:outline-none flex flex-col gap-8"
                            >
                                <PersonalInfoTab register={register} control={control} errors={errors} onNext={handleNextTab} />
                            </TabsContent>

                            <TabsContent
                                value="address"
                                className="m-0 focus-visible:outline-none flex flex-col gap-8"
                            >
                                <AddressTab register={register} control={control} errors={errors} onNext={handleNextTab} />
                            </TabsContent>

                            <TabsContent
                                value="documents"
                                className="m-0 focus-visible:outline-none flex flex-col gap-8"
                            >
                                <DocumentsTab register={register} control={control} errors={errors} onNext={handleNextTab} />
                            </TabsContent>

                            <TabsContent
                                value="banking"
                                className="m-0 focus-visible:outline-none flex flex-col gap-8"
                            >
                                <BankingTab register={register} control={control} errors={errors} isSubmitting={isSubmitting} isPending={updateEmployee.isPending || createBank.isPending} />
                            </TabsContent>
                        </form>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
