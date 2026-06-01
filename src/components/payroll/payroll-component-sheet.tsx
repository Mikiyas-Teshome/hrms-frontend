"use client";

import { useEffect } from "react";
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
import { PayrollComponentType } from "@/features/payroll/payroll.types";

const payrollComponentSchema = zod.object({
  name: zod.string().min(1, "Name is required"),
  category: zod.nativeEnum(PayrollComponentType),
  description: zod.string().optional(),
  type: zod.string(),
  value: zod.number().min(0),
  taxable: zod.boolean(),
  recurring: zod.boolean(),
});

export type PayrollComponentValues = zod.infer<typeof payrollComponentSchema>;

interface PayrollComponentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  defaultValues?: Partial<PayrollComponentValues>;
  onSubmit: (data: PayrollComponentValues) => void;
  isSubmitting?: boolean;
}

export function PayrollComponentSheet({
  isOpen,
  onOpenChange,
  title,
  defaultValues,
  onSubmit,
  isSubmitting = false,
}: PayrollComponentSheetProps) {
  const { t } = useTranslation("dashboard");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PayrollComponentValues>({
    resolver: zodResolver(payrollComponentSchema),
    defaultValues: {
      name: "",
      category: PayrollComponentType.ALLOWANCE,
      description: "",
      type: "fixed",
      value: 0,
      taxable: true,
      recurring: true,
      ...defaultValues,
    },
  });

  const selectedCategory = useWatch({
    control,
    name: "category",
    defaultValue: PayrollComponentType.ALLOWANCE,
  });

  // Reset form when opening or defaultValues change
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        category: PayrollComponentType.ALLOWANCE,
        description: "",
        type: "fixed",
        value: 0,
        taxable: true,
        recurring: true,
        ...defaultValues,
      });
    }
  }, [isOpen, defaultValues, reset]);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="sm:max-w-150  px-10 py-6 flex flex-col h-full border-l border-border/50 overflow-hidden bg-background"
      >
        <SheetHeader className="p-0">
          <SheetTitle className="text-2xl font-bold text-foreground leading-tight">
            {title || (defaultValues?.name 
              ? t("payrollData.modals.editComponentTitle", "Edit payroll component")
              : t("payrollData.modals.addComponentTitle", "Add a payroll component"))}
          </SheetTitle>
          <div className="h-px bg-border mt-6" />
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-8 pb-10">
          <div className="flex flex-col gap-8">
            <div className="border border-border rounded-xl overflow-hidden bg-card">
              <div className="bg-muted/40 border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">
                  {t("payrollData.modals.componentInfo", "Component info")}
                </p>
              </div>
              <div className="p-6 flex flex-col gap-6">
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
                      { label: "Fixed amount", value: "fixed" },
                      { label: "Percentage", value: "percentage" },
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
                  <Label className="text-sm font-medium text-foreground">{t("payrollData.modals.descriptionLabel", "Description")}</Label>
                  <Textarea 
                    {...register("description")}
                    placeholder={t("payrollData.modals.descriptionPlaceholder", "Add description")} 
                    className="min-h-32 resize-none rounded-lg border-border bg-background focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {(selectedCategory === PayrollComponentType.ALLOWANCE || selectedCategory === PayrollComponentType.DEDUCTION) && (
              <div className="border border-border rounded-xl overflow-hidden bg-card p-5 flex items-center justify-between shadow-sm">
                <div className="flex flex-col gap-1">
                  <Label className="text-sm font-semibold text-foreground">
                    {selectedCategory === PayrollComponentType.ALLOWANCE 
                      ? t("payrollData.modals.taxableLabel", "Taxable")
                      : t("payrollData.modals.recurringLabel", "Recurring")}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {selectedCategory === PayrollComponentType.ALLOWANCE 
                      ? t("payrollData.modals.taxableDescription", "Is this allowance subject to tax?")
                      : t("payrollData.modals.recurringDescription", "Does this deduction repeat every month?")}
                  </p>
                </div>
                <Controller
                  name={selectedCategory === PayrollComponentType.ALLOWANCE ? "taxable" : "recurring"}
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            )}
          </div>
        </form>

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
            onClick={handleSubmit(onSubmit)}
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
      </SheetContent>
    </Sheet>
  );
}
