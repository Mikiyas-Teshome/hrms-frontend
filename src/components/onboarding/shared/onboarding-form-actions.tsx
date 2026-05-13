'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OnboardingFormActionsProps {
    onBack?: () => void;
    onContinue?: () => void;
    backLabel: string;
    continueLabel: string;
    isSubmitting?: boolean;
    continueType?: 'button' | 'submit';
    showBorder?: boolean;
    className?: string;
}

export function OnboardingFormActions({
    onBack,
    onContinue,
    backLabel,
    continueLabel,
    isSubmitting = false,
    continueType = 'submit',
    showBorder = false,
    className,
}: OnboardingFormActionsProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between pt-8',
                showBorder && 'border-t border-muted',
                className,
            )}
        >
            <Button
                type="button"
                variant="ghost"
                onClick={onBack}
                className="cursor-pointer flex items-center gap-2 transition-transform hover:-translate-x-1 rtl:hover:translate-x-1 rtl:flex-row-reverse"
            >
                <ArrowLeft className="cursor-pointer size-4 rtl:rotate-180" />
                {backLabel}
            </Button>
            <Button
                type={continueType}
                size="lg"
                onClick={onContinue}
                disabled={isSubmitting}
                className="cursor-pointer px-8 bg-primary hover:bg-primary/90"
            >
                {continueLabel}
            </Button>
        </div>
    );
}
