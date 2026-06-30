'use client';

import { useTranslation } from 'react-i18next';

interface StaffSignupCompanyInfoProps {
    companyName?: string;
    companyEmail?: string | null;
    showTitle?: boolean;
}

export function StaffSignupCompanyInfo({
    companyName,
    companyEmail,
    showTitle = true,
}: StaffSignupCompanyInfoProps) {
    const { t } = useTranslation('staffSignup');

    return (
        <div className="flex w-full flex-col gap-6 text-start">
            {showTitle && (
                <div className="flex flex-col items-start gap-2">
                    <h1 className="text-xl font-semibold text-foreground">
                        {t('banner.title')}
                    </h1>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-foreground">{t('banner.companyLabel')}</p>
                <p className="text-sm leading-5 text-muted-foreground">
                    {companyName || t('banner.companyName')}
                </p>
                {companyEmail ? (
                    <p className="text-sm leading-5 text-muted-foreground">{companyEmail}</p>
                ) : null}
            </div>
        </div>
    );
}
