'use client';

import { Lightbulb, Import } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProTipAlertProps {
    title: string;
    description: string;
    buttonText: string;
}

export function ProTipAlert({ title, description, buttonText }: ProTipAlertProps) {
    return (
        <div className="flex flex-row items-center justify-between px-4 py-3 gap-3 rounded-[12px] bg-[#136DEC0D] border border-[#136DEC1A] w-full min-h-[95.5px]">
            <div className="flex flex-row items-start gap-3 flex-1">
                <div className="flex shrink-0 w-4.5 h-[69.5px] items-start pt-px">
                    <Lightbulb className="w-4.5 h-4.5 text-[#136DEC]" />
                </div>

                <div className="flex flex-col items-start gap-[2.88px] flex-1">
                    <h4 className="text-sm font-bold text-[#136DEC] leading-5 m-0">{title}</h4>
                    <div className="text-sm font-normal leading-5.75 text-foreground/80">
                        {description}
                    </div>
                </div>
            </div>

            <div className="flex flex-col justify-end items-start h-[69.5px] shrink-0">
                <Button
                    variant="outline"
                    className="flex flex-row justify-center items-center px-4 py-2 gap-2 h-9 min-w-25 border-primary rounded-[8px] bg-transparent text-[14px] font-medium text-primary hover:bg-[#136DEC0D]  shadow-[0px_1px_2px_rgba(0,0,0,0.05)] cursor-pointer"
                >
                    <Import size={16} />
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}
