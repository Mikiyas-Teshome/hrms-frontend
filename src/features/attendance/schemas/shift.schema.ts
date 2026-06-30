import * as z from 'zod';
import { ShiftType } from '@/features/attendance/attendance.types';

export const shiftSchema = z.object({
  name: z.string().min(1, 'Shift name is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  breakDuration: z.number().min(0, 'Break duration must be a positive number'),
  flexibleMinutes: z.number().min(0, 'Flexible minutes must be a positive number'),
  overtimeAllowed: z.boolean(),
  overtimePayable: z.boolean().default(true),
  workingDays: z.array(z.number()).min(1, 'Select at least one working day'),
  companyOuId: z.string().min(1, 'Organization unit is required'),
  type: z.nativeEnum(ShiftType),
  isActive: z.boolean(),
});

export interface ShiftFormValues {
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  flexibleMinutes: number;
  overtimeAllowed: boolean;
  overtimePayable: boolean;
  workingDays: number[];
  companyOuId: string;
  type: ShiftType;
  isActive: boolean;
}