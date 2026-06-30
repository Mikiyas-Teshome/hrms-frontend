'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { landingFaqItems } from '@/data/landing';
import { cn } from '@/lib/utils';

export function LandingFaq() {
    const { t } = useTranslation('landing');
    const [openId, setOpenId] = useState<string | null>(landingFaqItems[0]?.id ?? null);

    return (
        <section id="faq" className="bg-muted/30 py-20 sm:py-28">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {t('faq.title')}
                </h2>

                <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
                    {landingFaqItems.map((item) => (
                        <Collapsible
                            key={item.id}
                            open={openId === item.id}
                            onOpenChange={(open) => setOpenId(open ? item.id : null)}
                        >
                            <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-6 py-5 text-start transition-colors hover:bg-muted/50">
                                <span className="font-medium text-foreground">
                                    {t(`faq.items.${item.id}.question`)}
                                </span>
                                <ChevronDown
                                    className={cn(
                                        'size-4 shrink-0 text-muted-foreground transition-transform',
                                        openId === item.id && 'rotate-180',
                                    )}
                                />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="px-6 pb-5">
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    {t(`faq.items.${item.id}.answer`)}
                                </p>
                            </CollapsibleContent>
                        </Collapsible>
                    ))}
                </div>
            </div>
        </section>
    );
}
