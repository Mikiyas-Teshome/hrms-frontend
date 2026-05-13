/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const COMPONENT_NAMES: Record<string, string> = {
    hra: 'House Rent Allowance',
    conveyance: 'Conveyance Allowance',
    medical: 'Medical Allowance',
    tds: 'Tax Deducted at Source',
    pf: 'Provident Fund',
    loans: 'Loan Deduction',
};

interface AllowanceDeductionListProps {
    title: string;
    items: any[];
    isLoading: boolean;
    currencySymbol: string;
    category: 'allowances' | 'deductions';
    onToggle: (category: 'allowances' | 'deductions', id: string, checked: boolean) => void;
    onEdit: (category: 'allowances' | 'deductions', item: any) => void;
    onRemove: (category: 'allowances' | 'deductions', id: string) => void;
    t: (key: string, options?: any) => string;
}

export function AllowanceDeductionList({
    title,
    items,
    isLoading,
    currencySymbol,
    category,
    onToggle,
    onEdit,
    onRemove,
    t,
}: AllowanceDeductionListProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-border">
            <div className="px-6 pb-2 pt-5">
                <h4 className="text-[13px] font-semibold text-foreground rtl:text-end">{title}</h4>
            </div>
            <div className="flex flex-col">
                {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                          <div
                              key={i}
                              className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0"
                          >
                              <Skeleton className="size-4 rounded" />
                              <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-3 w-40" />
                              </div>
                          </div>
                      ))
                    : items.map((item, index) => (
                          <div
                              key={item.dbId || item.id}
                              className={cn(
                                  'group flex items-start gap-4 px-6 py-4 rtl:flex-row-reverse',
                                  index !== items.length - 1 && 'border-b border-border',
                              )}
                          >
                              <Checkbox
                                  checked={item.enabled}
                                  onCheckedChange={(checked) =>
                                      onToggle(category, item.id, !!checked)
                                  }
                                  className="mt-0.5 size-4 rounded border-border"
                              />
                              <div className="flex-1 space-y-1 rtl:text-end">
                                  <p className="text-sm font-medium text-foreground">
                                      {COMPONENT_NAMES[item.id] || item.id}
                                  </p>
                                  {item.value != null ? (
                                      <p className="text-[12px] font-normal text-muted-foreground">
                                          {item.type === 'percentage'
                                              ? t(
                                                    category === 'allowances'
                                                        ? 'components.items.percentageAllowance'
                                                        : 'components.items.percentageDeduction',
                                                    {
                                                        value: item.value,
                                                        defaultValue: `${item.value} %`,
                                                    },
                                                )
                                              : `Fixed: ${currencySymbol} ${Number(item.value).toFixed(2)}`}
                                      </p>
                                  ) : item.description ? (
                                      <p className="text-[12px] font-normal text-muted-foreground">
                                          {item.description}
                                      </p>
                                  ) : null}
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                      onClick={() => onEdit(category, item)}
                                  >
                                      <Pencil className="size-3.5" />
                                  </Button>
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                      onClick={() => onRemove(category, item.id)}
                                  >
                                      <Trash2 className="size-3.5" />
                                  </Button>
                              </div>
                          </div>
                      ))}
            </div>
        </div>
    );
}
