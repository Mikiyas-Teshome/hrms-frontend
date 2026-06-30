'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
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
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, ExternalLink, FileText, Loader2, Maximize2, PencilLine, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateString } from '@/lib/date-utils';
import { FormField } from '@/components/ui/FormField';
import { FormSelect } from '@/components/ui/FormSelect';
import { fetchDocumentFilePreview } from '@/features/documents/documents.actions';
import {
  DocumentApprovalState,
  DocumentCategory,
  DocumentComplianceStatus,
  EmployeeDocumentRow,
} from '@/features/documents/documents.types';

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

const DetailField = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="rounded-lg border border-border/80 bg-background p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
    <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
  </div>
);

const getFileExtension = (fileName: string) => fileName.split('.').pop()?.toLowerCase() ?? '';

interface EditFormValues {
  categoryId: string;
  expiryDate: string;
}

interface EmployeeDocumentDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: EmployeeDocumentRow | null;
  mode: 'view' | 'edit';
  categories: DocumentCategory[];
  dateLocale: string;
  isCompanyScopeEditor: boolean;
  canEdit: boolean;
  onEdit?: () => void;
  onSave: (params: {
    id: string;
    categoryId?: string;
    expiryDate?: string;
    replaceFile?: File | null;
  }) => Promise<boolean>;
  getComplianceMeta: (
    status?: DocumentComplianceStatus,
    approvalState?: DocumentApprovalState,
  ) => {
    label: string;
    className: string;
    dotClassName: string;
  };
  getApprovalLabel: (state?: DocumentApprovalState) => string;
}

interface EmployeeDocumentDetailBodyProps {
  document: EmployeeDocumentRow;
  mode: 'view' | 'edit';
  categories: DocumentCategory[];
  dateLocale: string;
  isCompanyScopeEditor: boolean;
  canEdit: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onSave: EmployeeDocumentDetailSheetProps['onSave'];
  getComplianceMeta: EmployeeDocumentDetailSheetProps['getComplianceMeta'];
  getApprovalLabel: EmployeeDocumentDetailSheetProps['getApprovalLabel'];
}

const EmployeeDocumentFilePreview = ({
  documentId,
  documentName,
  onReady,
}: {
  documentId: string;
  documentName: string;
  onReady?: (url: string | null) => void;
}) => {
  const { t } = useTranslation('document');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(true);
  const [fileError, setFileError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileExtension = getFileExtension(documentName);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);
  const isPdf = fileExtension === 'pdf';
  const supportsFullscreen = isImage || isPdf;

  useEffect(() => {
    let isMounted = true;
    fetchDocumentFilePreview(documentId).then((result) => {
      if (!isMounted) {
        return;
      }
      const url = result.success ? result.data.dataUrl : null;
      setFileUrl(url);
      setFileError(!result.success);
      setFileLoading(false);
      onReady?.(url);
    });
    return () => {
      isMounted = false;
    };
  }, [documentId, onReady]);

  useEffect(() => {
    if (!isFullscreen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  if (fileLoading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (fileError || !fileUrl) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-4 text-center text-sm text-muted-foreground">
        {t('employeeDocuments.detail.loadFileError')}
      </div>
    );
  }

  const renderPreviewContent = (fullscreen: boolean) => {
    if (isImage) {
      return (
        <div
          className={cn(
            'relative',
            fullscreen ? 'h-full w-full min-h-0' : 'h-80 w-full',
          )}
        >
          <Image
            src={fileUrl}
            alt={documentName}
            fill
            unoptimized
            sizes={fullscreen ? '100vw' : '(max-width: 768px) 100vw, 768px'}
            className="object-contain"
          />
        </div>
      );
    }
    if (isPdf) {
      return (
        <iframe
          src={fileUrl}
          title={documentName}
          className={cn('w-full bg-background', fullscreen ? 'h-full min-h-0 flex-1' : 'h-80')}
        />
      );
    }
    return null;
  };

  if (!supportsFullscreen) {
    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between rounded-lg border border-border bg-background p-4 shadow-sm transition-colors hover:bg-muted/40 no-underline"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
            <FileText className="h-5 w-5 text-red-500" />
          </div>
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="truncate text-sm font-medium text-foreground">{documentName}</span>
            <span className="text-xs text-muted-foreground">{t('employeeDocuments.detail.openFile')}</span>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  return (
    <>
      <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/20">
        {renderPreviewContent(false)}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8 bg-background/90 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus:opacity-100"
          onClick={() => setIsFullscreen(true)}
          aria-label={t('employeeDocuments.detail.fullScreen')}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {isFullscreen ? (
        <div className="fixed inset-0 z-[200] flex flex-col bg-black/95">
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-white">
            <span className="truncate text-sm font-medium">{documentName}</span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setIsFullscreen(false)}
              aria-label={t('employeeDocuments.detail.exitFullScreen')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative min-h-0 flex-1 p-4">
            {renderPreviewContent(true)}
          </div>
        </div>
      ) : null}
    </>
  );
};

const EmployeeDocumentDetailBody = ({
  document,
  mode,
  categories,
  dateLocale,
  isCompanyScopeEditor,
  canEdit,
  onOpenChange,
  onEdit,
  onSave,
  getComplianceMeta,
  getApprovalLabel,
}: EmployeeDocumentDetailBodyProps) => {
  const { t } = useTranslation('document');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileLoading, setFileLoading] = useState(true);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceFileName, setReplaceFileName] = useState('');
  const [isPending, startTransition] = useTransition();
  const { control, register, handleSubmit } = useForm<EditFormValues>({
    defaultValues: {
      categoryId: document.categoryId || '',
      expiryDate: document.expiryDate ?? '',
    },
  });

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.id })),
    [categories],
  );

  const complianceMeta = getComplianceMeta(document.compliance, document.approvalState);
  const canReplaceFile =
    document.approvalState === DocumentApprovalState.PENDING ||
    document.approvalState === DocumentApprovalState.REJECTED;

  const handleFilePreviewReady = React.useCallback((url: string | null) => {
    setFileUrl(url);
    setFileLoading(false);
  }, []);

  const handleDownload = () => {
    if (!fileUrl) {
      return;
    }
    const link = window.document.createElement('a');
    link.href = fileUrl;
    link.download = document.documentName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setReplaceFile(file);
    setReplaceFileName(file?.name ?? '');
  };

  const submitEdit = (values: EditFormValues) => {
    startTransition(async () => {
      const ok = await onSave({
        id: document.id,
        categoryId: isCompanyScopeEditor ? values.categoryId : undefined,
        expiryDate: values.expiryDate || undefined,
        replaceFile,
      });
      if (ok) {
        onOpenChange(false);
      }
    });
  };

  return (
    <>
      <div className="no-scrollbar flex-1 overflow-y-auto">
        {mode === 'view' ? (
          <div className="space-y-6">
            {document.approvalState === DocumentApprovalState.REJECTED && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700">
                {t('employeeDocuments.detail.rejectedBanner')}
              </div>
            )}
            <FormSection title={t('employeeDocuments.detail.file')}>
              <EmployeeDocumentFilePreview
                key={document.id}
                documentId={document.id}
                documentName={document.documentName}
                onReady={handleFilePreviewReady}
              />
            </FormSection>

            <FormSection title={t('employeeDocuments.detail.documentInfo')}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailField label={t('employeeDocuments.modal.fields.name')} value={document.documentName} />
                <DetailField label={t('employeeDocuments.modal.fields.employee')} value={document.ownerName} />
                <DetailField label={t('employeeDocuments.modal.fields.category')} value={document.categoryName} />
                <DetailField
                  label={t('employeeDocuments.modal.fields.expiry')}
                  value={document.expiryDate ? formatDateString(document.expiryDate, dateLocale) : '-'}
                />
                <DetailField
                  label={t('employeeDocuments.modal.fields.compliance')}
                  value={
                    <Badge variant="outline" className={complianceMeta.className}>
                      <div className={cn('mr-1.5 h-1.5 w-1.5 rounded-full', complianceMeta.dotClassName)} />
                      {complianceMeta.label}
                    </Badge>
                  }
                />
                <DetailField
                  label={t('employeeDocuments.modal.fields.approval')}
                  value={getApprovalLabel(document.approvalState)}
                />
                <DetailField label={t('employeeDocuments.detail.uploadedBy')} value={document.uploadedBy || '-'} />
              </div>
            </FormSection>
          </div>
        ) : (
          <form id="employee-document-edit-form" onSubmit={handleSubmit(submitEdit)} className="space-y-8">
            <FormSection title={t('employeeDocuments.detail.file')}>
              <EmployeeDocumentFilePreview
                key={document.id}
                documentId={document.id}
                documentName={document.documentName}
              />
            </FormSection>

            <FormSection title={t('employeeDocuments.detail.documentInfo')}>
              <DetailField label={t('employeeDocuments.modal.fields.name')} value={document.documentName} />
              {isCompanyScopeEditor && (
                <FormSelect
                  id="modal-category"
                  label={t('employeeDocuments.modal.fields.category')}
                  control={control}
                  name="categoryId"
                  options={categoryOptions}
                  t={t}
                  className="h-10"
                  containerClassName="flex w-full flex-col gap-2"
                />
              )}
              <FormField
                id="modal-expiry"
                label={t('employeeDocuments.modal.fields.expiry')}
                register={register}
                name="expiryDate"
                type="date"
                t={t}
                className="h-10 w-full"
              />
              {canReplaceFile && (
                <div className="flex w-full flex-col gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {t('uploadEmployeeDocumentSheet.fields.selectFile')}
                  </span>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <button
                    type="button"
                    onClick={handleChooseFile}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <span className="truncate text-muted-foreground">
                      {replaceFileName || t('uploadEmployeeDocumentSheet.file.noFileChosen')}
                    </span>
                    <span className="font-medium text-foreground underline underline-offset-4">
                      {t('uploadEmployeeDocumentSheet.file.chooseFile')}
                    </span>
                  </button>
                </div>
              )}
            </FormSection>
          </form>
        )}
      </div>

      <SheetFooter className="mt-auto shrink-0 border-t border-border">
        <div className="flex w-full flex-wrap justify-end gap-3 sm:w-auto">
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              className="h-9 min-w-25 flex-1 rounded-lg border-muted-foreground/20 px-4 font-medium text-foreground/80 hover:bg-muted sm:flex-none"
            >
              {mode === 'view' ? t('common.close') : t('common.cancel')}
            </Button>
          </SheetClose>
          {mode === 'view' && (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={!fileUrl || fileLoading}
                onClick={handleDownload}
                className="h-9 min-w-25 flex-1 gap-2 rounded-lg px-4 font-medium sm:flex-none"
              >
                <Download className="h-4 w-4" />
                {t('employeeDocuments.actions.download')}
              </Button>
              {canEdit && onEdit && (
                <Button
                  type="button"
                  onClick={onEdit}
                  className="h-9 min-w-25 flex-1 gap-2 rounded-lg bg-primary px-4 font-medium text-[#FAFAFA] hover:bg-primary/80 sm:flex-none"
                >
                  <PencilLine className="h-4 w-4" />
                  {t('employeeDocuments.actions.edit')}
                </Button>
              )}
            </>
          )}
          {mode === 'edit' && (
            <Button
              type="submit"
              form="employee-document-edit-form"
              disabled={isPending}
              className="h-9 min-w-25 flex-1 rounded-lg bg-primary px-4 font-medium text-[#FAFAFA] hover:bg-primary/80 sm:flex-none"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('common.save')}
            </Button>
          )}
        </div>
      </SheetFooter>
    </>
  );
};

const EmployeeDocumentDetailSheet = ({
  open,
  onOpenChange,
  document,
  mode,
  categories,
  dateLocale,
  isCompanyScopeEditor,
  canEdit,
  onEdit,
  onSave,
  getComplianceMeta,
  getApprovalLabel,
}: EmployeeDocumentDetailSheetProps) => {
  const { t } = useTranslation('document');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex h-full flex-col gap-6 border-0 bg-background px-10 py-6 shadow-2xl sm:max-w-150"
      >
        <SheetHeader className="flex flex-row items-center justify-between p-0">
          <SheetTitle className="pr-4 text-2xl font-bold text-foreground">
            {mode === 'view'
              ? t('employeeDocuments.modal.viewTitle')
              : t('employeeDocuments.modal.editTitle')}
          </SheetTitle>
          <SheetClose className="cursor-pointer rounded-lg text-foreground/80 transition-colors hover:text-foreground">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t('common.close')}</span>
          </SheetClose>
        </SheetHeader>

        <Separator />

        {!document ? (
          <p className="text-sm text-muted-foreground">{t('employeeDocuments.modal.notFound')}</p>
        ) : open ? (
          <EmployeeDocumentDetailBody
            key={`${document.id}-${mode}`}
            document={document}
            mode={mode}
            categories={categories}
            dateLocale={dateLocale}
            isCompanyScopeEditor={isCompanyScopeEditor}
            canEdit={canEdit}
            onOpenChange={onOpenChange}
            onEdit={onEdit}
            onSave={onSave}
            getComplianceMeta={getComplianceMeta}
            getApprovalLabel={getApprovalLabel}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
};

export default EmployeeDocumentDetailSheet;
