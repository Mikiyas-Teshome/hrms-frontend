'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { landingNavigation } from '@/components/landing/layout/landing-navigation.config';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 12;

export function LandingHeader() {
    const { t } = useTranslation('landing');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={cn(
                'fixed top-0 z-50 w-full transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300',
                scrolled
                    ? 'border-b border-border/60 bg-background/80 shadow-sm backdrop-blur-md'
                    : 'border-b border-transparent bg-transparent',
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" className="flex items-center gap-2 rtl:flex-row-reverse">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                        <Building2 className="size-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-foreground">HRMS</span>
                </Link>

                <nav className="hidden items-center gap-8 md:flex">
                    {landingNavigation.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {t(item.labelKey)}
                        </a>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <Button variant="ghost" asChild>
                        <Link href="/login">{t('nav.login')}</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/company-signup">{t('nav.startTrial')}</Link>
                    </Button>
                </div>

                <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-lg border border-border md:hidden"
                    onClick={() => setMobileOpen((open) => !open)}
                    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                >
                    {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
            </div>

            <div
                className={cn(
                    'overflow-hidden md:hidden',
                    scrolled ? 'border-t border-border/60' : 'border-t border-transparent',
                    mobileOpen ? 'max-h-96' : 'max-h-0',
                )}
            >
                <nav
                    className={cn(
                        'flex flex-col gap-1 px-4 py-4',
                        scrolled ? 'bg-background/80 backdrop-blur-md' : 'bg-transparent',
                    )}
                >
                    {landingNavigation.map((item) => (
                        <a
                            key={item.id}
                            href={item.href}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                            onClick={() => setMobileOpen(false)}
                        >
                            {t(item.labelKey)}
                        </a>
                    ))}
                    <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
                        <div className="flex items-center justify-between px-1">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/login">{t('nav.login')}</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/company-signup">{t('nav.startTrial')}</Link>
                        </Button>
                    </div>
                </nav>
            </div>
        </header>
    );
}
