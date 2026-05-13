'use client';

import React, { useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ImportEmployeesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ImportEmployeesModal: React.FC<ImportEmployeesModalProps> = ({ open, onOpenChange }) => {
    const { t } = useTranslation('employees');
    const [fileName, setFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    const handleChooseFile = () => {
        fileInputRef.current?.click();
    };

    const handleImport = () => {
        // Handle import logic
        onOpenChange(false);
        setFileName('');
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent 
                className="max-w-161 p-0 overflow-hidden border-border/80 shadow-xs rounded-[12px] [&>button]:hidden"
            >
                {/* Header */}
                <DialogHeader className="bg-card-header-background h-12.5 px-6 flex flex-row items-center justify-between space-y-0 shrink-0">
                    <DialogTitle className="text-sm font-semibold text-foreground leading-none">
                        {t('importEmployeesData')}
                    </DialogTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="h-9 px-4 text-primary hover:text-primary/80 hover:bg-transparent font-medium text-sm flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            {t('downloadSampleTemplate')}
                        </Button>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-8">
                    {/* File Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                            {t('selectFile')}
                        </label>
                        <div 
                            className="flex items-center justify-between px-3 py-1 h-9 rounded-lg border border-border bg-background shadow-xs cursor-pointer"
                            onClick={handleChooseFile}
                        >
                            <span className={cn(
                                "text-sm",
                                fileName ? "text-foreground" : "text-muted-foreground"
                            )}>
                                {fileName || t('noFileChosen')}
                            </span>
                            <span className="text-sm font-medium text-secondary-foreground px-2 py-1 bg-secondary rounded-md">
                                {t('chooseFile')}
                            </span>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileChange}
                                accept=".csv,.xlsx,.xls"
                            />
                        </div>
                    </div>

                    {/* Info Alert */}
                    <div className="flex gap-3 p-3 bg-primary/5 border border-primary/10 dark:border-primary/50 rounded-[12px] text-foreground/80 items-start">
                        <div className="mt-0.5">
                            <Info className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm leading-[1.2]">
                            {t('importDescription')}
                        </p>
                    </div>

                    {/* Footer / Buttons */}
                    <DialogFooter className="flex flex-row justify-end gap-6 sm:justify-end">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 min-w-25 border-muted-foreground text-foreground/80 hover:text-foreground font-medium rounded-lg"
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            onClick={handleImport}
                            disabled={!fileName}
                            className="h-9 min-w-26.75 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg"
                        >
                            {t('importData')}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ImportEmployeesModal;
