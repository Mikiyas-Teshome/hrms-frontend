'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { FormSelect } from '@/components/ui/FormSelect';
import { X, Loader2, Calendar as CalendarIcon, Check, ChevronsUpDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { assignShiftSchema, type AssignShiftFormValues } from '../schemas/assign-shift.schema';
import { useAssignEmployeeShift, useShiftTemplates } from '@/features/attendance/hooks/useAttendance';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions } from '@/features/organization/hooks/useOrganization';
import { EmployeeResponse } from '@/features/employee/employee.types';

interface AssignShiftModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: EmployeeResponse | null;
    onSuccess?: () => void;
}

/** Format ISO time string (e.g. '1970-01-01T06:00:00.000Z') to human-readable '06:00 AM' */
const formatShiftTime = (isoTime: string): string => {
    try {
        const timePart = isoTime.includes('T') ? isoTime.split('T')[1] : isoTime;
        const [hours, minutes] = timePart.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const h = hours % 12 || 12;
        return `${h.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
        return isoTime;
    }
};

const AssignShiftModal: React.FC<AssignShiftModalProps> = ({ open, onOpenChange, employee, onSuccess }) => {
    const { t } = useTranslation(['attendance', 'dashboard']);
    const { toast } = useToast();
    const { mutate: assignShift, isPending: isSubmitting } = useAssignEmployeeShift();
    const { data: profile } = useProfile();
    const { companies = [], isLoading: isLoadingCompanies } = useCompanyOptions();

    const form = useForm<AssignShiftFormValues>({
        resolver: zodResolver(assignShiftSchema),
        defaultValues: {
            companyId: '',
            shiftTemplateId: '',
        },  
    });

    const selectedCompanyId = form.watch('companyId');
    const [comboboxOpen, setComboboxOpen] = useState(false);

    // Set companyId whenever modal opens and companies are available
    React.useEffect(() => {
        if (open && companies.length > 0) {
            const currentVal = form.getValues('companyId');
            if (!currentVal) {
                const initialId = employee?.orgUnit?.orgUnitId || profile?.companyId || companies[0]?.id || '';
                form.setValue('companyId', initialId);
            }
        }
        // Reset form when modal closes
        if (!open) {
            form.reset({ companyId: '', shiftTemplateId: '' });
        }
    }, [open, companies, employee, profile, form]);

    const { data: shiftTemplates = [], isLoading: isLoadingShifts } = useShiftTemplates(selectedCompanyId);

    const onSubmit = async (data: AssignShiftFormValues) => {
        if (!employee) return;
        
        const payload = {
            userId: employee.userId || employee.id,
            shiftTemplateId: data.shiftTemplateId,
            startDate: new Date().toISOString(),
            endDate: null,
            companyOuId: data.companyId || null,
        };


        assignShift(payload, {
            onSuccess: () => {
                toast({
                    title: t("assignShiftSuccess", "Shift assigned successfully"),
                    variant: "success",
                });
                onSuccess?.();
                onOpenChange(false);
                form.reset();
            },
            onError: (error: any) => {
                toast({
                    title: t("assignShiftError", "Failed to assign shift"),
                    description: error.message,
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-0 shadow-2xl bg-background text-foreground">
                <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 text-primary" />
                        {t('assignShiftTo', "Assign Shift to {{name}}", { name: employee ? `${employee.firstName} ${employee.lastName}` : '' })}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-4">
                    <Form {...form}>
                        <form
                            id="assign-shift-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormSelect
                                id="company-selector"
                                label={t('selectCompany', "Select Company")}
                                placeholder={isLoadingCompanies ? t("setup.loadingCompanies") : t("setup.selectCompanyPlaceholder")}
                                control={form.control}
                                name="companyId"
                                options={companies.map((company: any) => ({ label: company.name, value: company.id })) || []}
                                t={t}
                                onChange={(val: string) => {
                                    form.setValue('shiftTemplateId', ''); // Reset shift when company changes
                                }}
                            />
                        <FormField
                            control={form.control}
                            name="shiftTemplateId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>{t('selectShift', "Select Shift")}</FormLabel>
                                    <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={comboboxOpen}
                                                    className={cn(
                                                        "w-full justify-between font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? shiftTemplates.find((shift) => shift.id === field.value)?.name
                                                        : t('selectShiftPlaceholder', "Search and select a shift...")}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                                            <Command>
                                                <CommandInput placeholder={t('searchShifts', "Search shifts...")} className="h-9" />
                                                <CommandList>
                                                    <CommandEmpty>{t('noShiftFound', "No shift template found.")}</CommandEmpty>
                                                    <CommandGroup>
                                                        {shiftTemplates.map((shift) => (
                                                            <CommandItem
                                                                key={shift.id}
                                                                value={shift.name}
                                                                onSelect={() => {
                                                                    form.setValue("shiftTemplateId", shift.id);
                                                                    setComboboxOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        shift.id === field.value ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span>{shift.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{formatShiftTime(shift.startTime)} – {formatShiftTime(shift.endTime)}</span>
                                                                </div>
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>
            </div>

                <DialogFooter className="px-6 py-4 bg-muted/30 gap-3 sm:gap-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-none">
                        {t('cancel', "Cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="assign-shift-form"
                        disabled={isSubmitting}
                        className="flex-1 sm:flex-none min-w-[120px]"
                    >
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('assignShift', "Assign Shift")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AssignShiftModal;
