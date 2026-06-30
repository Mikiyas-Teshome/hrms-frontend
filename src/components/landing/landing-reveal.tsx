'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type LandingRevealVariant = 'fade-up' | 'fade-in' | 'scale-up' | 'slide-left' | 'slide-right';

interface LandingRevealProps {
    children: ReactNode;
    className?: string;
    variant?: LandingRevealVariant;
    delay?: number;
    once?: boolean;
}

export function LandingReveal({
    children,
    className,
    variant = 'fade-up',
    delay = 0,
    once = true,
}: LandingRevealProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    if (once) observer.unobserve(node);
                } else if (!once) {
                    setVisible(false);
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -5% 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [once]);

    return (
        <div
            ref={ref}
            data-visible={visible}
            className={cn('landing-reveal', `landing-reveal-${variant}`, visible && 'is-visible', className)}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

interface LandingRevealStaggerProps {
    children: ReactNode;
    className?: string;
}

export function LandingRevealStagger({ children, className }: LandingRevealStaggerProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn('landing-reveal-stagger', visible && 'is-visible', className)}
        >
            {children}
        </div>
    );
}
