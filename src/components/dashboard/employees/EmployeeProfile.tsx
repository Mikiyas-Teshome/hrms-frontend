'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    ArrowRight,
    CircleCheck,
    PencilLine,
    Clock,
    CalendarDays,
    Loader2,
    Building2,
    CreditCard,
    FileText,
    Star,
    MapPin,
    Phone,
    Mail,
} from 'lucide-react';
import { useEmployee, useEmployees } from '@/features/employee/hooks/useEmployee';
import { useBankAccounts } from '@/features/bank-account/hooks/useBankAccount';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useEmployeeContracts } from '@/features/contracts/hooks/useEmployeeContracts';
import { useDisplayCurrency } from '@/features/settings/hooks/useDisplayCurrency';
import { useEmployeeSalaryStructure } from '@/features/payroll/salary-structure/hooks/useSalaryStructure';
import { useEmployeeDocumentsPaged } from '@/features/documents/hooks/useEmployeeDocuments';
import { fetchDocumentCategories } from '@/features/documents/documents.actions';
import {
    getDocumentComplianceLabels,
    resolveDocumentComplianceMeta,
} from '@/features/documents/document-compliance-display.util';
import { ContractDocumentPreviewButton } from '@/components/dashboard/contracts/ContractDocumentPreviewButton';
import {
    DocumentApprovalState,
    DocumentCategory,
    DocumentComplianceStatus,
    EmployeeDocumentRow,
} from '@/features/documents/documents.types';
import EmployeeDocumentDetailSheet from '@/components/dashboard/documents/EmployeeDocumentDetailSheet';
import { Badge } from '@/components/ui/badge';
import { SecureAvatar } from '@/components/common/secure-avatar';
import { formatDateString } from '@/lib/date-utils';
import { formatIntlCurrency, getCurrencySymbol } from '@/lib/currency';
import { resolveEmployeeCompensationCurrency } from '@/features/employee/employee-display.utils';
import EditEmployeeSheet from './EditEmployeeSheet';
import UpdateEmployeeContractSheet from './UpdateEmployeeContractSheet';
import { ProfilePageNotFound } from '@/components/dashboard/shared/profile-page-states';
import EmployeeProfileSkeleton from './EmployeeProfileSkeleton';
import { format } from 'date-fns';

const LIFECYCLE_STAGES = [
    { key: 'onboarding',  color: '#136DEC', statuses: ['invited', 'onboarding'] },
    { key: 'active',      color: '#3DE483', statuses: ['active'] },
    { key: 'onLeave',     color: '#FFE100', statuses: ['onleave', 'on-leave'] },
    { key: 'offBoarding', color: '#D97706', statuses: ['offboarding', 'off-boarding'] },
    { key: 'inactive',    color: '#FF0000', statuses: ['inactive', 'terminated'] },
];

const TABS = ['basicInfo', 'employmentDetails', 'contactInfo', 'bankingInfo', 'contract', 'documents'];

const EMPLOYMENT_TAB_INDEX = TABS.indexOf('employmentDetails');
const CONTRACT_TAB_INDEX = TABS.indexOf('contract');
const DOCUMENTS_TAB_INDEX = TABS.indexOf('documents');

function InfoCell({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col items-start px-3 py-4 gap-3 h-19 border border-border/60 rounded-lg box-border bg-background">
            <span className=" font-normal text-xs leading-4 text-muted-foreground">
                {label}
            </span>
            <span className=" font-medium text-sm leading-3.5 text-foreground truncate w-full">
                {value || '—'}
            </span>
        </div>
    );
}

function getDocumentFileExtension(name: string): string {
    const parts = name.split('.');
    if (parts.length < 2) {
        return 'FILE';
    }
    return parts[parts.length - 1].toUpperCase().slice(0, 4);
}


function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-2 pb-1 border-b border-border">
            <Icon className="w-4 h-4 text-primary" />
            <span className=" font-semibold text-xs uppercase tracking-widest text-muted-foreground">
                {label}
            </span>
        </div>
    );
}

export default function EmployeeProfile({ employeeId }: { employeeId: string }) {
    const { t, i18n } = useTranslation(['employees', 'document']);
    const { hasPermission } = usePermissions();
    const router  = useRouter();
    const [activeTab, setActiveTab] = useState(0);
    const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
    const [isContractSheetOpen, setIsContractSheetOpen] = useState(false);
    const [documentCategories, setDocumentCategories] = useState<DocumentCategory[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<EmployeeDocumentRow | null>(null);
    const [isDocumentDetailOpen, setIsDocumentDetailOpen] = useState(false);
    const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

    const { data: employee, isLoading } = useEmployee(employeeId);
    const { data: employeesData } = useEmployees();
    const { data: authProfile } = useProfile();
    const { data: bankAccounts = [], isLoading: bankLoading } = useBankAccounts(employeeId);
    const { data: employeeContractsResponse, isLoading: contractsLoading } = useEmployeeContracts(
        { employeeId },
        { enabled: activeTab === CONTRACT_TAB_INDEX || activeTab === EMPLOYMENT_TAB_INDEX },
    );
    const companyContextId =
        authProfile?.companyId ?? employee?.companyOuId ?? employee?.orgUnit?.orgUnitId;
    const { data: salaryStructure } = useEmployeeSalaryStructure(
        employeeId,
        companyContextId,
    );
    const { currencyCode } = useDisplayCurrency(
        employee?.orgUnit?.orgUnitId ?? employee?.companyOuId ?? undefined,
    );
    const { data: employeeDocumentsResponse, isLoading: documentsLoading } = useEmployeeDocumentsPaged(
        {
            page: 1,
            size: 50,
            filter: { ownerId: employeeId },
        },
        { enabled: activeTab === DOCUMENTS_TAB_INDEX && Boolean(employeeId) },
    );

    const employees = employeesData || [];
    const currentIndex = employees.findIndex(e => e.id === employeeId);
    const prevEmployee = currentIndex > 0 ? employees[currentIndex - 1] : null;
    const nextEmployee = currentIndex !== -1 && currentIndex < employees.length - 1 ? employees[currentIndex + 1] : null;

    const handlePrev = () => {
        if (prevEmployee) router.push(`/dashboard/employees/${prevEmployee.id}`);
    };

    const handleNext = () => {
        if (nextEmployee) router.push(`/dashboard/employees/${nextEmployee.id}`);
    };

    const [now] = useState(() => Date.now());

    useEffect(() => {
        if (activeTab !== DOCUMENTS_TAB_INDEX) {
            return;
        }
        let isMounted = true;
        void fetchDocumentCategories().then((categories) => {
            if (isMounted) {
                setDocumentCategories(categories);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [activeTab]);

    const complianceLabels = React.useMemo(() => getDocumentComplianceLabels(t), [t]);

    const getComplianceMeta = useCallback(
        (status?: DocumentComplianceStatus, approvalState?: DocumentApprovalState) =>
            resolveDocumentComplianceMeta(status, approvalState, complianceLabels),
        [complianceLabels],
    );

    const getApprovalLabel = useCallback((state?: DocumentApprovalState) => {
        if (!state) {
            return '-';
        }
        switch (state) {
            case DocumentApprovalState.PENDING:
                return t('employeeDocuments.approval.pending', { ns: 'document' });
            case DocumentApprovalState.APPROVED:
                return t('employeeDocuments.approval.approved', { ns: 'document' });
            case DocumentApprovalState.REJECTED:
                return t('employeeDocuments.approval.rejected', { ns: 'document' });
            default:
                return state;
        }
    }, [t]);

    if (isLoading) {
        return <EmployeeProfileSkeleton />;
    }

    if (!employee) {
        return (
            <ProfilePageNotFound message={t('employeeNotFound')}>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted transition-colors cursor-pointer text-foreground"
                >
                    {t('goBack')}
                </button>
            </ProfilePageNotFound>
        );
    }

    const fullName    = `${employee.firstName}${employee.middleName ? ` ${employee.middleName}` : ''} ${employee.lastName}`;
    const employeeInitials =
        `${employee.firstName?.[0] ?? ''}${employee.lastName?.[0] ?? ''}`.toUpperCase() || 'U';
    const statusLower = employee.status.toLowerCase();
    const isActive    = statusLower === 'active';
    const stageIndex  = LIFECYCLE_STAGES.findIndex(s => s.statuses.includes(statusLower));

    let durationLabel = '-';
    if (employee.hireDate) {
        const ms     = now - new Date(employee.hireDate).getTime();
        const years  = Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25));
        const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
        if (years > 0)       durationLabel = months > 0 ? `${years}y ${months}m` : `${years} ${years === 1 ? 'year' : 'years'}`;
        else if (months > 0) durationLabel = `${months} ${months === 1 ? 'month' : 'months'}`;
        else                 durationLabel = '< 1 month';
    }

    const formatEmploymentType = (type?: string | null) => {
        if (!type) return null;
        return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const basicInfoFields = [
        { label: t('fullName'),     value: fullName },
        { label: t('email'),         value: employee.email },
        { label: t('employeeId'),   value: employee.employeeNumber },
        { label: t('phoneNumber'),  value: employee.phoneNumber },
        { label: t('dateOfBirth'), value: employee.dateOfBirth ? format(new Date(employee.dateOfBirth), 'dd/MM/yyyy') : null },
        { label: t('gender'),        value: t(employee.gender?.toLowerCase() || '') || employee.gender },
    ];

    const employeeContracts = employeeContractsResponse?.data || [];
    const activeContract = employeeContracts.find(c => c.status === 'active') || employeeContracts[0];

    const resolvedSalaryAmount =
        activeContract?.salary ??
        employee.salary ??
        salaryStructure?.baseSalary ??
        null;

    const resolvedCurrency = resolveEmployeeCompensationCurrency({
        salaryAssignmentCurrency: salaryStructure?.currency,
        companyCurrency: currencyCode,
        employeeCurrency: employee.currency,
    });

    const resolvedCurrencySymbol = getCurrencySymbol(resolvedCurrency);
    const salaryLabel = t('salary', { symbol: resolvedCurrencySymbol });
    const displaySalary =
        resolvedSalaryAmount != null && resolvedCurrency
            ? formatIntlCurrency(resolvedSalaryAmount, resolvedCurrency)
            : resolvedSalaryAmount != null
              ? formatIntlCurrency(resolvedSalaryAmount, currencyCode)
              : null;

    const employmentFields = [
        { label: t('jobTitle'),        value: employee.jobTitle },
        { label: t('employmentType'),  value: formatEmploymentType(employee.employmentType) },
        { label: t('hireDate'),        value: employee.hireDate ? format(new Date(employee.hireDate), 'MMMM d, yyyy') : null },
        { label: t('terminationDate'), value: employee.terminationDate ? format(new Date(employee.terminationDate), 'MMMM d, yyyy') : null },
        { label: salaryLabel,          value: displaySalary },
        { label: t('currency'),         value: resolvedCurrency },
        { label: t('nationality'),      value: employee.nationality },
        { label: t('nationalId'),      value: employee.nationalId },
    ];

    const workContactFields = [
        { label: t('workAddress'),   value: employee.address },
        { label: t('city'),           value: employee.city },
        { label: t('state'),          value: employee.state },
        { label: t('country'),        value: employee.country },
        { label: t('postalCode'),    value: employee.postalCode },
        { label: t('personalEmail'), value: employee.personalEmail },
        { label: t('businessEmail'), value: employee.businessEmail },
        { label: t('homePhone'),     value: employee.homePhone },
    ];

    const homeAddressFields = [
        { label: t('homeAddress'),     value: employee.homeAddress },
        { label: t('homeCity'),        value: employee.homeCity },
        { label: t('homeState'),       value: employee.homeState },
        { label: t('homeCountry'),     value: employee.homeCountry },
        { label: t('homePostalCode'), value: employee.homePostalCode },
    ];

    const passportVisaFields = [
        { label: t('passportNumber'), value: employee.passportNumber },
        { label: t('passportExpiry'), value: employee.passportExpiry ? format(new Date(employee.passportExpiry), 'dd/MM/yyyy') : null },
        { label: t('visaNumber'),     value: employee.visaNumber },
        { label: t('visaExpiry'),     value: employee.visaExpiry ? format(new Date(employee.visaExpiry), 'dd/MM/yyyy') : null },
    ];

    const workPermitFields = [
        { label: t('workPermitNumber'), value: employee.workPermitNumber },
        { label: t('workPermitExpiry'), value: employee.workPermitExpiry ? format(new Date(employee.workPermitExpiry), 'dd/MM/yyyy') : null },
    ];

    const displayContractName = activeContract?.contract?.contractName || 'Full-time permanent';
    const displayEmploymentType = formatEmploymentType(activeContract?.employmentType || employee.employmentType) || 'Full-time';
    const displayJobTitle = activeContract?.jobTitle || employee.jobTitle || 'Designer';
    const uploadedDocuments = employeeDocumentsResponse?.data ?? [];

    const handleOpenDocument = (document: EmployeeDocumentRow) => {
        setSelectedDocument(document);
        setIsDocumentDetailOpen(true);
    };

    return (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-500">

            <EmployeeDocumentDetailSheet
                open={isDocumentDetailOpen}
                onOpenChange={setIsDocumentDetailOpen}
                document={selectedDocument}
                mode="view"
                categories={documentCategories}
                dateLocale={dateLocale}
                isCompanyScopeEditor={false}
                canEdit={false}
                onSave={async () => false}
                getComplianceMeta={getComplianceMeta}
                getApprovalLabel={getApprovalLabel}
            />

            <div className="flex flex-col items-start gap-2 w-full">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 h-9 bg-transparent border-none cursor-pointer hover:opacity-70 transition-opacity"
                >
                    <ArrowLeft className="w-4 h-4 text-foreground/80" />
                    <span className=" font-medium text-sm leading-5 text-foreground/80">
                        {t('back')}
                    </span>
                </button>
                <h1 className=" font-bold text-2xl leading-8 text-foreground m-0">
                    {t('employeeProfile', 'Employee profile')}
                </h1>
            </div>

            <div className="flex flex-col lg:flex-row items-end gap-6 w-full">

                <div className="shrink-0 flex flex-col w-full lg:w-60.5 h-58 bg-card border border-border shadow-sm rounded-xl">
                    <div className="flex justify-center items-center w-full pt-2 px-2 h-30">
                        <SecureAvatar
                            className="w-22.5 h-22.5 rounded-xl border-none"
                            reference={employee.avatarUrl}
                            alt={fullName}
                            fallback={employeeInitials}
                            fallbackClassName="w-full h-full rounded-xl bg-[#FFBEB8] text-white text-xl font-semibold"
                            imageClassName="rounded-xl"
                        />
                    </div>
                    <div className="flex flex-col justify-center items-center gap-2 w-full pt-2 pb-4">
                        <div className="flex flex-col items-center gap-1 px-2 text-center">
                            <span className=" font-semibold text-[20px] leading-5 text-foreground">
                                {fullName}
                            </span>
                            <span className=" font-medium text-sm leading-3.5 text-foreground/80">
                                {employee.jobTitle}
                            </span>
                            <span className=" font-medium text-sm leading-3.5 text-muted-foreground">
                                {employee.orgUnit?.orgUnitName || employee.departmentId || 'Unassigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 h-5 bg-card border border-border rounded-lg">
                            {isActive
                                ? <CircleCheck className="w-3 h-3 text-[#22C55E]" />
                                : <Clock className="w-3 h-3 text-primary" />
                            }
                            <span className=" font-semibold text-xs leading-4 text-foreground capitalize">
                                {employee.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-end flex-1 min-w-0 gap-6 h-57.5">

                    <div className="flex flex-row justify-between items-center w-full">
                        <button
                            onClick={handlePrev}
                            disabled={!prevEmployee}
                            className="flex items-center gap-2 px-4 h-9 bg-muted hover:opacity-80 transition-opacity rounded-lg border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4 text-foreground" />
                            <span className=" font-medium text-sm leading-5 text-foreground">{t('previous')}</span>
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!nextEmployee}
                            className="flex items-center gap-2 px-4 h-9 bg-muted hover:opacity-80 transition-opacity rounded-lg border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className=" font-medium text-sm leading-5 text-foreground">{t('next')}</span>
                            <ArrowRight className="w-4 h-4 text-foreground" />
                        </button>
                    </div>

                    <div className="flex flex-col justify-center items-start gap-2 w-full h-42.5 bg-card border border-border shadow-sm rounded-xl px-6 py-4">
                        <span className=" font-semibold text-[20px] leading-5 text-foreground">
                            {t('lifecycleStatus')}
                        </span>
                        <div className="w-full px-2 sm:px-8 pt-4 sm:pt-6 overflow-x-auto">
                            <div className="grid grid-cols-5 min-w-[400px] gap-x-0" style={{ rowGap: 8 }}>
                            {LIFECYCLE_STAGES.map((stage, i) => {
                                const completed  = i <= stageIndex;
                                const lineActive = i < stageIndex;
                                const isLast     = i === LIFECYCLE_STAGES.length - 1;
                                return (
                                    <div key={`dot-${stage.key}`} className="flex items-center" style={{ opacity: i > stageIndex ? 0.6 : 1 }}>
                                        <div
                                            className="shrink-0 w-4 h-4 rounded-full box-border"
                                            style={{
                                                backgroundColor: completed ? stage.color : 'transparent',
                                                border: `3px solid ${stage.color}`,
                                            }}
                                        />
                                        {!isLast && (
                                            <div
                                                className="flex-1 h-0.5"
                                                style={{ backgroundColor: lineActive ? stage.color : 'var(--border)' }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                            {LIFECYCLE_STAGES.map((stage, i) => (
                                <div key={`label-${stage.key}`} style={{ opacity: i > stageIndex ? 0.6 : 1 }}>
                                    <span className="font-medium text-sm leading-5.5 text-foreground whitespace-nowrap">
                                        {t(stage.key)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </div>

            <div className="flex flex-col lg:flex-row items-start gap-6 w-full">

                <div className="flex flex-col items-start gap-4 flex-1 min-w-0">

                    <div className="flex flex-row items-center w-full h-9 p-0.75 bg-secondary rounded-[10px] overflow-x-auto">
                        {TABS.map((tab, i) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(i)}
                                className={[
                                    'flex-1 flex justify-center items-center px-2 py-1 rounded-lg border-none cursor-pointer transition-all',
                                    i === activeTab
                                        ? 'bg-card shadow-sm h-7 text-foreground'
                                        : 'bg-transparent h-7.5 text-foreground/70 hover:text-foreground',
                                ].join(' ')}
                            >
                                <span className=" font-medium text-sm leading-5 whitespace-nowrap text-center">
                                    {t(tab)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col w-full p-6 gap-4 bg-card border border-border shadow-sm rounded-[10px] min-h-88">

                        <div className="flex flex-row items-center w-full gap-1.5 h-9">
                            <div className="flex-1">
                                <span className=" font-medium text-base leading-6 text-card-foreground">
                                    {t(TABS[activeTab])}
                                </span>
                            </div>
                            {hasPermission('employees:update') && (
                                TABS[activeTab] === 'contract' ? (
                                    <button
                                        onClick={() => setIsContractSheetOpen(true)}
                                        className="flex items-center gap-2 px-4 h-9 bg-transparent border-none cursor-pointer rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <span className=" font-semibold text-sm leading-5 text-primary">
                                            {t('updateContract', 'Update contract')}
                                        </span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsEditSheetOpen(true)}
                                        className="flex items-center gap-2 px-4 h-9 min-w-20 bg-transparent border-none cursor-pointer rounded-lg hover:bg-muted transition-colors"
                                    >
                                        <PencilLine className="w-4 h-4 text-primary" />
                                        <span className=" font-medium text-sm leading-5 text-primary">{t('edit')}</span>
                                    </button>
                                )
                            )}
                        </div>

                        {activeTab === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                {basicInfoFields.map((f) => (
                                    <InfoCell key={f.label} label={f.label} value={f.value} />
                                ))}
                            </div>
                        )}

                        {activeTab === 1 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                {employmentFields.map((f) => (
                                    <InfoCell key={f.label} label={f.label} value={f.value} />
                                ))}
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="flex flex-col gap-4 w-full">
                                <SectionHeader icon={MapPin} label="Work & contact" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                    {workContactFields.map((f) => (
                                        <InfoCell key={f.label} label={f.label} value={f.value} />
                                    ))}
                                </div>

                                <SectionHeader icon={Phone} label="Home address" />
                                <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                    {homeAddressFields.map((f) => (
                                        <InfoCell key={f.label} label={f.label} value={f.value} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div className="flex flex-col gap-4 w-full">
                                {bankLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                ) : bankAccounts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                                        <CreditCard className="w-10 h-10 text-border" />
                                        <span className=" font-normal text-sm">No bank accounts added yet</span>
                                    </div>
                                ) : (
                                    bankAccounts.map((account) => (
                                        <div
                                            key={account.id}
                                            className="flex flex-col gap-3 p-4 border border-border rounded-xl bg-background relative"
                                        >
                                            {account.isPrimary && (
                                                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-full">
                                                    <Star className="w-3 h-3 text-primary fill-primary" />
                                                    <span className=" font-semibold text-[10px] text-primary">
                                                        Primary
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className=" font-semibold text-sm text-foreground">
                                                        {account.bankName}
                                                    </span>
                                                    {account.branchName && (
                                                        <span className=" font-normal text-xs text-muted-foreground">
                                                            {account.branchName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <InfoCell label="Account holder"  value={account.accountName} />
                                                <InfoCell label="Account number"  value={account.accountNumber} />
                                                {account.iban          && <InfoCell label="IBAN"           value={account.iban} />}
                                                {account.routingNumber && <InfoCell label="Routing number" value={account.routingNumber} />}
                                                {account.swiftCode     && <InfoCell label="SWIFT / BIC"    value={account.swiftCode} />}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 4 && (
                            <div className="flex flex-col gap-4 w-full">
                                {contractsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                ) : !activeContract ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                                        <FileText className="w-10 h-10 text-border" />
                                        <span className=" font-normal text-sm">No contract assigned yet</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                            <InfoCell label={t('contract')} value={displayContractName} />
                                            <InfoCell label={salaryLabel} value={displaySalary} />
                                            <InfoCell label={t('employmentType')} value={displayEmploymentType} />
                                            <InfoCell label={t('jobTitle')} value={displayJobTitle} />
                                            {activeContract.effectiveDate && (
                                                <InfoCell
                                                    label="Effective date"
                                                    value={format(new Date(activeContract.effectiveDate), 'MMMM d, yyyy')}
                                                />
                                            )}
                                            {activeContract.endDate && (
                                                <InfoCell
                                                    label="End date"
                                                    value={format(new Date(activeContract.endDate), 'MMMM d, yyyy')}
                                                />
                                            )}
                                            {activeContract.probationEndDate && (
                                                <InfoCell
                                                    label="Probation end"
                                                    value={format(new Date(activeContract.probationEndDate), 'MMMM d, yyyy')}
                                                />
                                            )}
                                            {activeContract.signedDate && (
                                                <InfoCell
                                                    label="Signed date"
                                                    value={format(new Date(activeContract.signedDate), 'MMMM d, yyyy')}
                                                />
                                            )}
                                        </div>

                                        {activeContract.contract?.documentUrl ? (
                                            <ContractDocumentPreviewButton
                                                documentReference={activeContract.contract.documentUrl}
                                                documentName={displayContractName}
                                                className="mt-2"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-between p-4 border border-border rounded-xl bg-background mt-2 opacity-60">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                                                        <FileText className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <span className="font-normal text-sm text-muted-foreground">No document attached</span>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {activeTab === DOCUMENTS_TAB_INDEX && (
                            <div className="flex flex-col gap-6 w-full">
                                <div className="flex flex-col gap-4">
                                    <SectionHeader icon={FileText} label="Passport & Visa" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                        {passportVisaFields.map((f) => (
                                            <InfoCell key={f.label} label={f.label} value={f.value} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <SectionHeader icon={Mail} label={t('workPermit')} />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-3">
                                        {workPermitFields.map((f) => (
                                            <InfoCell key={f.label} label={f.label} value={f.value} />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <SectionHeader
                                            icon={FileText}
                                            label={t('uploadedDocuments', 'Uploaded documents')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/documents/employee-documents/${employeeId}?name=${encodeURIComponent(fullName)}`,
                                                )
                                            }
                                            className="text-sm font-medium text-primary hover:underline border-none bg-transparent cursor-pointer shrink-0"
                                        >
                                            {t('viewAllDocuments', 'View all')}
                                        </button>
                                    </div>

                                    {documentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        </div>
                                    ) : uploadedDocuments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 gap-3 text-muted-foreground border border-dashed border-border rounded-xl">
                                            <FileText className="w-10 h-10 text-border" />
                                            <span className="font-normal text-sm">
                                                {t('noUploadedDocuments', 'No documents uploaded yet')}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {uploadedDocuments.map((document) => {
                                                const complianceMeta = resolveDocumentComplianceMeta(
                                                    document.compliance,
                                                    document.approvalState,
                                                    complianceLabels,
                                                );
                                                return (
                                                <div
                                                    key={document.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => handleOpenDocument(document)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            handleOpenDocument(document);
                                                        }
                                                    }}
                                                    className="flex flex-col gap-3 border border-border rounded-xl p-4 bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-center justify-center h-20 rounded-lg bg-muted/60 border border-border/60">
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <FileText className="w-8 h-8 text-muted-foreground" />
                                                            <span className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                                                                {getDocumentFileExtension(document.documentName)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex min-w-0 flex-col gap-0.5">
                                                        <span className="font-semibold text-sm text-foreground truncate">
                                                            {document.documentName}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {document.categoryName}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 mt-auto">
                                                        <Badge
                                                            variant="outline"
                                                            className={`text-xs w-fit ${complianceMeta.className}`}
                                                        >
                                                            {complianceMeta.label}
                                                        </Badge>
                                                        {document.expiryDate ? (
                                                            <span className="text-xs text-muted-foreground">
                                                                {t('expiryDate', 'Expiry')}:{' '}
                                                                {formatDateString(document.expiryDate)}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="shrink-0 flex flex-col w-full lg:w-67.5 h-70 bg-card border border-border shadow-sm rounded-[10px] overflow-hidden">
                    <div className="flex items-center w-full h-15 px-6 bg-card-header-background shrink-0">
                        <span className=" font-semibold text-lg leading-7 tracking-tight text-card-foreground">
                            {t('employmentSummary')}
                        </span>
                    </div>
                    <div className="flex flex-col justify-center items-center flex-1 p-6 gap-10">
                        <div className="flex flex-row items-start w-full gap-3">
                            <div className="flex items-center justify-center shrink-0 w-10 h-10 bg-primary rounded-lg">
                                <Clock className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className=" font-normal text-sm leading-5 text-muted-foreground">
                                    {t('employmentDuration')}
                                </span>
                                <span className=" font-medium text-sm leading-5 text-foreground">
                                    {durationLabel}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-row items-start w-full gap-3">
                            <div className="flex items-center justify-center shrink-0 w-10 h-10 bg-primary rounded-lg">
                                <CalendarDays className="w-4 h-4 text-primary-foreground" />
                            </div>
                            <div className="flex flex-col items-start">
                                <span className=" font-normal text-sm leading-5 text-muted-foreground">
                                    {t('hiredDate')}
                                </span>
                                <span className=" font-medium text-sm leading-5 text-foreground">
                                    {employee.hireDate ? format(new Date(employee.hireDate), 'MMMM d, yyyy') : '—'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <EditEmployeeSheet
                open={isEditSheetOpen}
                onOpenChange={setIsEditSheetOpen}
                employee={employee}
            />

            <UpdateEmployeeContractSheet
                open={isContractSheetOpen}
                onOpenChange={setIsContractSheetOpen}
                employeeId={employeeId}
                currentContract={activeContract || null}
            />
        </div>
    );
}
