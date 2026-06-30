'use client';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues = FieldValues> = {
    id: string;
    label?: string;
    placeholder?: string;
    control?: Control<T, any, any>;
    name?: Path<T>;
    error?: FieldError;
    options: { label: string; value: string }[];
    t?: (key: string) => string;
    disabled?: boolean;
    containerClassName?: string;
    className?: string;
    value?: string;
    onChange?: (value: string) => void;
};

export function FormSelect<T extends FieldValues>({
    id,
    label,
    placeholder,
    control,
    name,
    error,
    options,
    t,
    disabled,
    containerClassName,
    className,
    value,
    onChange,
}: Props<T>) {
    const renderSelect = (currentValue?: string, handleChange?: (val: string) => void) => (
        <Select 
            disabled={disabled}
            onValueChange={handleChange} 
            value={
                currentValue !== undefined &&
                currentValue !== null &&
                currentValue !== ''
                    ? String(currentValue)
                    : undefined
            }
        >
            <SelectTrigger
                id={id}
                className={cn(`h-9 w-full rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20 font-['Albert_Sans'] ${
                    error ? 'border-destructive' : ''
                }`, className)}
            >
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );

    return (
        <div className={containerClassName || (label ? "space-y-3" : "")}>
            {label && (
                <Label htmlFor={id} className="text-sm font-medium leading-5 text-foreground block font-['Albert_Sans']">
                    {label}
                </Label>
            )}

            {control && name ? (
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => renderSelect(field.value, (val) => {
                        field.onChange(val);
                        onChange?.(val);
                    })}
                />
            ) : (
                renderSelect(value, onChange)
            )}

            {error && (
                <p className="text-xs text-destructive rtl:text-end">
                    {error.message && t ? (error.message.includes(' ') ? error.message : t(`errors.${error.message}`)) : error.message}
                </p>
            )}
        </div>
    );
}
