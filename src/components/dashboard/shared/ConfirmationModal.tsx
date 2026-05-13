'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ 
    open, 
    onOpenChange, 
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm,
    variant = 'danger',
    isLoading = false
}) => {
    const { t } = useTranslation('common');

    const handleConfirm = () => {
        onConfirm();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-122 w-[96%] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-[12px] [&>button]:hidden"
            >
                {/* Header */}
                <DialogHeader className="bg-card-header-background h-12.5 px-6 flex flex-row items-center justify-between space-y-0 shrink-0 border-b border-border/50">
                    <DialogTitle className="text-sm font-semibold text-foreground leading-none">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-8">
                    <p className="text-sm leading-[170%] text-foreground/80">
                        {message}
                    </p>

                    <DialogFooter className="flex flex-row justify-end gap-6 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 min-w-25"
                        >
                            {cancelLabel || t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className={cn(
                                "h-9 min-w-25 text-primary-foreground font-medium rounded-lg transition-colors",
                                variant === 'danger' ? "bg-destructive hover:bg-destructive/90 text-white" : "bg-primary hover:bg-primary/90"
                            )}
                        >
                            {isLoading ? t('loading', 'Loading...') : (confirmLabel || t('confirm', 'Confirm'))}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmationModal;
