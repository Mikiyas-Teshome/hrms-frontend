'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    value?: string | Date; // ISO string or Date object
    onChange?: (date: any) => void;
    className?: string;
    placeholder?: string;
}

export function DatePicker({ value, onChange, className, placeholder = 'Pick a date' }: DatePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );

    // Sync internal state with prop
    React.useEffect(() => {
        if (value) {
            const newDate = new Date(value);
            if (!date || date.getTime() !== newDate.getTime()) {
                setDate(newDate);
            }
        } else {
            if (date) setDate(undefined);
        }
    }, [value]);

    const handleSelect = (selectedDate: Date | undefined) => {
        setDate(selectedDate);
        onChange?.(selectedDate); // Return the Date object directly for better flexibility
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-full justify-start text-left font-normal border-border bg-background h-9 px-3',
                        !date && 'text-muted-foreground',
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">
                        {date ? format(date, 'PPP') : placeholder}
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleSelect}
                    initialFocus
                    className="rounded-xl border-border"
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear() + 10}
                />
            </PopoverContent>
        </Popover>
    );
}
