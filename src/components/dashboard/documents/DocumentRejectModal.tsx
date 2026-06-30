'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DocumentRejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName?: string;
  onConfirm: (rejectionReason?: string) => void;
  isLoading?: boolean;
}

interface DocumentRejectModalBodyProps {
  documentName?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: (rejectionReason?: string) => void;
  isLoading: boolean;
}

const DocumentRejectModalBody = ({
  documentName,
  onOpenChange,
  onConfirm,
  isLoading,
}: DocumentRejectModalBodyProps) => {
  const { t } = useTranslation(['document', 'common']);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    const trimmed = rejectionReason.trim();
    onConfirm(trimmed || undefined);
  };

  return (
    <div className="space-y-6 p-6">
      <p className="text-sm leading-[170%] text-foreground/80">
        {documentName
          ? t('employeeDocuments.rejectModal.messageWithName', { name: documentName })
          : t('employeeDocuments.rejectModal.message')}
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="document-rejection-reason" className="text-sm font-medium text-foreground">
          {t('employeeDocuments.rejectModal.reasonLabel')}
        </label>
        <Textarea
          id="document-rejection-reason"
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder={t('employeeDocuments.rejectModal.reasonPlaceholder')}
          className="min-h-24 resize-none"
        />
      </div>

      <DialogFooter className="flex flex-row justify-end gap-6 sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
          className="h-9 min-w-25"
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading}
          className={cn(
            'h-9 min-w-25 rounded-lg bg-destructive font-medium text-white transition-colors hover:bg-destructive/90',
          )}
        >
          {isLoading
            ? t('loading', { ns: 'common', defaultValue: 'Loading...' })
            : t('employeeDocuments.rejectModal.confirm')}
        </Button>
      </DialogFooter>
    </div>
  );
};

const DocumentRejectModal = ({
  open,
  onOpenChange,
  documentName,
  onConfirm,
  isLoading = false,
}: DocumentRejectModalProps) => {
  const { t } = useTranslation('document');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-122 w-[96%] overflow-hidden rounded-[12px] border border-border bg-card p-0 shadow-2xl [&>button]:hidden">
        <DialogHeader className="flex h-12.5 shrink-0 flex-row items-center justify-between space-y-0 border-b border-border/50 bg-card-header-background px-6">
          <DialogTitle className="text-sm font-semibold leading-none text-foreground">
            {t('employeeDocuments.rejectModal.title')}
          </DialogTitle>
        </DialogHeader>

        {open ? (
          <DocumentRejectModalBody
            key={documentName ?? 'reject-document'}
            documentName={documentName}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            isLoading={isLoading}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentRejectModal;
