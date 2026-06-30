'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { Loader2, Check, ChevronsUpDown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useCreateShiftPolicyAssignment, useShiftTemplates } from '@/features/attendance/hooks/useAttendance';
import { ShiftPolicyScopeType } from '@/features/attendance/attendance.types';
import { formatShiftTime24 } from '@/features/attendance/attendance.utils';
import { useProfile } from '@/features/auth/hooks/useAuth';
import { useCompanyOptions, useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';

interface AssignShiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    target: {
        id: string;
        name: string;
        type: 'COMPANY' | 'DIVISION' | 'SUB_DIVISION' | 'DEPARTMENT' | 'EMPLOYEE';
        companyId: string | null;
    } | null;
}

interface AssignShiftFormValues {
    shiftTemplateId: string;
    validFrom: Date;
    validTo?: Date | null;
}

const findCompanyForUnit = (unitId: string, nodes: any[]): any | null => {
    for (const node of nodes) {
        if (node.id === unitId) {
            return node;
        }
        if (node.children) {
            const found = findCompanyForUnit(unitId, node.children);
            if (found) {
                if (node.type === 'COMPANY') return node;
                return found;
            }
        }
    }
    return null;
};

export function AssignShiftModal({ isOpen, onClose, target }: AssignShiftModalProps) {
    const { t } = useTranslation(['orgStructure']);
    const { toast } = useToast();
    const { mutate: assignShift, isPending: isSubmitting } = useCreateShiftPolicyAssignment();

    const { data: hierarchy = [] } = useOrganizationHierarchy();
    const { data: profile } = useProfile();
    const { companies = [] } = useCompanyOptions();

    const form = useForm<AssignShiftFormValues>({
        defaultValues: {
            shiftTemplateId: '',
            validFrom: new Date(),
            validTo: null,
        },
    });

    const [comboboxOpen, setComboboxOpen] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                shiftTemplateId: '',
                validFrom: new Date(),
                validTo: null,
            });
        }
    }, [isOpen, form]);

    const resolvedCompanyId = React.useMemo(() => {
        if (!target) return '';
        
        if (target.type === 'COMPANY') return target.id;
        
        if (hierarchy.length > 0) {
            const unitIdToSearch = target.type === 'EMPLOYEE' ? target.companyId : target.id;
            if (unitIdToSearch) {
                const comp = findCompanyForUnit(unitIdToSearch, hierarchy);
                if (comp) return comp.id;
            }
        }

        return target.companyId || profile?.companyId || companies[0]?.id || '';
    }, [target, hierarchy, profile, companies]);

    const { data: shiftTemplates = [], isLoading: isLoadingShifts } = useShiftTemplates(resolvedCompanyId);

    const activeShiftTemplates = React.useMemo(
        () => shiftTemplates.filter((shift) => shift.isActive),
        [shiftTemplates],
    );

    const onSubmit = async (data: AssignShiftFormValues) => {
        if (!target) return;

        const scopeType = target.type as ShiftPolicyScopeType;

        const payload = {
            scopeRefId: target.id,
            scopeType,
            shiftTemplateId: data.shiftTemplateId,
            validFrom: data.validFrom.toISOString(),
            validTo: data.validTo ? data.validTo.toISOString() : null,
        };

        assignShift(payload, {
            onSuccess: () => {
                toast({
                    title: t("orgStructure:assignShift.successToast", "Shift policy assigned successfully"),
                    variant: "success",
                });
                onClose();
            },
            onError: (error: any) => {
                toast({
                    title: t("orgStructure:assignShift.errorToast", "Failed to assign shift policy"),
                    description: error.message,
                    variant: "destructive",
                });
            }
        });
    };

    if (!target) return null;

    const infoMessage = target.type === 'EMPLOYEE'
        ? t('orgStructure:assignShift.infoMessageEmployee', 'This will apply only to this employee and will override any inherited organizational shift policy.')
        : t('orgStructure:assignShift.infoMessage', 'This apply for all the employees in this unit. But it will be overwritten if a shift is assigned to a child unit.');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden border border-border shadow-2xl bg-background text-foreground rounded-2xl">
                
                <DialogDescription className="sr-only">
                    Modal dialog for assigning a shift policy.
                </DialogDescription>

                <DialogHeader className="px-6 pt-6 pb-2 text-start rtl:text-end">
                    <DialogTitle className="text-[20px] font-semibold font-sans tracking-tight">
                        {t('orgStructure:assignShift.title', 'Assign a shift')}
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2">
                    <Form {...form}>
                        <form
                            id="assign-shift-unit-form"
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-5"
                        >
                            <FormField
                                control={form.control}
                                name="shiftTemplateId"
                                rules={{ required: "Please select a shift template" }}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-1.5 text-start rtl:text-end">
                                        <FormLabel className="text-[14px] font-semibold text-foreground font-sans">
                                            {t('orgStructure:assignShift.fieldShift', "Shift")}
                                        </FormLabel>
                                        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={comboboxOpen}
                                                        disabled={isLoadingShifts}
                                                        className={cn(
                                                            "w-full justify-between font-normal h-10 border-input rounded-lg bg-background px-3 text-start",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <span className="truncate">
                                                            {field.value
                                                                ? (activeShiftTemplates.find((shift) => shift.id === field.value)
                                                                    ? `${activeShiftTemplates.find((shift) => shift.id === field.value)?.name} (${formatShiftTime24(activeShiftTemplates.find((shift) => shift.id === field.value)?.startTime || '')} - ${formatShiftTime24(activeShiftTemplates.find((shift) => shift.id === field.value)?.endTime || '')})`
                                                                    : field.value)
                                                                : isLoadingShifts 
                                                                    ? t('orgStructure:assignShift.loadingShifts', "Loading shifts...") 
                                                                    : t('orgStructure:assignShift.selectShiftPlaceholder', "Search and select a shift...")}
                                                        </span>
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                <Command>
                                                    <CommandInput placeholder={t('orgStructure:assignShift.selectShiftPlaceholder', "Search and select a shift...")} className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>
                                                            {isLoadingShifts ? "Loading shifts..." : t('orgStructure:assignShift.noShiftsFound', "No shift template found.")}
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {activeShiftTemplates.map((shift) => (
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
                                                                            "mr-2 h-4 w-4 shrink-0 rtl:ml-2 rtl:mr-0",
                                                                            shift.id === field.value ? "opacity-100" : "opacity-0"
                                                                        )}
                                                                    />
                                                                    <div className="flex flex-col text-start rtl:text-end">
                                                                        <span className="font-medium">{shift.name}</span>
                                                                        <span className="text-xs text-muted-foreground mt-0.5">
                                                                            {formatShiftTime24(shift.startTime)} – {formatShiftTime24(shift.endTime)}
                                                                        </span>
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

                            <FormField
                                control={form.control}
                                name="validFrom"
                                rules={{ required: "Start date is required" }}
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-1.5 text-start rtl:text-end">
                                        <FormLabel className="text-[14px] font-semibold text-foreground font-sans">
                                            {t('orgStructure:assignShift.fieldValidFrom', "Valid from")}
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value}
                                                onChange={(date) => date && field.onChange(date)}
                                                placeholder="DD/MM/YYYY"
                                                className="h-10 border-input rounded-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="validTo"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col space-y-1.5 text-start rtl:text-end">
                                        <FormLabel className="text-[14px] font-semibold text-foreground font-sans">
                                            {t('orgStructure:assignShift.fieldValidTo', "Valid to (optional)")}
                                        </FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                value={field.value || undefined}
                                                onChange={(date) => field.onChange(date || null)}
                                                placeholder="DD/MM/YYYY"
                                                className="h-10 border-input rounded-lg"
                                            />
                                        </FormControl>
                                        <p className="text-[12px] text-muted-foreground leading-normal mt-1 font-sans">
                                            {t('orgStructure:assignShift.helperValidTo', "Leave empty for ongoing shift assignment.")}
                                        </p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="p-3.5 rounded-xl border border-blue-100 bg-[#eff6ff]/70 dark:bg-blue-950/20 dark:border-blue-900/30 flex items-start gap-2.5 text-start rtl:text-end mt-4">
                                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-[13px] text-[#1e40af] dark:text-blue-300 font-medium leading-relaxed font-sans">
                                    {infoMessage}
                                </p>
                            </div>
                        </form>
                    </Form>
                </div>

                <DialogFooter className="px-6 py-5 flex flex-row justify-end rtl:justify-start gap-3 mt-4">
                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        className="px-6 h-10 rounded-lg text-foreground hover:bg-accent border-[#e5e7eb] font-sans"
                    >
                        {t('orgStructure:assignShift.buttonCancel', "Cancel")}
                    </Button>
                    <Button
                        type="submit"
                        form="assign-shift-unit-form"
                        disabled={isSubmitting}
                        className="px-6 h-10 rounded-lg bg-primary hover:bg-primary/95 text-white font-medium min-w-[100px] font-sans"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
                                {t('orgStructure:actions.loading', "Loading...")}
                            </>
                        ) : (
                            t('orgStructure:assignShift.buttonAssign', "Assign")
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
