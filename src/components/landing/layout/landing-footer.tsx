'use client';

import Link from 'next/link';
import { Building2, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { footerLinkGroups } from '@/data/landing';

const footerHrefMap: Record<string, string> = {
    features: '#features',
    pricing: '#pricing',
    faq: '#faq',
    privacy: '/privacy',
    terms: '/terms',
    about: '#',
    careers: '#',
    contact: '#contact',
    blog: '#',
    helpCenter: '#',
    documentation: '#',
};

export function LandingFooter() {
    const { t } = useTranslation('landing');
    const year = new Date().getFullYear();

    return (
        <footer className="bg-foreground text-background">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="grid gap-12 lg:grid-cols-2">
                    <div className="max-w-md">
                        <h3 className="text-xl font-semibold">{t('footer.newsletter.title')}</h3>
                        <p className="mt-3 text-sm text-background/70">
                            {t('footer.newsletter.subtitle')}
                        </p>
                        <form
                            className="mt-6 flex gap-2"
                            onSubmit={(event) => event.preventDefault()}
                        >
                            <Input
                                type="email"
                                placeholder={t('footer.newsletter.placeholder')}
                                className="h-10 border-background/20 bg-background/10 text-background placeholder:text-background/50"
                            />
                            <Button
                                type="submit"
                                className="h-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {t('footer.newsletter.cta')}
                            </Button>
                        </form>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
                        {footerLinkGroups.map((group) => (
                            <div key={group.id}>
                                <h4 className="text-sm font-semibold">
                                    {t(`footer.groups.${group.id}`)}
                                </h4>
                                <ul className="mt-4 space-y-3">
                                    {group.links.map((link) => (
                                        <li key={link}>
                                            <Link
                                                href={footerHrefMap[link] ?? '#'}
                                                className="text-sm text-background/70 transition-colors hover:text-background"
                                            >
                                                {t(`footer.links.${link}`)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 sm:flex-row">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                            <Building2 className="size-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold">HRMS</span>
                    </div>
                    <p className="text-sm text-background/60">
                        {t('footer.copyright', { year })}
                    </p>
                    <div className="flex items-center gap-4">
                        <a
                            href="#"
                            className="text-background/60 transition-colors hover:text-background"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="size-4" />
                        </a>
                        <a
                            href="#"
                            className="text-background/60 transition-colors hover:text-background"
                            aria-label="Twitter"
                        >
                            <Twitter className="size-4" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
