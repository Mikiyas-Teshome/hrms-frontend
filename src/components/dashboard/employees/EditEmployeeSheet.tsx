'use client';

import React, { useEffect, useMemo } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { X, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee } from '@/features/employee/hooks/useEmployee';
import { EmployeeResponse } from '@/features/employee/employee.types';
import { EditEmployeeFormFields } from '@/components/dashboard/employees/EditEmployeeFormFields';

import { 
    optionalPhoneValidation, 
    futureDateValidation, 
    pastDateValidation, 
    numericValidation
} from '@/lib/validations';

interface EditEmployeeSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employee: EmployeeResponse | null;
    onSuccess?: () => void;
}

const EditEmployeeSheet: React.FC<EditEmployeeSheetProps> = ({ 
    open, 
    onOpenChange, 
    employee,
    onSuccess
}) => {
    const { t, i18n } = useTranslation('employees');
    const { toast } = useToast();
    const isRtl = i18n.language === 'ar';
    
    const updateMutation = useUpdateEmployee();

    const updateEmployeeSchema = useMemo(() => {
        return z.object({
            employeeNumber: z.string().optional(),
            firstName: z.string().min(1, t('firstName')),
            lastName: z.string().min(1, t('lastName')),
            middleName: z.string().optional(),
            email: z.string().email(t('emailInvalid', 'Invalid email address')),
            businessEmail: z.string().email(t('emailInvalid', 'Invalid email address')).optional().or(z.literal('')),
            personalEmail: z.string().email(t('emailInvalid', 'Invalid email address')).optional().or(z.literal('')),
            phoneNumber: optionalPhoneValidation(t('errors.phoneInvalid')),
            homePhone: optionalPhoneValidation(t('errors.phoneInvalid')),
            dateOfBirth: pastDateValidation(t('errors.pastDateRequired')),
            gender: z.string().optional(),
            nationality: z.string().optional(),
            nationalId: z.string().optional(),
            jobTitle: z.string().min(1, t('jobTitle')),
            employmentType: z.string().optional(),
            departmentId: z.string().optional(),
            managerId: z.string().optional(),
            salary: z.coerce.number().optional(),
            currency: z.string().optional(),
            // Work Address
            address: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            country: z.string().optional(),
            postalCode: numericValidation(t('errors.numbersOnly')).optional(),
            // Home Address
            homeAddress: z.string().optional(),
            homeCity: z.string().optional(),
            homeState: z.string().optional(),
            homeCountry: z.string().optional(),
            homePostalCode: numericValidation(t('errors.numbersOnly')).optional(),
            // Documents
            passportNumber: z.string().optional(),
            passportExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            visaNumber: z.string().optional(),
            visaExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            workPermitNumber: z.string().optional(),
            workPermitExpiry: futureDateValidation(t('errors.futureDateRequired')).optional(),
            // Emergency Contact
            emergencyContactName: z.string().optional(),
            emergencyContactPhone: optionalPhoneValidation(t('errors.phoneInvalid')),
            emergencyContactRelationship: z.string().optional(),
        });
    }, [t]);

    type UpdateEmployeeValues = z.infer<typeof updateEmployeeSchema>;

    const form = useForm<UpdateEmployeeValues>({
        resolver: zodResolver(updateEmployeeSchema) as any,
        defaultValues: {
            employeeNumber: '',
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            businessEmail: '',
            personalEmail: '',
            phoneNumber: '',
            homePhone: '',
            dateOfBirth: '',
            gender: '',
            nationality: '',
            nationalId: '',
            jobTitle: '',
            employmentType: '',
            departmentId: '',
            managerId: '',
            salary: 0,
            currency: '',
            address: '',
            city: '',
            state: '',
            country: '',
            postalCode: '',
            homeAddress: '',
            homeCity: '',
            homeState: '',
            homeCountry: '',
            homePostalCode: '',
            passportNumber: '',
            passportExpiry: '',
            visaNumber: '',
            visaExpiry: '',
            workPermitNumber: '',
            workPermitExpiry: '',
            emergencyContactName: '',
            emergencyContactPhone: '',
            emergencyContactRelationship: '',
        },
    });
    
    useEffect(() => {
        if (open && employee) {
            form.reset({
                employeeNumber: employee.employeeNumber || '',
                firstName: employee.firstName || '',
                lastName: employee.lastName || '',
                middleName: employee.middleName || '',
                email: employee.email || '',
                businessEmail: employee.businessEmail || '',
                personalEmail: employee.personalEmail || '',
                phoneNumber: employee.phoneNumber || '',
                homePhone: employee.homePhone || '',
                dateOfBirth: employee.dateOfBirth ? new Date(employee.dateOfBirth).toISOString().split('T')[0] : '',
                gender: employee.gender || '',
                nationality: employee.nationality || '',
                nationalId: employee.nationalId || '',
                jobTitle: employee.jobTitle || '',
                employmentType: employee.employmentType || '',
                departmentId: employee.orgUnit?.orgUnitId || employee.departmentId || '',
                managerId: employee.managerId || '',
                salary: employee.salary || 0,
                currency: employee.currency || '',
                address: employee.address || '',
                city: employee.city || '',
                state: employee.state || '',
                country: employee.country || '',
                postalCode: employee.postalCode || '',
                homeAddress: employee.homeAddress || '',
                homeCity: employee.homeCity || '',
                homeState: employee.homeState || '',
                homeCountry: employee.homeCountry || '',
                homePostalCode: employee.homePostalCode || '',
                passportNumber: employee.passportNumber || '',
                passportExpiry: employee.passportExpiry ? new Date(employee.passportExpiry).toISOString().split('T')[0] : '',
                visaNumber: employee.visaNumber || '',
                visaExpiry: employee.visaExpiry ? new Date(employee.visaExpiry).toISOString().split('T')[0] : '',
                workPermitNumber: employee.workPermitNumber || '',
                workPermitExpiry: employee.workPermitExpiry ? new Date(employee.workPermitExpiry).toISOString().split('T')[0] : '',
                emergencyContactName:'',
                emergencyContactPhone:'',
                emergencyContactRelationship: employee.emergencyContactRelationship || '',
            });
        }
    }, [open, employee, form]);

    const onSubmit = async (data: UpdateEmployeeValues) => {
        if (!employee) return;
        try {
            // Destructure employeeNumber out as it's not supported in UpdateEmployeeInput
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { employeeNumber, ...updateInput } = data;
            
            // Format date fields to "YYYY-MM-DDT00:00:00+03:00"
            const formatDate = (dateStr: string | undefined) => {
                if (!dateStr || dateStr === '') return undefined;
                // If it's already in the long format, return it
                if (dateStr.includes('T')) return dateStr;
                return `${dateStr}T00:00:00+03:00`;
            };

            const finalInput = {
                ...updateInput,
                dateOfBirth: formatDate(data.dateOfBirth),
                passportExpiry: formatDate(data.passportExpiry),
                visaExpiry: formatDate(data.visaExpiry),
                workPermitExpiry: formatDate(data.workPermitExpiry),
                // Handle numeric salary correctly
                salary: data.salary ? Number(data.salary) : undefined,
            };

            // Convert empty strings to undefined and omit them entirely for the API
            const sanitizedInput = Object.fromEntries(
                Object.entries(finalInput)
                    .filter(([, value]) => value !== '' && value !== undefined && value !== null)
            );

            await updateMutation.mutateAsync({
                id: employee.id,
                input: sanitizedInput as any
            });
            toast({
                title: t('updateSuccess', 'Profile Updated'),
                description: t('updateSuccessDesc', 'Employee profile has been updated successfully.'),
                variant: 'success',
            });
            onSuccess?.();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: t('updateError', 'Update Failed'),
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
                className="w-full sm:max-w-225 p-0 flex flex-col h-full border-0 shadow-2xl overflow-hidden"
            >
                <div className="px-10 py-6 space-y-6 flex flex-col h-full">
                    <SheetHeader className="flex flex-row items-center justify-between shrink-0">
                        <SheetTitle className="text-2xl font-bold text-foreground">
                            {t('editProfile', 'Edit Employee Profile')}
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
                                id="edit-employee-form"
                                onSubmit={form.handleSubmit(onSubmit as any)}
                                className="space-y-8"
                            >
                                <EditEmployeeFormFields form={form} />
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
                            form="edit-employee-form"
                            type="submit"
                            disabled={updateMutation.isPending}
                            className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            {t('saveChanges', 'Save Changes')}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default EditEmployeeSheet;
