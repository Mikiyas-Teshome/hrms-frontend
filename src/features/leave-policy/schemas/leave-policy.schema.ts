import * as z from 'zod';

const optionalNumber = z.union([z.string(), z.number()]).optional();

const toOptionalNumber = optionalNumber
  .transform((val) => (val === '' || val === undefined ? undefined : Number(val)))
  .refine(
    (val) => val === undefined || (!Number.isNaN(val) && val >= 0),
    'Must be zero or greater',
  );

const maxDaysNumber = z
  .union([z.string(), z.number()])
  .transform((val) => (val === '' ? undefined : Number(val)))
  .refine(
    (val): val is number => val !== undefined && !Number.isNaN(val),
    'Required',
  );

export const leavePolicySchema = z
  .object({
    policyName: z.string().min(1, 'Policy name is required'),
    code: z.string().min(1, 'Code is required'),
    description: z.string().optional(),
    maxDaysPerYear: maxDaysNumber,
    entitlementGrantMode: z.string().min(1, 'Required'),
    grantRatePerPeriod: toOptionalNumber,
    usageLimitScope: z.string().min(1, 'Required'),
    maxCarryForwardDays: toOptionalNumber,
    expiryPeriod: z.string().optional(),
    carryForward: z.boolean().default(false),
    minDaysPerRequest: toOptionalNumber,
    maxDaysPerRequest: toOptionalNumber,
    noticePeriod: toOptionalNumber,
    applyTo: z.string().min(1, 'Required'),
    departmentIds: z.array(z.string()).optional(),
    requireAttachment: z.boolean().default(false),
    attachmentCondition: z.string().optional(),
    requiredDocumentCategoryId: z.string().optional(),
    paidLeave: z.boolean().default(true),
    payType: z.string().optional(),
    fullPayDays: toOptionalNumber,
    halfPayDays: toOptionalNumber,
    noPayDays: z.string().optional(),
    deductFromSalary: z.string().optional(),
    compoundingEnabled: z.boolean().default(false),
    compoundingDays: toOptionalNumber,
    compoundingYears: toOptionalNumber,
    isCompOffPolicy: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.isCompOffPolicy) {
      if (data.maxDaysPerYear !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Comp-off policies must have zero max days',
          path: ['maxDaysPerYear'],
        });
      }
      if (data.entitlementGrantMode !== 'Manual') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Comp-off policies must use manual grant mode',
          path: ['entitlementGrantMode'],
        });
      }
      if (data.carryForward || data.compoundingEnabled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Carry-forward and compounding are not allowed for comp-off policies',
          path: ['isCompOffPolicy'],
        });
      }
    } else if (data.maxDaysPerYear == null || data.maxDaysPerYear < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Required',
        path: ['maxDaysPerYear'],
      });
    }
    if (data.compoundingEnabled) {
      if (data.compoundingDays == null || data.compoundingDays < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Compounding days is required',
          path: ['compoundingDays'],
        });
      }
      if (data.compoundingYears == null || data.compoundingYears < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Compounding years is required',
          path: ['compoundingYears'],
        });
      }
    }
    if (
      data.applyTo === 'Specific departments' &&
      (!data.departmentIds || data.departmentIds.length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one department',
        path: ['departmentIds'],
      });
    }
    if (data.requireAttachment) {
      if (!data.attachmentCondition) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Condition is required',
          path: ['attachmentCondition'],
        });
      }
      if (!data.requiredDocumentCategoryId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Document category is required',
          path: ['requiredDocumentCategoryId'],
        });
      }
    }
    if (data.entitlementGrantMode === 'Monthly accrual') {
      if (data.grantRatePerPeriod == null || data.grantRatePerPeriod <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Grant rate is required for monthly accrual',
          path: ['grantRatePerPeriod'],
        });
      }
    }
    if (data.paidLeave && data.payType === 'Partial pay') {
      if (data.fullPayDays == null && data.halfPayDays == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one pay tier is required for partial pay',
          path: ['fullPayDays'],
        });
      }
    }
  });

export type LeavePolicyFormInput = z.input<typeof leavePolicySchema>;
export type LeavePolicyFormValues = z.output<typeof leavePolicySchema>;

export const leavePolicyDefaultValues: LeavePolicyFormInput = {
  policyName: '',
  code: '',
  description: '',
  maxDaysPerYear: 21,
  entitlementGrantMode: 'Yearly allocation',
  grantRatePerPeriod: '',
  usageLimitScope: 'Per calendar year',
  maxCarryForwardDays: '',
  expiryPeriod: undefined,
  carryForward: false,
  minDaysPerRequest: '',
  maxDaysPerRequest: '',
  noticePeriod: '',
  applyTo: 'All departments',
  departmentIds: [],
  requireAttachment: false,
  attachmentCondition: undefined,
  requiredDocumentCategoryId: undefined,
  paidLeave: true,
  payType: 'Full pay',
  fullPayDays: '',
  halfPayDays: '',
  noPayDays: '',
  deductFromSalary: 'Deduct',
  compoundingEnabled: false,
  compoundingDays: '',
  compoundingYears: '',
  isCompOffPolicy: false,
};
