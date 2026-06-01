'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { FieldError, RegisterOptions, UseFormRegister } from 'react-hook-form';

type Props = {
    id: string;
    label: string;
    name: string;
    register: UseFormRegister<any>;
    error?: FieldError;
    t: (key: string) => string;
    validation?: RegisterOptions;
};

export function PasswordField({ id, label, name, register, error, t, validation }: Props) {
    const [show, setShow] = useState(false);

    return (
        <div className="space-y-3">
            <Label htmlFor={id} className="text-sm font-medium leading-5 text-foreground block">
                {label}
            </Label>

            <div className="relative">
                <Input
                    id={id}
                    type={show ? 'text' : 'password'}
                    placeholder="******"
                    {...register(name, validation)}
                    className={cn(
                        'h-9 rounded-lg px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20 text-start',
                        error ? 'border-destructive focus-visible:ring-destructive' : '',
                    )}
                />

                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute inset-y-0 right-3 rtl:left-3 rtl:right-auto flex items-center text-muted-foreground"
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>

            {error && (
                <p className="text-xs text-destructive rtl:text-end">
                    {error.message && (error.message.includes(' ') ? error.message : t(`errors.${error.message}`))}
                </p>
            )}
        </div>
    );
}
