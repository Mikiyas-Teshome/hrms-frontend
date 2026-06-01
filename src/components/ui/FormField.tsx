'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldError, RegisterOptions, UseFormRegister } from 'react-hook-form';

type Props = {
    id: string;
    label: string;
    placeholder?: string;
    register: UseFormRegister<any>;
    name: string;
    error?: FieldError;
    type?: string;
    inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
    pattern?: string;
    t: (key: string) => string;
    validation?: RegisterOptions;
    readOnly?: boolean;
    className?: string;
};

export function FormField({
    id,
    label,
    placeholder,
    register,
    name,
    error,
    type = 'text',
    inputMode,
    pattern,
    t,
    validation,
    readOnly,
    className,
}: Props) {
    return (
        <div className="space-y-3">
            <Label htmlFor={id} className="text-sm font-medium leading-5 text-foreground block">
                {label}
            </Label>
 
            <Input
                id={id}
                type={type}
                inputMode={inputMode}
                pattern={pattern}
                placeholder={placeholder}
                readOnly={readOnly}
                {...register(name, validation)}
                className={cn(
                    'h-9 rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20',
                    (type === 'date' || type === 'time' || type === 'number') && 'dark:scheme-dark',
                    error ? 'border-destructive focus-visible:ring-destructive' : '',
                    readOnly ? 'bg-slate-50 text-slate-500 cursor-not-allowed opacity-80' : '',
                    className
                )}
            />

            {error && (
                <p className="text-xs text-destructive rtl:text-end">
                    {error.message && (error.message.includes(' ') ? error.message : t(`errors.${error.message}`))}
                </p>
            )}
        </div>
    );
}
