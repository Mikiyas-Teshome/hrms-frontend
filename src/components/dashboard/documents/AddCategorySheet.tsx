'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/FormSelect';
import { DocumentCategory, DocumentCategoryAppliedTo } from '@/features/documents/documents.types';
import {
  useCreateDocumentCategory,
  useUpdateDocumentCategory,
} from '@/features/documents/hooks/useDocumentCategories';
import { DocumentCategoryPagedParams } from '@/features/documents/hooks/document-category-cache.utils';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import { useOrganizationHierarchy, useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { buildOrganizationUnitOptionsForCompany } from '@/features/organization/organization-unit-options.util';
import { cn } from '@/lib/utils';

const FormSection = ({
  title,
  children,
  contentClassName,
}: {
  title: string;
  children: React.ReactNode;
  contentClassName?: string;
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)]">
    <div className="flex h-12.5 items-center bg-card-header-background px-4 sm:px-6">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className={cn('flex flex-col gap-4 p-4 sm:p-6', contentClassName)}>{children}</div>
  </div>
);

const DOCUMENT_CATEGORY_TYPES = ['identification', 'employment', 'educational'] as const;

const normalizeCategoryTypeForForm = (value?: string | null): string => {
  const normalized = (value ?? 'identification').trim().toLowerCase();
  return DOCUMENT_CATEGORY_TYPES.includes(normalized as (typeof DOCUMENT_CATEGORY_TYPES)[number])
    ? normalized
    : 'identification';
};

const normalizeCategoryTypeForApi = (value: string): string => value.trim().toUpperCase();

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listParams: DocumentCategoryPagedParams;
  category?: DocumentCategory | null;
  mode?: 'create' | 'edit';
}

interface CategorySelectFormValues {
  categoryName: string;
  type: string;
  appliedTo: DocumentCategoryAppliedTo;
  expiryReminderDays: string;
  docCategoryCompanyOuId: string;
}

const AddCategorySheet = ({
  open,
  onOpenChange,
  listParams,
  category,
  mode = 'create',
}: AddCategorySheetProps) => {
  const { t } = useTranslation('document');
  const { hasPermission } = usePermissions();
  const canCreateCategory = hasPermission('document_categories:create');
  const canUpdateCategory = hasPermission('document_categories:update');
  const createCategoryMutation = useCreateDocumentCategory();
  const updateCategoryMutation = useUpdateDocumentCategory();
  const isPending = createCategoryMutation.isPending || updateCategoryMutation.isPending;
  const buildInitialFormState = (): {
    name: string;
    type: string;
    description: string;
    required: boolean;
    appliedTo: DocumentCategoryAppliedTo;
    expiryRequired: boolean;
    expiryReminderDays: number;
    requireApproval: boolean;
    affectsCompliance: boolean;
    criticalDocument: boolean;
    allowedFileTypes: string[];
    maxFileSizeMb: string;
    organizationUnitIds: string[];
  } => ({
    name: mode === 'edit' && category ? (category.name ?? '') : '',
    type:
      mode === 'edit' && category
        ? normalizeCategoryTypeForForm(category.type)
        : 'identification',
    description: mode === 'edit' && category ? (category.description ?? '') : '',
    required: mode === 'edit' && category ? category.required : true,
    appliedTo:
      mode === 'edit' && category
        ? (category.appliedTo ?? DocumentCategoryAppliedTo.ALL_EMPLOYEES)
        : DocumentCategoryAppliedTo.ALL_EMPLOYEES,
    expiryRequired: mode === 'edit' && category ? category.expiryRequired : true,
    expiryReminderDays: mode === 'edit' && category ? (category.expiryReminderDays ?? 7) : 7,
    requireApproval: mode === 'edit' && category ? category.requireApproval : true,
    affectsCompliance: mode === 'edit' && category ? category.affectsCompliance : true,
    criticalDocument: mode === 'edit' && category ? category.criticalDocument : true,
    allowedFileTypes:
      mode === 'edit' && category
        ? (category.allowedFileTypes?.length ? category.allowedFileTypes : ['PDF', 'JPEG', 'PNG', 'DOC'])
        : ['PDF', 'JPEG', 'PNG', 'DOC'],
    maxFileSizeMb:
      mode === 'edit' && category
        ? (category.maxFileSizeMb ? `${category.maxFileSizeMb}` : '')
        : '',
    organizationUnitIds:
      mode === 'edit' && category
        ? (category.organizationUnitIds ?? [])
        : [],
  });

  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState(buildInitialFormState);
  const { control, register, setValue, watch } = useForm<CategorySelectFormValues>({
    defaultValues: {
      categoryName: formState.name,
      type: formState.type,
      appliedTo: formState.appliedTo,
      expiryReminderDays: `${formState.expiryReminderDays}`,
      docCategoryCompanyOuId: '',
    },
  });

  const canSubmit = useMemo(() => formState.name.trim().length > 0, [formState.name]);
  const typeOptions = useMemo(
    () => [
      { value: 'identification', label: t('addCategorySheet.typeOptions.identification') },
      { value: 'employment', label: t('addCategorySheet.typeOptions.employment') },
      { value: 'educational', label: t('addCategorySheet.typeOptions.educational') },
    ],
    [t],
  );
  const appliedToOptions = useMemo(
    () => [
      {
        value: DocumentCategoryAppliedTo.ALL_EMPLOYEES,
        label: t('addCategorySheet.appliedToOptions.allEmployees'),
      },
      {
        value: DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC,
        label: t('addCategorySheet.appliedToOptions.specificDepartment'),
      },
      {
        value: DocumentCategoryAppliedTo.FOREIGN_EMPLOYEE,
        label: t('addCategorySheet.appliedToOptions.foreignEmployees'),
      },
    ],
    [t],
  );

  const { data: hierarchy } = useOrganizationHierarchy();
  const { companies, isLoading: companiesLoading } = useCompanyOptions();
  const watchedCompanyOuId = watch('docCategoryCompanyOuId');
  const companySelectOptions = useMemo(() =>
    (companies ?? []).map((c) => ({
      label: c.name || c.displayLabel || c.id,
      value: c.id,
    })),
    [companies],
  );
  const ouOptions = useMemo(() => {
    if (!watchedCompanyOuId || !hierarchy) return [];
    return buildOrganizationUnitOptionsForCompany(hierarchy, watchedCompanyOuId);
  }, [watchedCompanyOuId, hierarchy]);

  const previousCompanyRef = useRef<string>('');
  useEffect(() => {
    if (previousCompanyRef.current !== '' && previousCompanyRef.current !== watchedCompanyOuId) {
      setFormState((prev) => ({ ...prev, organizationUnitIds: [] }));
    }
    previousCompanyRef.current = watchedCompanyOuId;
  }, [watchedCompanyOuId]);

  useEffect(() => {
    setValue('categoryName', formState.name);
    setValue('type', formState.type);
    setValue('appliedTo', formState.appliedTo);
    setValue('expiryReminderDays', `${formState.expiryReminderDays}`);
  }, [formState.name, formState.type, formState.appliedTo, formState.expiryReminderDays, setValue]);

  const toggleFileType = (typeValue: string) => {
    setFormState((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.includes(typeValue)
        ? prev.allowedFileTypes.filter((value) => value !== typeValue)
        : [...prev.allowedFileTypes, typeValue],
    }));
  };

  const resetForm = () => {
    setFormState({
      name: '',
      type: 'identification',
      description: '',
      required: true,
      appliedTo: DocumentCategoryAppliedTo.ALL_EMPLOYEES,
      expiryRequired: true,
      expiryReminderDays: 7,
      requireApproval: true,
      affectsCompliance: true,
      criticalDocument: true,
      allowedFileTypes: ['PDF', 'JPEG', 'PNG', 'DOC'],
      maxFileSizeMb: '',
      organizationUnitIds: [],
    });
    setValue('docCategoryCompanyOuId', '');
  };

  const handleSubmit = () => {
    setError(null);
    const allowed = mode === 'edit' ? canUpdateCategory : canCreateCategory;
    if (!allowed) {
      return;
    }
    if (!canSubmit) {
      setError(t('addCategorySheet.errors.categoryNameRequired'));
      return;
    }

    const parsedMaxSize = Number(formState.maxFileSizeMb);
    const maxFileSizeValue = Number.isFinite(parsedMaxSize) && parsedMaxSize > 0 ? parsedMaxSize : null;

    const payload = {
      name: formState.name.trim(),
      type: normalizeCategoryTypeForApi(formState.type),
      description: formState.description.trim() || null,
      required: formState.required,
      expiryRequired: formState.expiryRequired,
      expiryReminderDays: formState.expiryRequired ? formState.expiryReminderDays : null,
      appliedTo: formState.appliedTo,
      requireApproval: formState.requireApproval,
      affectsCompliance: formState.affectsCompliance,
      criticalDocument: formState.criticalDocument,
      allowedFileTypes: formState.allowedFileTypes,
      maxFileSizeMb: maxFileSizeValue,
      status: 'active',
      organizationUnitIds: formState.organizationUnitIds,
    };

    const onMutationError = (mutationError: Error) => {
      setError(mutationError.message);
    };

    const onMutationSuccess = () => {
      resetForm();
      onOpenChange(false);
    };

    if (mode === 'edit' && category?.id) {
      updateCategoryMutation.mutate(
        {
          id: category.id,
          input: payload,
          listParams,
          previous: category,
        },
        {
          onSuccess: onMutationSuccess,
          onError: onMutationError,
        },
      );
      return;
    }

    createCategoryMutation.mutate(
      {
        input: payload,
        listParams,
      },
      {
        onSuccess: onMutationSuccess,
        onError: onMutationError,
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex h-full flex-col gap-6 border-0 bg-background px-10 py-6 shadow-2xl sm:max-w-150"
      >
        <SheetHeader className="flex flex-row items-center justify-between p-0">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {mode === 'edit'
              ? t('addCategorySheet.titles.edit')
              : t('addCategorySheet.titles.create')}
          </SheetTitle>
          <SheetClose className="cursor-pointer rounded-lg text-foreground/80 transition-colors hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('common.cancel')}</span>
          </SheetClose>
        </SheetHeader>

        <Separator />

        <div className="no-scrollbar flex-1 overflow-y-auto">
          <div className="space-y-8">
          <FormSection title={t('addCategorySheet.sections.basicInfo')}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                id="categoryName"
                label={t('addCategorySheet.fields.categoryName')}
                placeholder={t('addCategorySheet.placeholders.categoryName')}
                register={register}
                name="categoryName"
                t={t}
                validation={{
                  onChange: (e) => setFormState((prev) => ({ ...prev, name: e.target.value })),
                }}
              />
              <FormSelect
                id="categoryType"
                label={t('addCategorySheet.fields.type')}
                placeholder={t('addCategorySheet.typeOptions.identification')}
                control={control}
                name="type"
                options={typeOptions}
                t={t}
                onChange={(value) => setFormState((prev) => ({ ...prev, type: value }))}
                containerClassName="flex flex-col gap-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">{t('addCategorySheet.fields.description')}</Label>
              <Textarea
                id="description"
                placeholder={t('addCategorySheet.placeholders.description')}
                className="min-h-25"
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
          </FormSection>

          <FormSection
            title={t('addCategorySheet.sections.requirementRules')}
            contentClassName="gap-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Switch id="required" checked={formState.required} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, required: value }))} />
                <Label htmlFor="required" className="cursor-pointer font-medium">
                  {t('addCategorySheet.fields.requiredDocument')}
                </Label>
              </div>
              <div className="flex w-full flex-col gap-1.5 sm:w-60">
                <FormSelect
                  id="appliedTo"
                  label={t('addCategorySheet.fields.appliedTo')}
                  placeholder={t('addCategorySheet.appliedToOptions.allEmployees')}
                  control={control}
                  name="appliedTo"
                  options={appliedToOptions}
                  t={t}
                  onChange={(value) =>
                    setFormState((prev) => ({ ...prev, appliedTo: value as DocumentCategoryAppliedTo }))
                  }
                  containerClassName="flex flex-col gap-1.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <Switch id="expiryRequired" checked={formState.expiryRequired} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, expiryRequired: value }))} />
                <Label htmlFor="expiryRequired" className="cursor-pointer font-medium">
                  {t('addCategorySheet.fields.expiryDateRequired')}
                </Label>
              </div>
              <FormSelect
                id="expiryReminder"
                label={t('addCategorySheet.fields.expiryReminder')}
                placeholder={t('addCategorySheet.expiryReminderOptions.days7')}
                control={control}
                name="expiryReminderDays"
                options={[
                  { value: '7', label: t('addCategorySheet.expiryReminderOptions.days7') },
                  { value: '15', label: t('addCategorySheet.expiryReminderOptions.days15') },
                  { value: '30', label: t('addCategorySheet.expiryReminderOptions.days30') },
                ]}
                t={t}
                disabled={!formState.expiryRequired}
                onChange={(value) => setFormState((prev) => ({ ...prev, expiryReminderDays: Number(value) }))}
                containerClassName="flex w-full flex-col gap-1.5 sm:w-60"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch id="requireApproval" checked={formState.requireApproval} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, requireApproval: value }))} />
              <Label htmlFor="requireApproval" className="font-medium cursor-pointer">
                {t('addCategorySheet.fields.requireApproval')}
              </Label>
            </div>
          </FormSection>

          {formState.appliedTo === DocumentCategoryAppliedTo.DEPARTMENT_SPECIFIC && (
            <FormSection title={t('addCategorySheet.sections.organizationUnits')}>
              <FormSelect
                id="docCategoryCompanyOuId"
                label={t('addCategorySheet.fields.selectCompany')}
                placeholder={t('addCategorySheet.placeholders.selectCompany')}
                control={control}
                name="docCategoryCompanyOuId"
                options={companySelectOptions}
                disabled={companiesLoading || companySelectOptions.length === 0}
                t={t}
              />
              {watchedCompanyOuId && (
                <div className="flex flex-col gap-2">
                  <Label>{t('addCategorySheet.fields.selectOUs')}</Label>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {(ouOptions ?? []).map((ou: { id: string; label: string }) => (
                      <div key={ou.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`ou-${ou.id}`}
                          checked={formState.organizationUnitIds.includes(ou.id)}
                          onCheckedChange={() => {
                            setFormState((prev) => ({
                              ...prev,
                              organizationUnitIds: prev.organizationUnitIds.includes(ou.id)
                                ? prev.organizationUnitIds.filter((id) => id !== ou.id)
                                : [...prev.organizationUnitIds, ou.id],
                            }));
                          }}
                        />
                        <Label htmlFor={`ou-${ou.id}`} className="text-sm font-normal cursor-pointer">
                          {ou.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </FormSection>
          )}

          <FormSection title={t('addCategorySheet.sections.complianceBehavior')}>
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:gap-x-12 sm:gap-y-4">
              <div className="flex min-w-0 items-center gap-3">
                <Switch id="affectsCompliance" checked={formState.affectsCompliance} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, affectsCompliance: value }))} />
                <Label htmlFor="affectsCompliance" className="cursor-pointer font-medium">
                  {t('addCategorySheet.fields.affectsComplianceStatus')}
                </Label>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <Switch id="criticalDocument" checked={formState.criticalDocument} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, criticalDocument: value }))} />
                <Label htmlFor="criticalDocument" className="cursor-pointer font-medium">
                  {t('addCategorySheet.fields.criticalDocument')}
                </Label>
              </div>
            </div>
          </FormSection>

          <FormSection title={t('addCategorySheet.sections.validationRules')}>
            <div className="flex flex-col gap-3">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('addCategorySheet.fields.allowedFileTypes')}
              </Label>
              <div className="flex flex-wrap gap-x-4 gap-y-3 sm:gap-x-6">
                <div className="flex items-center gap-2">
                  <Checkbox id="pdf" checked={formState.allowedFileTypes.includes('PDF')} onCheckedChange={() => toggleFileType('PDF')} />
                  <Label htmlFor="pdf" className="text-sm font-normal">
                    {t('addCategorySheet.fileTypeOptions.pdf')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="jpeg" checked={formState.allowedFileTypes.includes('JPEG')} onCheckedChange={() => toggleFileType('JPEG')} />
                  <Label htmlFor="jpeg" className="text-sm font-normal">
                    {t('addCategorySheet.fileTypeOptions.jpeg')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="png" checked={formState.allowedFileTypes.includes('PNG')} onCheckedChange={() => toggleFileType('PNG')} />
                  <Label htmlFor="png" className="text-sm font-normal">
                    {t('addCategorySheet.fileTypeOptions.png')}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="doc" checked={formState.allowedFileTypes.includes('DOC')} onCheckedChange={() => toggleFileType('DOC')} />
                  <Label htmlFor="doc" className="text-sm font-normal">
                    {t('addCategorySheet.fileTypeOptions.doc')}
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-60">
              <Label htmlFor="maxSize">{t('addCategorySheet.fields.maxFileSize')}</Label>
              <div className="relative">
                <Input
                  id="maxSize"
                  placeholder={t('addCategorySheet.placeholders.maxFileSize')}
                  className="pr-10"
                  value={formState.maxFileSizeMb}
                  onChange={(event) => setFormState((prev) => ({ ...prev, maxFileSizeMb: event.target.value }))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">
                  {t('addCategorySheet.units.mb')}
                </span>
              </div>
            </div>
          </FormSection>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <SheetFooter className="mt-auto shrink-0 border-t border-border">
          <div className="flex w-full justify-end gap-3 sm:w-auto">
            <SheetClose asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 min-w-25 flex-1 rounded-lg border-muted-foreground/20 px-4 font-medium text-foreground/80 hover:bg-muted sm:flex-none"
              >
                {t('common.cancel')}
              </Button>
            </SheetClose>
            <Button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={handleSubmit}
              className="h-9 min-w-25 flex-1 rounded-lg bg-primary px-4 font-medium text-[#FAFAFA] hover:bg-primary/80 sm:flex-none"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit'
                ? t('addCategorySheet.actions.saveChanges')
                : t('addCategorySheet.actions.createCategory')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategorySheet;
