'use client';

import React from 'react';
import { format } from 'date-fns';
import { 
    PencilLine, 
    Briefcase, 
    Calendar, 
    Loader2, 
    CircleX,
    Plus,
    Upload,
    MoreVertical,
    FileText,
    File
} from 'lucide-react';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';
import { useBankAccounts } from '@/features/bank-account/hooks/useBankAccount';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { EmployeeResponse } from '@/features/employee/employee.types';

function GridInfo({ label, value }: { label: string; value: React.ReactNode }) {
    const { i18n } = useTranslation();
    const isRtl = i18n.dir() === 'rtl';
    return (
        <div className="flex items-start">
            <span
                className={`text-sm text-muted-foreground w-45 shrink-0 ${isRtl ? 'text-right ml-4' : 'text-left mr-4'}`}
            >
                {label}
            </span>
            <span
                className={`text-sm font-medium text-foreground ${isRtl ? 'text-right' : 'text-left'}`}
            >
                {value || '—'}
            </span>
        </div>
    );
}

export default function MyProfileView({ employeeId }: { employeeId: string }) {
    const { t, i18n } = useTranslation('dashboard');
    const { user } = useAuth();
    const { isTenantSuperAdmin } = usePermissions();
    const isRtl = i18n.dir() === 'rtl';

    // If super admin, we use the user from auth context (which comes from getProfile)
    // Otherwise, we use the my employee profile endpoint
    const { data: myEmployee, isLoading: isMyEmployeeLoading } = useMyEmployeeProfile();
    const { data: bankAccounts, isLoading: bankLoading } = useBankAccounts(employeeId);

    const isLoading = isMyEmployeeLoading;

    // Determine which source to use for the profile
    // We map UserResponse to a partial EmployeeResponse if it's a super admin
    const employee: EmployeeResponse | null = React.useMemo(() => {
        if (isTenantSuperAdmin && user) {
            return {
                id: user.id,
                userId: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                jobTitle: user.position || 'Tenant Super Admin',
                status: user.status,
                // Add other fields as needed or defaults
            } as EmployeeResponse;
        }
        return myEmployee ?? null;
    }, [isTenantSuperAdmin, user, myEmployee]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] w-full">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] w-full gap-4 text-muted-foreground">
                <CircleX className="w-12 h-12 text-destructive/50" />
                <p>Profile not found.</p>
            </div>
        );
    }

    const fullName = `${employee.firstName}${employee.middleName ? ` ${employee.middleName}` : ''} ${employee.lastName}`;
    const isActive = employee.status?.toLowerCase() === 'active';

    let durationLabel = '-';
    if (employee.hireDate) {
        const ms = Date.now() - new Date(employee.hireDate).getTime();
        const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        if (years > 0) {
            durationLabel = `${years}.${Math.floor((months/12)*10)} years`;
        } else if (months > 0) {
            durationLabel = `${months} months`;
        } else {
            durationLabel = '< 1 month';
        }
    }

    const formatEmploymentType = (type?: string | null) => {
        if (!type) return null;
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const tabs = [
        { id: 'personal', label: t('profile.personal_info') },
        { id: 'employment', label: t('profile.employment_details') },
        { id: 'documents', label: t('profile.document_center') },
        { id: 'banking', label: t('profile.banking_details') },
    ];

    const displayTabs = isRtl ? [...tabs].reverse() : tabs;

    const renderGridItems = (items: React.ReactNode[]) => {
        if (!isRtl) return items;
        // For RTL, we reverse the pairs in each row to keep visual order similar to design but RTL
        const reversed = [];
        for (let i = 0; i < items.length; i += 2) {
            if (i + 1 < items.length) {
                reversed.push(items[i + 1]);
                reversed.push(items[i]);
            } else {
                reversed.push(items[i]);
            }
        }
        return reversed;
    };

    return (
        <div
            className="flex flex-col w-full bg-card rounded-xl border border-border shadow-sm min-h-150 mb-8"
            dir={isRtl ? 'rtl' : 'ltr'}
        >
            {/* Header */}
            <div className="flex items-start justify-between p-8 pb-2">
                <div className="flex gap-6 items-center">
                    <Avatar className="h-15 w-15">
                        <AvatarImage src={''} />
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {employee.firstName?.[0]}
                            {employee.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-medium text-foreground m-0">{fullName}</h1>
                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 border border-green-500 rounded-full">
                                <div
                                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                                />
                                <span className="text-xs font-medium text-green-500 capitalize">
                                    {isActive ? t('profile.active') : employee.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{employee.jobTitle || t('profile.role')}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>
                                    {t('profile.joined')}{' '}
                                    {employee.hireDate
                                        ? format(new Date(employee.hireDate), 'MMM yyyy')
                                        : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                    <Button className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 shadow-sm h-9">
                        <PencilLine className="w-4 h-4 mr-2" />
                        {t('profile.edit_info')}
                    </Button>
                    <span className="text-xs text-muted-foreground mt-2">
                        {t('profile.employment_duration')}:{' '}
                        <span className="font-semibold text-foreground">{durationLabel}</span>
                    </span>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="w-full">
                <div className="px-8">
                    <TabsList
                        variant="line"
                        className="h-8 p-0 gap-2 justify-start w-full border-b border-border"
                    >
                        {displayTabs.map((tab) => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex-none h-8 px-4 pb-2 text-sm font-normal text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:font-medium after:bg-primary after:-bottom-px after:h-0.5 after:z-10"
                            >
                                {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="p-8">
                    <TabsContent value="personal" className="mt-0 outline-none">
                        <div className="flex flex-col gap-10 max-w-5xl">
                            {/* Personal Info */}
                            <div className="flex flex-col gap-6">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.personal_info')}
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems([
                                        <GridInfo
                                            key="fn"
                                            label={t('profile.first_name')}
                                            value={employee.firstName}
                                        />,
                                        <GridInfo
                                            key="ln"
                                            label={t('profile.last_name')}
                                            value={employee.lastName}
                                        />,
                                        <GridInfo
                                            key="role"
                                            label={t('profile.role')}
                                            value={employee.jobTitle}
                                        />,
                                        <GridInfo
                                            key="co"
                                            label={t('profile.country_of_origin')}
                                            value={employee.nationality}
                                        />,
                                        <GridInfo
                                            key="cr"
                                            label={t('profile.country_of_residence')}
                                            value={employee.country}
                                        />,
                                    ])}
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-col gap-6">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.contact_info')}
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems([
                                        <GridInfo
                                            key="pe"
                                            label={t('profile.personal_email')}
                                            value={employee.personalEmail}
                                        />,
                                        <GridInfo
                                            key="ce"
                                            label={t('profile.company_email')}
                                            value={employee.businessEmail || employee.email}
                                        />,
                                        <GridInfo
                                            key="pn"
                                            label={t('profile.phone_number')}
                                            value={employee.phoneNumber}
                                        />,
                                        <GridInfo
                                            key="ec"
                                            label={t('profile.emergency_contact')}
                                            value={null}
                                        />,
                                    ])}
                                </div>
                            </div>

                            {/* Home address */}
                            <div className="flex flex-col gap-4">
                                <span className="text-sm text-muted-foreground">
                                    {t('profile.home_address')}
                                </span>
                                <div className="p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground border border-border/50">
                                    {employee.homeAddress ||
                                        employee.address ||
                                        '199 Oakway Lane, Woodland Hills, CA 91303'}
                                    {employee.city ? `, ${employee.city}` : ''}
                                    {employee.state ? `, ${employee.state}` : ''}
                                    {employee.postalCode ? `, ${employee.postalCode}` : ''}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="employment" className="mt-0 outline-none">
                        <div className="flex flex-col gap-8 max-w-5xl">
                            <div className="flex flex-col gap-6">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.employment_details')}
                                </h3>
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems([
                                        <div key="manager" className="flex items-start">
                                            <span
                                                className={`text-sm text-muted-foreground w-45 shrink-0 ${isRtl ? 'text-right ml-4' : 'text-left mr-4'}`}
                                            >
                                                {t('profile.reporting_manager')}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarFallback className="text-[10px] bg-amber-100 text-amber-700">
                                                        M
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-foreground">
                                                    {employee.managerId || 'Kathy Pacheco'}
                                                </span>
                                            </div>
                                        </div>,
                                        <GridInfo
                                            key="jc"
                                            label={t('profile.job_classification')}
                                            value={
                                                formatEmploymentType(employee.employmentType) ||
                                                'Full-time permanent'
                                            }
                                        />,
                                        <GridInfo
                                            key="jo"
                                            label={t('profile.joined_on')}
                                            value={
                                                employee.hireDate
                                                    ? format(
                                                          new Date(employee.hireDate),
                                                          'MMM dd, yyyy',
                                                      )
                                                    : 'Oct 25, 2021'
                                            }
                                        />,
                                        <GridInfo
                                            key="ed"
                                            label={t('profile.employment_duration')}
                                            value={durationLabel}
                                        />,
                                        <div key="status" className="flex items-start">
                                            <span
                                                className={`text-sm text-muted-foreground w-45 shrink-0 ${isRtl ? 'text-right ml-4' : 'text-left mr-4'}`}
                                            >
                                                {t('profile.status')}
                                            </span>
                                            <div className="flex items-center gap-1.5 px-2.5 py-0.5 border border-green-500 rounded-full w-fit">
                                                <div
                                                    className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                                                />
                                                <span className="text-xs font-medium text-green-500 capitalize">
                                                    {isActive
                                                        ? t('profile.active')
                                                        : employee.status}
                                                </span>
                                            </div>
                                        </div>,
                                        <GridInfo
                                            key="wa"
                                            label={t('profile.work_authorization')}
                                            value={
                                                employee.visaNumber
                                                    ? 'Visa holder'
                                                    : 'UAE (No visa required)'
                                            }
                                        />,
                                    ])}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-0 outline-none">
                        <div className="flex flex-col gap-6 w-full">
                            <div className="flex items-center justify-between w-full">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.documents')}
                                </h3>
                                <Button
                                    variant="outline"
                                    className="border-brand-600 text-brand-600 hover:bg-brand-50"
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    {t('profile.add_document')}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Sample Document Cards */}
                                {[
                                    {
                                        title: 'Employment Contract',
                                        updated: 'Updated 3 months ago',
                                        type: 'pdf',
                                    },
                                    {
                                        title: 'NDA agreement',
                                        updated: 'Updated 1 months ago',
                                        type: 'doc',
                                    },
                                    {
                                        title: 'Employment Contract',
                                        updated: 'Updated 3 months ago',
                                        type: 'pdf',
                                    },
                                    {
                                        title: 'Employment Contract',
                                        updated: 'Updated 3 months ago',
                                        type: 'pdf',
                                    },
                                ].map((doc, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-4 bg-background border border-border shadow-sm rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            {doc.type === 'pdf' ? (
                                                <div className="flex items-center justify-center p-2 bg-red-50 rounded-lg">
                                                    <FileText className="w-6 h-6 text-red-500" />
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center p-2 bg-blue-50 rounded-lg">
                                                    <File className="w-6 h-6 text-blue-500" />
                                                </div>
                                            )}
                                            <div className="flex flex-col gap-0.5">
                                                <span className="text-sm font-medium text-foreground">
                                                    {doc.title}
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {t('profile.updated', {
                                                        time: doc.updated.replace('Updated ', ''),
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="banking" className="mt-0 outline-none">
                        <div className="flex flex-col gap-8 w-full">
                            <div className="flex items-center justify-between w-full">
                                <h3 className="font-medium text-base text-foreground">
                                    {t('profile.bank_details')}
                                </h3>
                                <Button
                                    variant="outline"
                                    className="border-brand-600 text-brand-600 hover:bg-brand-50"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('profile.add_another_bank')}
                                </Button>
                            </div>

                            {bankLoading ? (
                                <div className="flex items-center py-8">
                                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                </div>
                            ) : bankAccounts && bankAccounts.length > 0 ? (
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems(
                                        [
                                            <GridInfo
                                                key="bn"
                                                label={t('profile.bank_name')}
                                                value={bankAccounts[0].bankName}
                                            />,
                                            <GridInfo
                                                key="br"
                                                label={t('profile.branch')}
                                                value={bankAccounts[0].branchName || '—'}
                                            />,
                                            <GridInfo
                                                key="noa"
                                                label={t('profile.name_on_account')}
                                                value={bankAccounts[0].accountName}
                                            />,
                                            <GridInfo
                                                key="an"
                                                label={t('profile.account_number')}
                                                value={bankAccounts[0].accountNumber}
                                            />,
                                            bankAccounts[0].swiftCode ? (
                                                <GridInfo
                                                    key="sc"
                                                    label={t('profile.swift_bic_code')}
                                                    value={bankAccounts[0].swiftCode}
                                                />
                                            ) : null,
                                        ].filter(Boolean),
                                    )}
                                </div>
                            ) : (
                                /* Mock data matching the design if no bank accounts exist for this user */
                                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                    {renderGridItems([
                                        <GridInfo
                                            key="bn-mock"
                                            label={t('profile.bank_name')}
                                            value="Center bank"
                                        />,
                                        <GridInfo
                                            key="br-mock"
                                            label={t('profile.branch')}
                                            value="Dubai branch"
                                        />,
                                        <GridInfo
                                            key="noa-mock"
                                            label={t('profile.name_on_account')}
                                            value={fullName}
                                        />,
                                        <GridInfo
                                            key="an-mock"
                                            label={t('profile.account_number')}
                                            value="1232353464574"
                                        />,
                                        <GridInfo
                                            key="sc-mock"
                                            label={t('profile.swift_bic_code')}
                                            value="DUB12AS"
                                        />,
                                    ])}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
