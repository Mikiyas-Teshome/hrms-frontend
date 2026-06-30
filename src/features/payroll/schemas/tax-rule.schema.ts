import * as z from 'zod';
import { TaxRuleStatus } from '@/features/payroll/tax-rules/tax-rules.types';

const optionalMaxAmount = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isNaN(value)) {
    return null;
  }
  return value;
}, z.number().min(0).nullable());

export const taxBracketSchema = z.object({
  minAmount: z.coerce.number().min(0),
  maxAmount: optionalMaxAmount,
  rate: z.coerce.number().min(0).max(100),
  sortOrder: z.number().optional(),
});

export const taxRuleSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.nativeEnum(TaxRuleStatus),
  effectiveFrom: z.string().min(1, 'Effective from is required'),
  effectiveTo: z.string().optional(),
  brackets: z.array(taxBracketSchema).min(1, 'At least one tax bracket is required'),
});

export type TaxRuleFormValues = z.infer<typeof taxRuleSchema>;
