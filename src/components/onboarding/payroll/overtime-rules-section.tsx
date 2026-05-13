/* eslint-disable @typescript-eslint/no-explicit-any */
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { UseFormRegister } from 'react-hook-form';
import { PayrollStructureValues } from '@/components/onboarding/schemas/payroll-structure';

interface OvertimeRulesSectionProps {
    isLoading: boolean;
    register: UseFormRegister<PayrollStructureValues>;
    t: (key: string, options?: any) => string;
}

export function OvertimeRulesSection({ isLoading, register, t }: OvertimeRulesSectionProps) {
    return (
        <div className="space-y-6">
            <h3 className="text-[14px] font-semibold text-foreground rtl:text-end">
                {t('overtime.title')}
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="space-y-2">
                              <Skeleton className="h-4 w-24 mb-1" />
                              <Skeleton className="h-10 w-full rounded-lg" />
                              <Skeleton className="h-3 w-40" />
                          </div>
                      ))
                    : [
                          {
                              id: 'standard',
                              label: t('overtime.standard'),
                              sub: t('overtime.standardSub'),
                              dropdownLabel: 'x Rate',
                          },
                          {
                              id: 'weekend',
                              label: t('overtime.weekend'),
                              sub: t('overtime.weekendSub'),
                              dropdownLabel: 'Flat rate ($)',
                          },
                          {
                              id: 'publicHoliday',
                              label: t('overtime.public holiday', {
                                  defaultValue: 'Public Holiday',
                              }),
                              sub: t('overtime.publicHolidaySub'),
                              dropdownLabel: 'Flat rate ($)',
                          },
                      ].map((rule) => (
                          <div key={rule.id} className="space-y-2">
                              <Label className="mb-1 block text-sm font-semibold text-foreground rtl:text-end">
                                  {rule.label}
                              </Label>
                              <div className="relative">
                                  <Input
                                      {...register(
                                          `overtimeRules.${rule.id as 'standard' | 'weekend' | 'publicHoliday'}`,
                                      )}
                                      className="h-10 rounded-lg border-border pe-28 text-sm font-medium rtl:ps-28 rtl:pe-3"
                                  />
                                  <div className="pointer-events-none absolute inset-y-0 inset-e-0 flex items-center pe-3 rtl:inset-s-0 rtl:end-auto rtl:ps-3">
                                      <span className="text-[12px] font-medium text-muted-foreground">
                                          {rule.dropdownLabel}
                                      </span>
                                  </div>
                              </div>
                              <p className="text-[12px] font-normal text-muted-foreground rtl:text-end">
                                  {rule.sub}
                              </p>
                          </div>
                      ))}
            </div>
        </div>
    );
}
