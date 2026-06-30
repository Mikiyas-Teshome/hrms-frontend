'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EMPLOYMENT_TYPE_OPTIONS } from '@/features/employee/employee.types';
import type { TFunction } from 'i18next';
import type { UseFormRegister } from 'react-hook-form';

type EmploymentTypeTranslator = TFunction<string, undefined>;

export function formatEmploymentTypeLabel(type: string, t?: EmploymentTypeTranslator) {
    const option = EMPLOYMENT_TYPE_OPTIONS.find((opt) => opt.value === type);
    if (!option) {
        return type || '';
    }
    return t ? String(t(option.value, option.label)) : option.label;
}

interface ContractEmploymentTypeFieldProps {
    label: string;
    selectedContractId?: string;
    employmentType?: string;
    register: UseFormRegister<any>;
    selectContractFirstLabel: string;
    employmentTypeFromContractLabel: string;
    t?: EmploymentTypeTranslator;
}

export function ContractEmploymentTypeField({
    label,
    selectedContractId,
    employmentType,
    register,
    selectContractFirstLabel,
    employmentTypeFromContractLabel,
    t,
}: ContractEmploymentTypeFieldProps) {
    const displayValue = employmentType ? formatEmploymentTypeLabel(employmentType, t) : '';

    return (
        <div className="space-y-3">
            <Label htmlFor="employmentTypeDisplay" className="text-sm font-medium leading-5 text-foreground block">
                {label}
            </Label>
            <Input
                id="employmentTypeDisplay"
                value={displayValue}
                readOnly
                disabled
                placeholder={
                    !selectedContractId ? selectContractFirstLabel : employmentTypeFromContractLabel
                }
                className="h-9 cursor-not-allowed bg-muted/50"
            />
            <input type="hidden" {...register('employmentType')} />
        </div>
    );
}
