'use client';

import { useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from 'react-i18next';
import { SectionLayout } from '../SectionLayout';

interface NotificationValues {
    notifyByEmail: boolean;
    notifyByPush: boolean;
    communicationEmails: boolean;
    marketingEmails: boolean;
    socialEmails: boolean;
    securityEmails: boolean;
}

export function NotificationSection() {
    const { t } = useTranslation('settings');
    const { watch, setValue } = useForm<NotificationValues>({
        defaultValues: {
            notifyByEmail: true,
            notifyByPush: true,
            communicationEmails: true,
            marketingEmails: true,
            socialEmails: false,
            securityEmails: true,
        },
    });

    const values = watch();

    const toggle = (key: keyof NotificationValues) =>
        setValue(key, !values[key]);

    // TODO: wire to backend – submit handler receives values
    const handleSave = () => { /* call API */ };

    const emailNotifications: { key: keyof NotificationValues; label: string; desc: string }[] = [
        { 
            key: 'communicationEmails', 
            label: t('notification.communication', 'Communication emails'), 
            desc: t('notification.communicationDesc', 'Send notifications to device.') 
        },
        { 
            key: 'marketingEmails', 
            label: t('notification.marketing', 'Marketing emails'), 
            desc: t('notification.marketingDesc', 'Receive emails about new products, features, and more.') 
        },
        { 
            key: 'socialEmails', 
            label: t('notification.social', 'Social emails'), 
            desc: t('notification.socialDesc', 'Receive emails for friend requests, follows, and more.') 
        },
        { 
            key: 'securityEmails', 
            label: t('notification.security', 'Security emails'), 
            desc: t('notification.securityDesc', 'Receive emails about your account activity and security.') 
        },
    ];

    return (
        <SectionLayout 
            title={t('notification.title', 'Notification')} 
            description={t('notification.description', 'Notification and email configuration.')}
        >
            {/* Notify me by */}
            <div className="flex flex-col gap-3">
                <Label className="text-sm font-semibold text-foreground">{t('notification.notifyMeBy', 'Notify me by')}</Label>
                <div className="flex flex-col gap-2">
                    {[
                        { key: 'notifyByEmail' as const, label: t('notification.email', 'Email') },
                        { key: 'notifyByPush' as const, label: t('notification.push', 'Push notifications') },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => toggle(item.key)}
                            className="flex items-center gap-2.5 w-fit"
                        >
                            <div className="w-4 h-4 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                                {values[item.key] && (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                            </div>
                            <span className="text-sm text-foreground">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-border" />

            {/* Email notifications */}
            <div className="flex flex-col gap-4">
                <Label className="text-sm font-semibold text-foreground">{t('notification.emailNotifications', 'Email Notifications')}</Label>
                {emailNotifications.map((item) => (
                    <div key={item.key} className="flex items-start justify-between gap-8">
                        <div>
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                        </div>
                        <Switch
                            checked={values[item.key]}
                            onCheckedChange={() => toggle(item.key)}
                            className="shrink-0 mt-0.5"
                        />
                    </div>
                ))}
            </div>

            <div className="pt-2">
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white h-9 px-5 rounded-lg">
                    {t('saveChange', 'Save change')}
                </Button>
            </div>
        </SectionLayout>
    );
}
