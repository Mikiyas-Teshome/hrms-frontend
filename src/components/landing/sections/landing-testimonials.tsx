'use client';

import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { LandingAvatar } from '@/components/landing/landing-avatar';
import { LandingRevealStagger } from '@/components/landing/landing-reveal';
import { landingTestimonials } from '@/data/landing';

export function LandingTestimonials() {
    const { t } = useTranslation('landing');

    return (
        <section className="bg-muted/30 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t('testimonials.title')}
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        {t('testimonials.subtitle')}
                    </p>
                </div>

                <LandingRevealStagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {landingTestimonials.map((testimonial) => (
                        <Card
                            key={testimonial.id}
                            className="border-border/60 bg-card transition-shadow hover:shadow-lg"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <LandingAvatar
                                        alt={t(`testimonials.items.${testimonial.id}.name`)}
                                        size="lg"
                                        initials={testimonial.initials}
                                        src={testimonial.image}
                                    />
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {t(`testimonials.items.${testimonial.id}.name`)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {t(`testimonials.items.${testimonial.id}.role`)}
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                    &ldquo;{t(`testimonials.items.${testimonial.id}.quote`)}&rdquo;
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </LandingRevealStagger>
            </div>
        </section>
    );
}
