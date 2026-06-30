'use client';

import { Lightbulb, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProTipAlertProps {
    title: string;
    description: string;
    buttonText: string;
    onClick?: () => void;
}

export function ProTipAlert({ title, description, buttonText, onClick }: ProTipAlertProps) {
    return (
        <div className="flex w-full flex-col gap-4 rounded-[12px] border border-[#136DEC1A] bg-[#136DEC0D] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:py-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <Lightbulb className="mt-0.5 size-[18px] shrink-0 text-[#136DEC]" />

                <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-sm font-bold leading-5 text-[#136DEC]">{title}</h4>
                    <p className="text-sm font-normal leading-relaxed text-foreground/80">
                        {description}
                    </p>
                </div>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={onClick}
                className="h-9 w-full shrink-0 gap-2 self-stretch border-primary bg-transparent px-4 text-sm font-medium text-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#136DEC0D] sm:w-auto sm:self-center"
            >
                <Import size={16} />
                {buttonText}
            </Button>
        </div>
    );
}
