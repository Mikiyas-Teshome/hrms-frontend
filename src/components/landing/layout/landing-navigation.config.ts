import type { LandingNavId } from '@/data/landing';

export interface LandingNavItem {
    id: LandingNavId;
    href: string;
    labelKey: string;
}

export const landingNavigation: LandingNavItem[] = [
    { id: 'home', href: '#home', labelKey: 'nav.home' },
    { id: 'features', href: '#features', labelKey: 'nav.features' },
    { id: 'howItWorks', href: '#how-it-works', labelKey: 'nav.howItWorks' },
    { id: 'pricing', href: '#pricing', labelKey: 'nav.pricing' },
    { id: 'faq', href: '#faq', labelKey: 'nav.faq' },
    { id: 'contact', href: '#contact', labelKey: 'nav.contact' },
];
