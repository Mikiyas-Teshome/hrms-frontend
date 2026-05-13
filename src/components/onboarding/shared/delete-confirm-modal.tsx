'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isRtl?: boolean;
}

export function DeleteConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText,
    cancelText,
    isRtl,
}: DeleteConfirmModalProps) {
    const { t } = useTranslation('deleteConfirm');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-100 p-6 rounded-[24px] border border-border shadow-xl [&>button:last-child]:hidden">
                <DialogHeader className={cn('space-y-0 text-center')}>
                    <DialogTitle className="sr-only">{title || 'Confirm Deletion'}</DialogTitle>
                    <DialogDescription className="text-[16px] font-medium leading-normal pt-4 pb-6 text-center text-foreground">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="grid grid-cols-2 gap-4 sm:space-x-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={cn(
                            'h-[40px] rounded-[8px] text-[14px] font-medium border-border text-primary hover:bg-muted',
                            isRtl && 'order-2',
                        )}
                    >
                        {cancelText || t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={cn(
                            'h-[40px] rounded-[8px] text-[14px] font-medium bg-red-500 text-white hover:bg-red-600',
                            isRtl && 'ml-0 mr-4 order-1',
                        )}
                    >
                        {confirmText || t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
