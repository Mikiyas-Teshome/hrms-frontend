'use client';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form';

type Props<T extends FieldValues> = {
    id: string;
    label?: string;
    placeholder?: string;
    control: Control<T>;
    name: Path<T>;
    error?: FieldError;
    options: { label: string; value: string }[];
    t: (key: string) => string;
    disabled?: boolean;
    containerClassName?: string;
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
    onChange,
}: Props<T>) {
    return (
        <div className={containerClassName || (label ? "space-y-3" : "")}>
            {label && (
                <Label htmlFor={id} className="text-sm font-medium leading-5 text-foreground block font-['Albert_Sans']">
                    {label}
                </Label>
            )}
 
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Select 
                        disabled={disabled}
                        onValueChange={(val) => {
                            field.onChange(val);
                            onChange?.(val);
                        }} 
                        value={field.value}
                    >
                        <SelectTrigger
                            id={id}
                            className={`h-9 w-full rounded-[8px] px-4 py-2 bg-background border border-input focus:border-primary focus:ring-primary/20 font-['Albert_Sans'] ${
                                error ? 'border-destructive' : ''
                            }`}
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
