'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { X, Loader2, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { EmployeeFormFields } from './EmployeeFormFields';
import { employeeSchema, type EmployeeFormValues } from '../schemas/employee.schema';
import { useInviteEmployee } from '@/features/employee/hooks/useEmployee';
import { useToast } from '@/hooks/use-toast';

interface AddEmployeeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

const AddEmployeeSheet: React.FC<AddEmployeeSheetProps> = ({ 
    open, 
    onOpenChange, 
    onSuccess
}) => {
    const { t, i18n } = useTranslation('employees');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';
    
    const inviteMutation = useInviteEmployee();

    const form = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            gccid: '',
            ouId: '',
            role: '',
        },
    });
    
    useEffect(() => {
        if (open) {
            form.reset({
                firstName: '',
                lastName: '',
                email: '',
                gccid: '',
                ouId: '',
                role: '',
            });
        }
    }, [open, form]);

    const onSubmit = async (data: EmployeeFormValues) => {
        try {
            await inviteMutation.mutateAsync({
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                ouId: data.ouId || undefined,
                roleId: data.role || undefined,
            });
            toast({
                title: t('inviteSuccess', 'Invitation Sent'),
                description: t('inviteSuccessDesc', 'Employee has been invited successfully.'),
                variant: 'success',
            });
            onSuccess?.();
            onOpenChange(false);
            form.reset();
        } catch (error: any) {
            toast({
                title: t('saveError', 'Invitation Failed'),
                description: error.message || t('saveErrorDesc'),
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                showCloseButton={false}
                side={isRtl ? 'left' : 'right'}
                className="w-full sm:max-w-[800px] p-0 flex flex-col h-full border-0 shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-6 space-y-6 flex flex-col h-full">
                    <SheetHeader className="flex flex-row items-center justify-between shrink-0">
                        <SheetTitle className="text-2xl font-bold text-foreground">
                            {t('inviteEmployee', 'Invite Employee')}
                        </SheetTitle>
                        <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg">
                            <X className="h-5 w-5" strokeWidth={1.33} />
                            <span className="sr-only">Close</span>
                        </SheetClose>
                    </SheetHeader>
                    
                    <Separator className="shrink-0" />

                    <div className="flex-1 overflow-y-auto no-scrollbar pr-2">
                        <Form {...form}>
                            <form
                                id="add-employee-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8"
                            >
                                <EmployeeFormFields form={form} />
                            </form>
                        </Form>
                    </div>

                    <div className="pt-6 mt-auto shrink-0 flex items-center justify-end gap-3 border-t">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 px-6 rounded-xl font-semibold transition-all hover:bg-muted"
                        >
                            {t('cancel', 'Cancel')}
                        </Button>
                        <Button
                            form="add-employee-form"
                            type="submit"
                            disabled={inviteMutation.isPending}
                            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                        >
                            {inviteMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                            {t('sendInvitation', 'Send Invitation')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default AddEmployeeSheet;
