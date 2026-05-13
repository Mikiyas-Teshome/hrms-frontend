'use client';

import { CirclePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function UploadBox() {
    const { t } = useTranslation('companyProfile');

    return (
        <div className="flex min-h-29.5 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-background transition-colors hover:bg-muted/50">
            <CirclePlus className="size-5 text-muted-foreground/50" />
            <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground">{t('fields.logoHint')}</p>
                <p className="mt-1 text-[10px] font-sm text-muted-foreground">
                    {t('fields.logoSubtext')}
                </p>
            </div>
        </div>
    );
}
