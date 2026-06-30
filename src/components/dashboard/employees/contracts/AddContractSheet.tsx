'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { Plus, Info, X, Loader2, FileText, ExternalLink } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField as CustomFormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { useInsurances } from '@/features/insurance/hooks/useInsurance';
import { useDocumentCategories } from '@/features/documents/hooks/useDocumentCategories';
import { uploadLogo } from '@/features/documents/documents.actions';
import { ContractDocumentPreviewButton } from '@/components/dashboard/contracts/ContractDocumentPreviewButton';
import { useToast } from '@/hooks/use-toast';
import { EMPLOYMENT_TYPE_OPTIONS, CONTRACT_TYPE_OPTIONS } from '@/features/employee/employee.types';

const contractTypeSchema = z.object({
    id: z.string().optional(),
    contractName: z.string().min(1, 'Contract name is required'),
    status: z.string().min(1, 'Status is required'),
    companyId: z.string().optional(),
    description: z.string().optional(),
    durationMonths: z.union([z.string(), z.number()]).optional().transform((val) => val === '' || val === undefined ? undefined : Number(val)),
    probationPeriodMonths: z.union([z.string(), z.number()]).optional().transform((val) => val === '' || val === undefined ? undefined : Number(val)),
    employmentType: z.string().min(1, 'Employment type is required'),
    contractType: z.string().min(1, 'Contract type is required'),
    isRenewable: z.boolean(),
    insuranceIds: z.array(z.string()).default([]),
    documentCategoryId: z.string().optional(),
    documentUrl: z.string().optional(),
    documentFileName: z.string().optional(),
    documentExpiryDate: z.string().optional(),
});

export interface ContractTypeValues {
    id?: string;
    contractName: string;
    status: string;
    companyId?: string;
    description?: string;
    durationMonths?: number;
    probationPeriodMonths?: number;
    employmentType: string;
    contractType: string;
    isRenewable: boolean;
    insuranceIds: string[];
    documentCategoryId?: string;
    documentUrl?: string;
    documentFileName?: string;
    documentExpiryDate?: string;
}

interface AddContractSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ContractTypeValues) => void | Promise<void>;
    initialData?: ContractTypeValues | null;
    defaultCompanyId?: string;
}

const DOCUMENT_CATEGORIES_ROUTE = '/dashboard/documents/categories';

const defaultValues: ContractTypeValues = {
    contractName: '',
    status: 'active',
    companyId: '',
    description: '',
    durationMonths: undefined,
    probationPeriodMonths: undefined,
    employmentType: 'full_time',
    contractType: 'permanent',
    isRenewable: false,
    insuranceIds: [],
    documentCategoryId: '',
    documentUrl: '',
    documentFileName: '',
    documentExpiryDate: '',
};

export function AddContractSheet({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    defaultCompanyId,
}: AddContractSheetProps) {
    const { t, i18n } = useTranslation(['contracts', 'employees', 'dashboard']);
    const isRtl = i18n.language === 'ar';
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const initializedSessionRef = useRef<string | null>(null);
    const [pendingContractFile, setPendingContractFile] = useState<File | null>(null);
    const [pendingFilePreviewUrl, setPendingFilePreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { isTenantSuperAdmin } = usePermissions();
    const { companies: companiesData } = useCompanyOptions();

    const { 
        register, 
        control, 
        handleSubmit, 
        reset, 
        setValue,
        getValues,
        watch,
        formState: { errors } 
    } = useForm<ContractTypeValues>({
        resolver: zodResolver(contractTypeSchema) as any,
        defaultValues,
    });

    const selectedCompanyId = watch('companyId');
    const selectedDocumentCategoryId = watch('documentCategoryId');
    const documentUrl = watch('documentUrl');
    const documentFileName = watch('documentFileName');
    const documentExpiryDate = watch('documentExpiryDate');
    const selectedInsuranceIds = watch('insuranceIds') || [];

    const { data: insurancesData } = useInsurances({
        limit: 100,
        ouId: selectedCompanyId || undefined,
    });

    const {
        data: documentCategoriesData,
        isPending: isDocumentCategoriesLoading,
        isError: isDocumentCategoriesError,
    } = useDocumentCategories({ enabled: open });

    const documentCategoryOptions = useMemo(
        () =>
            (documentCategoriesData ?? [])
                .filter((category) => category.status === 'active')
                .map((category) => ({
                    label: category.name,
                    value: category.id,
                })),
        [documentCategoriesData],
    );

    const hasDocumentCategories =
        !isDocumentCategoriesLoading &&
        !isDocumentCategoriesError &&
        documentCategoryOptions.length > 0;

    const selectedDocumentCategory = useMemo(
        () => (documentCategoriesData ?? []).find((category) => category.id === selectedDocumentCategoryId),
        [documentCategoriesData, selectedDocumentCategoryId],
    );

    const clearPendingContractFile = () => {
        setPendingContractFile(null);
        setPendingFilePreviewUrl((current) => {
            if (current) {
                URL.revokeObjectURL(current);
            }
            return null;
        });
    };

    useEffect(() => {
        return () => {
            if (pendingFilePreviewUrl) {
                URL.revokeObjectURL(pendingFilePreviewUrl);
            }
        };
    }, [pendingFilePreviewUrl]);

    useEffect(() => {
        if (!open) {
            initializedSessionRef.current = null;
            return;
        }

        const sessionKey = initialData?.id ?? 'new';
        if (initializedSessionRef.current === sessionKey) {
            return;
        }
        initializedSessionRef.current = sessionKey;

        clearPendingContractFile();
        setIsSubmitting(false);

        if (initialData) {
            reset({
                ...initialData,
                insuranceIds: initialData.insuranceIds || [],
            });
            return;
        }

        reset({
            ...defaultValues,
            companyId: defaultCompanyId || companiesData?.[0]?.id || '',
        });
    }, [open, initialData, defaultCompanyId, companiesData, reset]);

    useEffect(() => {
        if (!open || initialData) {
            return;
        }
        const nextCompanyId =
            defaultCompanyId || companiesData?.[0]?.id || '';
        if (nextCompanyId && selectedCompanyId !== nextCompanyId) {
            setValue('companyId', nextCompanyId);
        }
    }, [
        companiesData,
        defaultCompanyId,
        initialData,
        open,
        selectedCompanyId,
        setValue,
    ]);

    useEffect(() => {
        if (!open || initialData || !selectedCompanyId || !insurancesData?.data) {
            return;
        }

        const currentInsuranceIds = getValues('insuranceIds') || [];
        if (currentInsuranceIds.length === 0) {
            return;
        }

        const validInsuranceIds = currentInsuranceIds.filter((id) =>
            insurancesData.data.some((ins) => ins.id === id),
        );
        if (validInsuranceIds.length !== currentInsuranceIds.length) {
            setValue('insuranceIds', validInsuranceIds, { shouldDirty: true });
        }
    }, [open, initialData, selectedCompanyId, insurancesData, getValues, setValue]);

    const validatePendingDocument = (): boolean => {
        if (!pendingContractFile) {
            return true;
        }
        if (!selectedDocumentCategoryId) {
            toast({
                title: t('documentUploadFailed'),
                description: t('selectDocumentType'),
                variant: 'destructive',
            });
            return false;
        }
        if (selectedDocumentCategory?.expiryRequired && !documentExpiryDate) {
            toast({
                title: t('documentUploadFailed'),
                description: t('documentExpiryRequired'),
                variant: 'destructive',
            });
            return false;
        }
        return true;
    };

    const handleFormSubmit = async (data: ContractTypeValues) => {
        if (!validatePendingDocument()) {
            return;
        }

        setIsSubmitting(true);
        try {
            let resolvedDocumentUrl = data.documentUrl;
            let resolvedDocumentFileName = data.documentFileName;

            if (pendingContractFile) {
                const formData = new FormData();
                formData.append('file', pendingContractFile);

                const uploadResult = await uploadLogo(formData);
                if (uploadResult.error || !uploadResult.url) {
                    throw new Error(uploadResult.error || t('documentUploadFailed'));
                }

                resolvedDocumentUrl = uploadResult.url;
                resolvedDocumentFileName = pendingContractFile.name;
            }

            await onSubmit({
                ...data,
                documentUrl: resolvedDocumentUrl,
                documentFileName: resolvedDocumentFileName,
            });
            clearPendingContractFile();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : t('documentUploadFailed');
            toast({
                title: t('documentUploadFailed'),
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const companyOptions = companiesData?.map((c) => ({
        label: c.name,
        value: c.id,
    })) || [];

    const insuranceOptions = insurancesData?.data?.map((ins) => ({
            label: ins.insuranceName,
            value: ins.id,
        })) || [];

    const handleInsuranceSelect = (insuranceId: string) => {
        if (!selectedInsuranceIds.includes(insuranceId)) {
            setValue('insuranceIds', [...selectedInsuranceIds, insuranceId]);
        }
    };

    const handleRemoveInsurance = (insuranceId: string) => {
        setValue(
            'insuranceIds',
            selectedInsuranceIds.filter((id) => id !== insuranceId)
        );
    };

    const handleAddDocumentClick = () => {
        if (!selectedDocumentCategoryId) {
            return;
        }
        if (selectedDocumentCategory?.expiryRequired && !documentExpiryDate) {
            toast({
                title: t('documentUploadFailed'),
                description: t('documentExpiryRequired'),
                variant: 'destructive',
            });
            return;
        }
        fileInputRef.current?.click();
    };

    const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file || !selectedDocumentCategoryId) {
            return;
        }

        if (selectedDocumentCategory?.expiryRequired && !documentExpiryDate) {
            toast({
                title: t('documentUploadFailed'),
                description: t('documentExpiryRequired'),
                variant: 'destructive',
            });
            return;
        }

        clearPendingContractFile();
        const previewUrl = URL.createObjectURL(file);
        setPendingContractFile(file);
        setPendingFilePreviewUrl(previewUrl);
        setValue('documentFileName', file.name);
        setValue('documentUrl', '');
    };

    const handleRemoveDocument = () => {
        clearPendingContractFile();
        setValue('documentUrl', '');
        setValue('documentFileName', '');
    };

    const displayedDocumentName = pendingContractFile
        ? pendingContractFile.name
        : documentFileName;
    const hasDisplayedDocument = Boolean(pendingContractFile || documentUrl);

    const selectedInsurances = insurancesData?.data?.filter((ins) =>
        selectedInsuranceIds.includes(ins.id)
    ) || [];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRtl ? 'left' : 'right'}
                className="sm:max-w-162.5 px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
            >
                <SheetHeader className="flex flex-col gap-6 shrink-0 p-0">
                    <SheetTitle className="text-xl font-bold text-foreground">
                        {initialData ? t('employees:edit') + ' ' + t('title').toLowerCase() : 'Add a contract type'}
                    </SheetTitle>
                    <div className="h-px bg-border" />
                </SheetHeader>

                <form 
                    id="add-contract-form" 
                    onSubmit={handleSubmit(handleFormSubmit)} 
                    className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10 no-scrollbar mt-4"
                >
                    <div className="flex flex-col gap-8">
                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="bg-muted/40 border-b border-border px-4 py-3">
                                <p className="text-sm font-semibold text-foreground">
                                    Contract info
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <CustomFormField
                                        id="contractName"
                                        label="Contract name"
                                        name="contractName"
                                        register={register}
                                        error={errors.contractName}
                                        placeholder="Enter contract name"
                                        t={t}
                                    />
                                    <FormSelect
                                        id="status"
                                        label="Status"
                                        name="status"
                                        control={control as any}
                                        error={errors.status}
                                        options={[
                                            { label: 'Active', value: 'active' },
                                            { label: 'Draft', value: 'draft' },
                                        ]}
                                        t={t}
                                    />
                                    {isTenantSuperAdmin && !initialData && (
                                        <div className="md:col-span-2">
                                            <FormSelect
                                                id="companyId"
                                                label="Select company"
                                                name="companyId"
                                                control={control as any}
                                                error={errors.companyId}
                                                options={companyOptions}
                                                placeholder="Select company"
                                                t={t}
                                            />
                                        </div>
                                    )}
                                    <div className="md:col-span-2 space-y-3">
                                        <Label htmlFor="description" className="text-sm font-medium leading-5 text-foreground block">
                                            Description
                                        </Label>
                                        <Textarea 
                                            id="description"
                                            placeholder="Add description" 
                                            className={cn(
                                                "min-h-25 resize-none h-auto rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20",
                                                errors.description ? "border-destructive focus-visible:ring-destructive" : ""
                                            )}
                                            {...register('description')} 
                                        />
                                        {errors.description && (
                                            <p className="text-xs text-destructive rtl:text-end">
                                                {errors.description.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="bg-muted/40 border-b border-border px-4 py-3">
                                <p className="text-sm font-semibold text-foreground">
                                    Contract details
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    <CustomFormField
                                        id="durationMonths"
                                        label="Duration (months)"
                                        name="durationMonths"
                                        type="number"
                                        register={register}
                                        error={errors.durationMonths}
                                        placeholder="e.g. 12"
                                        t={t}
                                    />
                                    <CustomFormField
                                        id="probationPeriodMonths"
                                        label="Probation (months)"
                                        name="probationPeriodMonths"
                                        type="number"
                                        register={register}
                                        error={errors.probationPeriodMonths}
                                        placeholder="e.g. 3"
                                        t={t}
                                    />
                                    <FormSelect
                                        id="employmentType"
                                        label="Employment type"
                                        name="employmentType"
                                        control={control as any}
                                        error={errors.employmentType}
                                        options={EMPLOYMENT_TYPE_OPTIONS.map(opt => ({ label: t(opt.value, opt.label), value: opt.value }))}
                                        t={t}
                                    />
                                    <FormSelect
                                        id="contractType"
                                        label="Contract type"
                                        name="contractType"
                                        control={control as any}
                                        error={errors.contractType}
                                        options={CONTRACT_TYPE_OPTIONS.map(opt => ({ label: t(opt.value, opt.label), value: opt.value }))}
                                        t={t}
                                    />
                                    <Controller
                                        name="isRenewable"
                                        control={control as any}
                                        render={({ field }) => (
                                            <div className="flex flex-row items-center space-x-3 space-y-0 p-1 md:col-span-2">
                                                <Checkbox
                                                    id="isRenewable"
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                                <Label htmlFor="isRenewable" className="text-sm font-semibold cursor-pointer text-foreground">
                                                    Renewable contract
                                                </Label>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-border rounded-xl overflow-hidden bg-card">
                            <div className="bg-muted/40 border-b border-border px-4 py-3">
                                <p className="text-sm font-semibold text-foreground">
                                    Insurances
                                </p>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 items-end">
                                    <div className="flex flex-col gap-2">
                                        <Label className="text-sm font-medium text-foreground">
                                            Select insurance
                                        </Label>
                                        <Select
                                            onValueChange={(val) => {
                                                if (val) {
                                                    handleInsuranceSelect(val);
                                                }
                                            }}
                                            value=""
                                        >
                                            <SelectTrigger className="w-full h-10 border border-input bg-background px-3 py-2 text-sm rounded-md shadow-sm">
                                                <SelectValue placeholder="Select insurance" />
                                            </SelectTrigger>
                                            <SelectContent position="popper" sideOffset={4}>
                                                {insuranceOptions.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        disabled={selectedInsuranceIds.includes(opt.value)}
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex items-start gap-3 p-4 bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] rounded-[8px]">
                                        <Info className="h-5 w-5 text-[#3B82F6] shrink-0 mt-0.5" />
                                        <span className="text-xs font-medium leading-relaxed">
                                            You can select multiple insurance types that apply to the contract your creating.
                                        </span>
                                    </div>
                                </div>

                                {selectedInsurances.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedInsurances.map((ins) => (
                                            <span 
                                                key={ins.id} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4F4F5] border border-[#E4E4E7] text-xs text-[#18181B] font-semibold rounded-lg shadow-sm"
                                            >
                                                {ins.insuranceName}
                                                <button 
                                                    type="button"
                                                    onClick={() => handleRemoveInsurance(ins.id)}
                                                    className="text-[#EF4444] hover:text-[#DC2626] transition-colors focus:outline-none"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border border-border/80 rounded-xl overflow-hidden bg-background">
                            <div className="bg-muted/40 border-b border-border px-6 h-12.5 flex items-center">
                                <p className="text-sm font-semibold text-foreground">
                                    Contract content
                                </p>
                            </div>
                            <div className="px-6 py-4 space-y-6">
                                <div className="space-y-3">
                                    <Label
                                        htmlFor="documentCategoryId"
                                        className="text-sm font-medium leading-5 text-foreground block font-['Albert_Sans']"
                                    >
                                        {t('documentType')}
                                    </Label>
                                    {isDocumentCategoriesLoading ? (
                                        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                                            <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                            <span>{t('loadingDocumentCategories')}</span>
                                        </div>
                                    ) : hasDocumentCategories ? (
                                        <FormSelect
                                            id="documentCategoryId"
                                            name="documentCategoryId"
                                            control={control as any}
                                            error={errors.documentCategoryId}
                                            options={documentCategoryOptions}
                                            placeholder={t('selectDocumentType')}
                                            t={t}
                                        />
                                    ) : (
                                        <div className="rounded-lg border border-border bg-muted/40 p-4">
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {t('noDocumentCategories')}{' '}
                                                <Link
                                                    href={DOCUMENT_CATEGORIES_ROUTE}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    {t('goToDocumentCategories')}
                                                </Link>
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {selectedDocumentCategory?.expiryRequired ? (
                                    <div className="space-y-3">
                                        <Label
                                            htmlFor="documentExpiryDate"
                                            className="text-sm font-medium leading-5 text-foreground block font-['Albert_Sans']"
                                        >
                                            {t('documentExpiryDate')}
                                        </Label>
                                        <input
                                            id="documentExpiryDate"
                                            type="date"
                                            className={cn(
                                                'flex h-10 w-full rounded-[8px] border border-input bg-background px-4 py-2 text-sm shadow-sm',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary',
                                            )}
                                            value={documentExpiryDate || ''}
                                            onChange={(event) => setValue('documentExpiryDate', event.target.value)}
                                        />
                                    </div>
                                ) : null}
                                <div className="flex flex-col items-start gap-4">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleDocumentFileChange}
                                    />
                                    <Button
                                        variant="outline"
                                        type="button"
                                        disabled={!selectedDocumentCategoryId || isSubmitting}
                                        onClick={handleAddDocumentClick}
                                        className="h-9 w-38 border-primary/20 text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] font-medium shadow-sm active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span className="text-sm">{t('addDocument')}</span>
                                    </Button>
                                    {hasDisplayedDocument ? (
                                        <div className="flex w-full flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex min-w-0 items-start gap-2">
                                                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">
                                                            {displayedDocumentName ||
                                                                t('selectedDocument', { name: t('viewDocument') })}
                                                        </p>
                                                        {pendingContractFile ? (
                                                            <p className="mt-1 text-xs text-muted-foreground">
                                                                {t('documentPendingSave')}
                                                            </p>
                                                        ) : null}
                                                        {pendingContractFile && pendingFilePreviewUrl ? (
                                                            <a
                                                                href={pendingFilePreviewUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                                            >
                                                                {t('viewDocument')}
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                        ) : documentUrl ? (
                                                            <div className="mt-2">
                                                                <ContractDocumentPreviewButton
                                                                    documentReference={documentUrl}
                                                                    documentName={
                                                                        displayedDocumentName ||
                                                                        t('viewDocument')
                                                                    }
                                                                    variant="button"
                                                                    previewLabel={t('viewDocument')}
                                                                    className="h-8"
                                                                />
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveDocument}
                                                    disabled={isSubmitting}
                                                    className="text-xs font-medium text-destructive hover:text-destructive/80 disabled:opacity-50"
                                                >
                                                    {t('removeDocument')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <SheetFooter className="flex flex-row items-center justify-end gap-4 mt-auto px-0 pt-6 border-t border-border shrink-0">
                    <SheetClose asChild>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="h-10 px-8 rounded-[8px] border-border text-foreground hover:bg-muted font-semibold transition-all" 
                        >
                            Cancel
                        </Button>
                    </SheetClose>
                    <Button
                        type="submit"
                        form="add-contract-form"
                        disabled={isSubmitting}
                        className="h-10 px-8 rounded-[8px] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="me-2 h-4 w-4 animate-spin" />
                                {t('employees:saving')}
                            </>
                        ) : (
                            t('saveContract')
                        )}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
