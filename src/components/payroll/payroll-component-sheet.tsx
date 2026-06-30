"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PayrollComponentType, PayrollComponentValueType } from "@/features/payroll/payroll.types";

const payrollComponentSchema = zod.object({
  ouId: zod.string().min(1, "Company is required"),
  name: zod.string().min(1, "Name is required"),
  category: zod.nativeEnum(PayrollComponentType),
  description: zod.string().optional(),
  type: zod.nativeEnum(PayrollComponentValueType),
  value: zod.preprocess(
    (val) => (val === "" || val === null || Number.isNaN(val) ? undefined : val),
    zod.coerce.number().min(0, "Value must be 0 or greater"),
  ),
  taxable: zod.preprocess((val) => val ?? true, zod.boolean()),
  recurring: zod.preprocess((val) => val ?? true, zod.boolean()),
});

export type PayrollComponentValues = zod.infer<typeof payrollComponentSchema>;

type CompanyOption = {
  label: string;
  value: string;
};

interface PayrollComponentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  defaultValues?: Partial<PayrollComponentValues>;
  defaultOuId?: string;
  companyOptions?: CompanyOption[];
  isLoadingCompanies?: boolean;
  onSubmit: (data: PayrollComponentValues) => void;
  isSubmitting?: boolean;
}

function buildFormValues(
  defaultValues: Partial<PayrollComponentValues> | undefined,
  defaultOuId?: string,
): PayrollComponentValues {
  const category = defaultValues?.category ?? PayrollComponentType.ALLOWANCE;

  return {
    ouId: defaultValues?.ouId ?? defaultOuId ?? "",
    name: defaultValues?.name ?? "",
    category,
    description: defaultValues?.description ?? "",
    type: defaultValues?.type ?? PayrollComponentValueType.FIXED,
    value: defaultValues?.value ?? 0,
    taxable:
      category === PayrollComponentType.ALLOWANCE
        ? (defaultValues?.taxable ?? true)
        : true,
    recurring:
      category === PayrollComponentType.DEDUCTION
        ? (defaultValues?.recurring ?? true)
        : true,
  };
}

export function PayrollComponentSheet({
  isOpen,
  onOpenChange,
  title,
  defaultValues,
  defaultOuId,
  companyOptions = [],
  isLoadingCompanies = false,
  onSubmit,
  isSubmitting = false,
}: PayrollComponentSheetProps) {
  const { t } = useTranslation("dashboard");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<PayrollComponentValues>({
    resolver: zodResolver(payrollComponentSchema) as any,
    defaultValues: buildFormValues(defaultValues, defaultOuId),
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
    defaultValue: PayrollComponentType.ALLOWANCE,
  });

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      reset(buildFormValues(defaultValues, defaultOuId));
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, defaultValues, defaultOuId, reset]);

  useEffect(() => {
    if (selectedCategory === PayrollComponentType.ALLOWANCE) {
      setValue("taxable", getValues("taxable") ?? true);
      return;
    }
    setValue("recurring", getValues("recurring") ?? true);
  }, [selectedCategory, setValue, getValues]);

  const isEditing = Boolean(defaultValues?.name);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="sm:max-w-150 px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-tight">
            {title || (isEditing
              ? t("payrollData.modals.editComponentTitle", "Edit payroll component")
              : t("payrollData.modals.addComponentTitle", "Add a payroll component"))}
          </SheetTitle>
          <div className="h-px bg-border mt-6" />
        </SheetHeader>

        <form
          id="payroll-component-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10 pt-2">
            <div className="flex flex-col gap-8">
              <div className="border border-border rounded-xl overflow-hidden bg-card">
                <div className="bg-muted/40 border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-foreground">
                    {t("payrollData.modals.componentInfo", "Component info")}
                  </p>
                </div>
                <div className="p-6 flex flex-col gap-6">
                  <FormSelect
                    id="ouId"
                    label={t("setup.selectCompany", "Company selection")}
                    placeholder={
                      isLoadingCompanies
                        ? t("setup.loadingCompanies", "Loading...")
                        : t("setup.selectCompanyPlaceholder", "Select company")
                    }
                    control={control}
                    name="ouId"
                    error={errors.ouId}
                    options={companyOptions}
                    t={t}
                    disabled={isEditing || companyOptions.length <= 1}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                    <FormField
                      id="name"
                      label={t("payrollData.modals.nameLabel", "Component name")}
                      name="name"
                      register={register}
                      error={errors.name}
                      t={t}
                    />
                    <FormSelect
                      id="category"
                      label={t("payrollData.modals.typeLabel", "Type")}
                      name="category"
                      control={control}
                      error={errors.category}
                      options={[
                        { label: "Allowance", value: PayrollComponentType.ALLOWANCE },
                        { label: "Deduction", value: PayrollComponentType.DEDUCTION },
                      ]}
                      t={t}
                    />
                    <FormSelect
                      id="type"
                      label={t("payrollData.modals.calcTypeLabel", "Calculation type")}
                      name="type"
                      control={control}
                      error={errors.type}
                      options={[
                        { label: "Fixed amount", value: PayrollComponentValueType.FIXED },
                        { label: "Percentage", value: PayrollComponentValueType.PERCENTAGE },
                      ]}
                      t={t}
                    />
                    <FormField
                      id="value"
                      label={t("payrollData.modals.valueLabel", "Value")}
                      name="value"
                      type="number"
                      register={register}
                      error={errors.value}
                      validation={{ valueAsNumber: true }}
                      t={t}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium text-foreground">
                      {t("payrollData.modals.descriptionLabel", "Description")}
                    </Label>
                    <Textarea
                      {...register("description")}
                      placeholder={t("payrollData.modals.descriptionPlaceholder", "Add description")}
                      className="min-h-32 resize-none rounded-lg border-border bg-background focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>

              {selectedCategory === PayrollComponentType.ALLOWANCE ? (
                <div className="border border-border rounded-xl overflow-hidden bg-card p-5 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-semibold text-foreground">
                      {t("payrollData.modals.taxableLabel", "Taxable")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("payrollData.modals.taxableDescription", "Is this allowance subject to tax?")}
                    </p>
                  </div>
                  <Controller
                    name="taxable"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden bg-card p-5 flex items-center justify-between shadow-sm">
                  <div className="flex flex-col gap-1">
                    <Label className="text-sm font-semibold text-foreground">
                      {t("payrollData.modals.recurringLabel", "Recurring")}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("payrollData.modals.recurringDescription", "Does this deduction repeat every month?")}
                    </p>
                  </div>
                  <Controller
                    name="recurring"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 mt-auto pt-6 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-10 rounded-xl border-primary/20 text-primary hover:bg-primary/5 transition-all font-semibold"
              onClick={() => onOpenChange(false)}
            >
              {t("payrollData.modals.cancelBtn", "Cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-10 rounded-xl text-white font-semibold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("common.saving", "Saving...")}
                </div>
              ) : (
                t("payrollData.modals.saveBtn", "Save component")
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
