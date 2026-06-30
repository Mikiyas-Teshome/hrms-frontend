'use client';

import { useTranslation } from 'react-i18next';
import { useProfile } from '@/features/auth/hooks/useAuth';

interface DashboardWelcomeHeaderProps {
  subtitle: string;
}

export function DashboardWelcomeHeader({ subtitle }: DashboardWelcomeHeaderProps) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.language === 'ar';
  const { data: user } = useProfile();
  const firstName = user?.firstName || (isRTL ? 'راشيل' : 'Rachel');

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold leading-8 text-foreground">
        {t('header.welcome', { name: firstName })}
      </h1>
      <p className="text-base font-normal leading-6 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
