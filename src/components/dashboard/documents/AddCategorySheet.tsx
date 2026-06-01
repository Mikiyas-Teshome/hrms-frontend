'use client';

import React, { useEffect, useMemo, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { FormField } from '@/components/ui/FormField';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { FormSelect } from '@/components/ui/FormSelect';
import { createDocumentCategory, updateDocumentCategory } from '@/features/documents/documents.actions';
import { DocumentCategory, DocumentCategoryAppliedTo } from '@/features/documents/documents.types';

interface AddCategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
  category?: DocumentCategory | null;
  mode?: 'create' | 'edit';
}

interface CategorySelectFormValues {
  categoryName: string;
  type: string;
  appliedTo: DocumentCategoryAppliedTo;
  expiryReminderDays: string;
}

const AddCategorySheet = ({
  open,
  onOpenChange,
  onCreated,
  category,
  mode = 'create',
}: AddCategorySheetProps) => {
  const { t } = useTranslation('document');
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
  } => ({
    name: mode === 'edit' && category ? (category.name ?? '') : '',
    type: mode === 'edit' && category ? (category.type ?? 'identification') : 'identification',
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
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState(buildInitialFormState);
  const { control, register, setValue } = useForm<CategorySelectFormValues>({
    defaultValues: {
      categoryName: formState.name,
      type: formState.type,
      appliedTo: formState.appliedTo,
      expiryReminderDays: `${formState.expiryReminderDays}`,
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
    });
  };

  const handleSubmit = () => {
    setError(null);
    if (!canSubmit) {
      setError(t('addCategorySheet.errors.categoryNameRequired'));
      return;
    }

    const parsedMaxSize = Number(formState.maxFileSizeMb);
    const maxFileSizeValue = Number.isFinite(parsedMaxSize) && parsedMaxSize > 0 ? parsedMaxSize : null;

    startTransition(async () => {
      const payload = {
        name: formState.name.trim(),
        type: formState.type,
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
      };

      const result = mode === 'edit' && category?.id
        ? await updateDocumentCategory(category.id, payload)
        : await createDocumentCategory(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      resetForm();
      onOpenChange(false);
      onCreated?.();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-150 overflow-y-auto p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle className="text-2xl font-bold">
            {mode === 'edit'
              ? t('addCategorySheet.titles.edit')
              : t('addCategorySheet.titles.create')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8 p-6 pt-2 pb-6">
          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t('addCategorySheet.sections.basicInfo')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-6">
            <h3 className="text-sm font-semibold text-foreground">
              {t('addCategorySheet.sections.requirementRules')}
            </h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="required" checked={formState.required} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, required: value }))} />
                <Label htmlFor="required" className="font-medium cursor-pointer">
                  {t('addCategorySheet.fields.requiredDocument')}
                </Label>
              </div>
              <div className="flex flex-col gap-1.5 w-60">
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="expiryRequired" checked={formState.expiryRequired} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, expiryRequired: value }))} />
                <Label htmlFor="expiryRequired" className="font-medium cursor-pointer">
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
                containerClassName="flex flex-col gap-1.5 w-60"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch id="requireApproval" checked={formState.requireApproval} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, requireApproval: value }))} />
              <Label htmlFor="requireApproval" className="font-medium cursor-pointer">
                {t('addCategorySheet.fields.requireApproval')}
              </Label>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t('addCategorySheet.sections.complianceBehavior')}
            </h3>
            <div className="flex gap-12">
              <div className="flex items-center gap-3">
                <Switch id="affectsCompliance" checked={formState.affectsCompliance} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, affectsCompliance: value }))} />
                <Label htmlFor="affectsCompliance" className="font-medium cursor-pointer">
                  {t('addCategorySheet.fields.affectsComplianceStatus')}
                </Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch id="criticalDocument" checked={formState.criticalDocument} onCheckedChange={(value) => setFormState((prev) => ({ ...prev, criticalDocument: value }))} />
                <Label htmlFor="criticalDocument" className="font-medium cursor-pointer">
                  {t('addCategorySheet.fields.criticalDocument')}
                </Label>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg border border-border flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              {t('addCategorySheet.sections.validationRules')}
            </h3>
            <div className="flex flex-col gap-3">
              <Label className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                {t('addCategorySheet.fields.allowedFileTypes')}
              </Label>
              <div className="flex gap-6">
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
            <div className="flex flex-col gap-2 w-60">
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
          </div>
        </div>

        {error && (
          <div className="px-6 pb-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <SheetFooter className="mt-4 px-6 pb-8 bg-transparent flex flex-row justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="min-w-25 border-primary text-primary hover:bg-primary/5 hover:text-primary">
            {t('common.cancel')}
          </Button>
          <Button
            className="min-w-37.5 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!canSubmit || isPending}
            onClick={handleSubmit}
          >
            {mode === 'edit'
              ? t('addCategorySheet.actions.saveChanges')
              : t('addCategorySheet.actions.createCategory')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default AddCategorySheet;
