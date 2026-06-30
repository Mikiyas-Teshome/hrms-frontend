'use client';

import { LandingHeader } from '@/components/landing/layout/landing-header';
import { LandingFooter } from '@/components/landing/layout/landing-footer';
import { LandingReveal } from '@/components/landing/landing-reveal';
import { LandingHero } from '@/components/landing/sections/landing-hero';
import { LandingTrustedBy } from '@/components/landing/sections/landing-trusted-by';
import { LandingFeatures } from '@/components/landing/sections/landing-features';
import { LandingStats } from '@/components/landing/sections/landing-stats';
import { LandingHowItWorks } from '@/components/landing/sections/landing-how-it-works';
import { LandingTestimonials } from '@/components/landing/sections/landing-testimonials';
import { LandingPricing } from '@/components/landing/sections/landing-pricing';
import { LandingFaq } from '@/components/landing/sections/landing-faq';
import { LandingContact } from '@/components/landing/sections/landing-contact';

export function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <LandingHeader />
            <main className="flex-1">
                <LandingHero />
                <LandingReveal variant="fade-up">
                    <LandingTrustedBy />
                </LandingReveal>
                <LandingReveal variant="fade-up">
                    <LandingFeatures />
                </LandingReveal>
                <LandingReveal variant="scale-up">
                    <LandingStats />
                </LandingReveal>
                <LandingReveal variant="slide-left">
                    <LandingHowItWorks />
                </LandingReveal>
                <LandingReveal variant="fade-up">
                    <LandingTestimonials />
                </LandingReveal>
                <LandingReveal variant="scale-up">
                    <LandingPricing />
                </LandingReveal>
                <LandingReveal variant="fade-up">
                    <LandingFaq />
                </LandingReveal>
                <LandingReveal variant="slide-right">
                    <LandingContact />
                </LandingReveal>
            </main>
            <LandingReveal variant="fade-in">
                <LandingFooter />
            </LandingReveal>
        </div>
    );
}
