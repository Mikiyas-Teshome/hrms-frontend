'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useWatch } from 'react-hook-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { X, Loader2 } from 'lucide-react';
import {
  uploadEmployeeDocument,
  fetchDocumentCategories,
  fetchEmployeeDocuments,
} from '@/features/documents/documents.actions';
import { fetchEmployeeDirectory } from '@/features/employee/employee.actions';
import { DocumentCategory } from '@/features/documents/documents.types';
import { EmployeeDirectoryEntry } from '@/features/employee/employee.types';
import { cn } from '@/lib/utils';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
  canCreateEmployeeDocument,
  canUploadDocumentsForOthers,
} from '@/features/documents/document-permission.util';
import { useMyEmployeeProfile } from '@/features/employee/hooks/useEmployee';

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

interface UploadEmployeeDocumentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded?: () => void;
  defaultOwnerId?: string;
}

interface UploadDocumentFormValues {
  ownerId: string;
  categoryId: string;
  expiryDate: string;
}

const UploadEmployeeDocumentSheet = ({
  open,
  onOpenChange,
  onUploaded,
  defaultOwnerId,
}: UploadEmployeeDocumentSheetProps) => {
  const { t } = useTranslation('document');
  const { hasPermission, hasScope, isSystemAdmin } = usePermissions();
  const canCreateDocument = canCreateEmployeeDocument(hasPermission, hasScope, isSystemAdmin);
  const canUploadForOthers = canUploadDocumentsForOthers(hasScope, isSystemAdmin);
  const { control, register, handleSubmit, reset, setValue } = useForm<UploadDocumentFormValues>({
    defaultValues: {
      ownerId: '',
      categoryId: '',
      expiryDate: '',
    },
  });
  const selectedOwnerId = useWatch({ control, name: 'ownerId' });
  const selectedCategoryId = useWatch({ control, name: 'categoryId' });
  const profileQuery = useMyEmployeeProfile({
    enabled: open && !canUploadForOthers && !defaultOwnerId,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState(t('uploadEmployeeDocumentSheet.file.noFileChosen'));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeeDirectoryEntry[]>([]);
  const [categories, setCategories] = useState<DocumentCategory[]>([]);
  const [usedCategoryIds, setUsedCategoryIds] = useState<Set<string>>(new Set());
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const activeOwnerId = useMemo(() => {
    if (canUploadForOthers) {
      return selectedOwnerId?.trim() ?? '';
    }
    return defaultOwnerId ?? profileQuery.data?.id ?? '';
  }, [canUploadForOthers, selectedOwnerId, defaultOwnerId, profileQuery.data?.id]);

  const resolvedUsedCategoryIds = useMemo(
    () => (canUploadForOthers && !activeOwnerId ? new Set<string>() : usedCategoryIds),
    [canUploadForOthers, activeOwnerId, usedCategoryIds],
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    let isMounted = true;
    const loadOptions = async () => {
      setIsLoadingOptions(true);
      const categoryResult = await fetchDocumentCategories();
      const employeeResult = canUploadForOthers ? await fetchEmployeeDirectory() : [];
      if (isMounted) {
        setEmployees(employeeResult);
        setCategories(categoryResult);
        setIsLoadingOptions(false);
      }
    };
    loadOptions();
    return () => {
      isMounted = false;
    };
  }, [canUploadForOthers, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (canUploadForOthers && !activeOwnerId) {
      return;
    }

    let isMounted = true;
    const loadUsedCategories = async () => {
      setIsLoadingCategories(true);
      const documentFilter =
        canUploadForOthers && activeOwnerId ? { ownerId: activeOwnerId } : undefined;
      const result = await fetchEmployeeDocuments({
        filter: documentFilter,
        pagination: { page: 1, size: 500 },
      });
      if (isMounted) {
        setUsedCategoryIds(new Set(result.data.map((document) => document.categoryId)));
        setIsLoadingCategories(false);
      }
    };

    loadUsedCategories();
    return () => {
      isMounted = false;
    };
  }, [open, activeOwnerId, canUploadForOthers]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setValue('categoryId', '');
  }, [activeOwnerId, open, setValue]);

  useEffect(() => {
    if (selectedCategoryId && resolvedUsedCategoryIds.has(selectedCategoryId)) {
      setValue('categoryId', '');
    }
  }, [selectedCategoryId, resolvedUsedCategoryIds, setValue]);

  const employeeOptions = useMemo(
    () =>
      employees.map((employee) => ({
        value: employee.id,
        label: `${employee.firstName} ${employee.lastName}`.trim(),
      })),
    [employees],
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((category) => !resolvedUsedCategoryIds.has(category.id))
        .map((category) => ({ label: category.name, value: category.id })),
    [categories, resolvedUsedCategoryIds],
  );

  const isCategorySelectDisabled =
    isLoadingOptions || isLoadingCategories || (canUploadForOthers && !activeOwnerId);

  const isOwnerReady = canUploadForOthers
    ? !!activeOwnerId
    : !!(defaultOwnerId ?? profileQuery.data?.id);

  const categoryPlaceholder = canUploadForOthers && !activeOwnerId
    ? t('uploadEmployeeDocumentSheet.placeholders.selectEmployeeFirst')
    : categoryOptions.length === 0 && activeOwnerId
      ? t('uploadEmployeeDocumentSheet.empty.noCategoryAvailable')
      : t('uploadEmployeeDocumentSheet.placeholders.selectCategory');

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setFileName(file?.name || t('uploadEmployeeDocumentSheet.file.noFileChosen'));
  };

  const onSubmit = (values: UploadDocumentFormValues) => {
    if (!canCreateDocument) {
      return;
    }
    if (!selectedFile) {
      return;
    }
    const resolvedOwnerId = canUploadForOthers ? values.ownerId : activeOwnerId;
    if (!resolvedOwnerId) {
      return;
    }
    if (!values.categoryId || resolvedUsedCategoryIds.has(values.categoryId)) {
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.append('ownerId', resolvedOwnerId);
    formData.append('categoryId', values.categoryId);
    if (values.expiryDate) {
      formData.append('expiryDate', values.expiryDate);
    }
    formData.append('file', selectedFile);

    startTransition(async () => {
      const result = await uploadEmployeeDocument(formData);
      if (!result.success) {
        console.error(result.error);
        setError(t('uploadEmployeeDocumentSheet.errors.uploadFailed'));
        return;
      }
      reset();
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
      setFileName(t('uploadEmployeeDocumentSheet.file.noFileChosen'));
      onOpenChange(false);
      onUploaded?.();
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex h-full flex-col gap-6 border-0 bg-background px-10 py-6 shadow-2xl sm:max-w-150"
      >
        <SheetHeader className="flex flex-row items-center justify-between p-0">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {t('uploadEmployeeDocumentSheet.title')}
          </SheetTitle>
          <SheetClose className="cursor-pointer rounded-lg text-foreground/80 transition-colors hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('common.cancel')}</span>
          </SheetClose>
        </SheetHeader>

        <Separator />

        <div className="no-scrollbar flex-1 overflow-y-auto">
          <form
            id="upload-employee-document-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <FormSection title={t('uploadEmployeeDocumentSheet.sections.documentInfo')}>
              {canUploadForOthers && (
                <FormSelect
                  id="employee"
                  label={t('uploadEmployeeDocumentSheet.fields.employee')}
                  placeholder={t('uploadEmployeeDocumentSheet.placeholders.selectEmployee')}
                  control={control}
                  name="ownerId"
                  options={employeeOptions}
                  t={t}
                  disabled={isLoadingOptions}
                  className="h-10"
                  containerClassName="flex w-full flex-col gap-2"
                />
              )}
              <FormSelect
                id="category"
                label={t('uploadEmployeeDocumentSheet.fields.category')}
                placeholder={categoryPlaceholder}
                control={control}
                name="categoryId"
                options={categoryOptions}
                t={t}
                disabled={isCategorySelectDisabled || categoryOptions.length === 0}
                className="h-10"
                containerClassName="flex w-full flex-col gap-2"
              />
              <FormField
                id="expiryDate"
                label={t('uploadEmployeeDocumentSheet.fields.expiryDate')}
                register={register}
                name="expiryDate"
                type="date"
                t={t}
                className="h-10 w-full"
              />
              <div className="flex w-full flex-col gap-2">
                <Label htmlFor="file" className="text-sm font-medium">
                  {t('uploadEmployeeDocumentSheet.fields.selectFile')}
                </Label>
                <div className="relative w-full">
                  <Input
                    key={fileInputKey}
                    ref={fileInputRef}
                    id="file"
                    name="file"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleChooseFile}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  >
                    <span className="truncate text-muted-foreground">{fileName}</span>
                    <span className="font-medium text-foreground underline underline-offset-4">
                      {t('uploadEmployeeDocumentSheet.file.chooseFile')}
                    </span>
                  </button>
                </div>
              </div>
            </FormSection>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </form>
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
              type="submit"
              form="upload-employee-document-form"
              disabled={
                isPending ||
                !isOwnerReady ||
                categoryOptions.length === 0 ||
                isCategorySelectDisabled
              }
              className="h-9 min-w-25 flex-1 rounded-lg bg-primary px-4 font-medium text-[#FAFAFA] hover:bg-primary/80 sm:flex-none"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? t('uploadEmployeeDocumentSheet.actions.uploading')
                : t('uploadEmployeeDocumentSheet.actions.uploadDocument')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default UploadEmployeeDocumentSheet;
