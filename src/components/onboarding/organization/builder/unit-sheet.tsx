"use client";

import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { FormField as FormFieldUI } from "@/components/ui/FormField";
import { FormSelect } from "@/components/ui/FormSelect";
import { TimezoneSelect } from "@/components/ui/TimezoneSelect";
import { CurrencySelect } from "@/components/ui/CurrencySelect";
import { IndustrySelect } from "@/components/ui/IndustrySelect";
// import { cn } from "@/lib/utils";
// import { ORGANIZATION_THEME_COLORS } from "@/constants/colors";
import { OUType } from "@/types/domain";

interface UnitSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit" | "view";
  levelType: OUType;
  levelName: string;
  unit?: any;
  parentOptions?: { id: string; name: string }[];
  onSave: (data: any) => Promise<void>;
  isSaving?: boolean;
  defaultParentId?: string;
}

const BASE_UNIT_DEFAULTS = {
  name: "",
  parentId: "",
  legalName: "",
  taxId: "",
  registrationNumber: "",
  tradeLicenseNumber: "",
  currency: "AED",
  timezone: "Asia/Dubai",
  industry: "Information Technology & Services",
  address: "",
  dunsNumber: "",
  themeColor: "",
};

export function UnitSheet({
  isOpen,
  onOpenChange,
  mode,
  levelType,
  levelName,
  unit,
  parentOptions = [],
  onSave,
  isSaving = false,
  defaultParentId,
}: UnitSheetProps) {
  const { t } = useTranslation("orgStructure");

  const emptyDefaults = useMemo(
    () => ({
      ...BASE_UNIT_DEFAULTS,
      parentId: defaultParentId || parentOptions[0]?.id || "",
    }),
    [defaultParentId, parentOptions],
  );

  const {
    register,
    handleSubmit,
    control,
    // setValue,
    // watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: mode === "add" ? emptyDefaults : (unit || emptyDefaults),
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "add") {
      reset({
        ...emptyDefaults,
        parentId: defaultParentId || parentOptions[0]?.id || "",
      });
      return;
    }

    if (mode === "edit" && unit) {
      reset(unit);
    }
  }, [isOpen, mode, defaultParentId, levelType, unit, reset, emptyDefaults, parentOptions]);

  const onSubmit = async (data: any) => {
    await onSave({ ...data, type: levelType });
  };

  const isView = mode === "view";

  // const selectedColor = watch("themeColor");

  // const themeColors = ORGANIZATION_THEME_COLORS.map(color => ({
  //   ...color,
  //   label: t(`builder.sheet.fields.colors.${color.id}`)
  // }));

  const getTitle = () => {
    if (mode === "add") return t("builder.sheet.addTitle", { type: levelName.toLowerCase() });
    if (mode === "edit") return t("builder.sheet.editTitle", { type: levelName });
    return t("builder.menu.view") + " " + levelName;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full max-w-full sm:max-w-200 p-0 flex flex-col h-full border-l border-border/50 overflow-hidden">
        <SheetHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b border-border/30 shrink-0">
          <SheetTitle className="text-xl sm:text-2xl font-bold text-foreground leading-tight pr-10">
            {getTitle()}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 pb-24">
          <div className="border border-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-background">
            <div className="bg-muted/50 px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-foreground">
                {t("builder.sheet.info", { type: levelName })}
              </span>
            </div>
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormFieldUI
                id="name"
                label={t("builder.sheet.fields.name")}
                register={register}
                name="name"
                readOnly={isView}
                error={errors.name as any}
                validation={{ required: true }}
                t={t}
              />

              <FormSelect
                id="parentId"
                label={t("builder.sheet.fields.parent")}
                control={control}
                name="parentId"
                disabled={isView || mode === "edit"}
                error={errors.parentId as any}
                options={parentOptions.map(opt => ({ label: opt.name, value: opt.id }))}
                t={t}
              />

              {levelType === OUType.COMPANY && (
                <>
                  <FormFieldUI
                    id="legalName"
                    label={t("builder.sheet.fields.legalName")}
                    register={register}
                    name="legalName"
                    readOnly={isView}
                    placeholder="e.g. Acme PLC"
                    error={errors.legalName as any}
                    validation={{ required: true }}
                    t={t}
                  />

                  <FormFieldUI
                    id="taxId"
                    label={t("builder.sheet.fields.taxId")}
                    register={register}
                    name="taxId"
                    readOnly={isView}
                    placeholder="TIN-123456"
                    error={errors.taxId as any}
                    validation={{ required: true }}
                    t={t}
                  />

                  <FormFieldUI
                    id="registrationNumber"
                    label={t("builder.sheet.fields.registrationNumber")}
                    register={register}
                    name="registrationNumber"
                    readOnly={isView}
                    placeholder="REG-2024"
                    error={errors.registrationNumber as any}
                    validation={{ required: true }}
                    t={t}
                  />

                  <FormFieldUI
                    id="tradeLicenseNumber"
                    label={t("builder.sheet.fields.tradeLicenseNumber")}
                    register={register}
                    name="tradeLicenseNumber"
                    readOnly={isView}
                    placeholder="TL-001"
                    error={errors.tradeLicenseNumber as any}
                    validation={{ required: true }}
                    t={t}
                  />

                  <FormFieldUI
                    id="dunsNumber"
                    label={t("builder.sheet.fields.dunsNumber")}
                    register={register}
                    name="dunsNumber"
                    readOnly={isView}
                    placeholder="e.g. 12-345-6789"
                    error={errors.dunsNumber as any}
                    t={t}
                  />



                  <CurrencySelect
                    control={control}
                    name="currency"
                    label={t("builder.sheet.fields.currency")}
                    placeholder="Select currency"
                    disabled={isView}
                    error={errors.currency as any}
                    t={t}
                  />

                  <TimezoneSelect
                    control={control}
                    name="timezone"
                    label={t("builder.sheet.fields.timezone")}
                    placeholder="Select timezone"
                    disabled={isView}
                    error={errors.timezone as any}
                    t={t}
                  />

                  <IndustrySelect
                    control={control}
                    name="industry"
                    label={t("builder.sheet.fields.industry")}
                    placeholder={t("builder.sheet.placeholders.industry") || "Select industry"}
                    disabled={isView}
                    error={errors.industry as any}
                    t={t}
                  />

                </>
              )}

            </div>
          </div>

          {(levelType === OUType.COMPANY || levelType === OUType.DIVISION) && (
            <div className="border border-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-background">
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  {levelType === OUType.COMPANY ? t("builder.sheet.fields.hqAddress") : t("builder.sheet.fields.address")}
                </span>
              </div>
              <div className="p-4 sm:p-6">
                <FormFieldUI
                  id="address"
                  label={t("builder.sheet.fields.locationAddress")}
                  register={register}
                  name="address"
                  readOnly={isView}
                  error={errors.address as any}
                  t={t}
                />
              </div>
            </div>
          )}

          {/* {levelType === OUType.COMPANY && (
            <div className="border border-border rounded-xl overflow-hidden shadow-[0px_1px_2px_rgba(0,0,0,0.05)] bg-background">
              <div className="bg-muted/50 px-4 py-3 border-b border-border">
                <span className="text-sm font-semibold text-foreground">
                  {t("builder.sheet.fields.themeSetup")}
                </span>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <Label className="text-sm font-medium text-foreground block">
                  {t("builder.sheet.fields.themeColor")}
                </Label>
                <div className="flex flex-wrap gap-4">
                  {themeColors.map((color) => {
                    const isSelected = selectedColor === color.id || selectedColor === color.value;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        disabled={isView}
                        onClick={() => setValue("themeColor", color.id, { shouldValidate: true })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 group outline-none cursor-pointer",
                          isView && "opacity-60 cursor-not-allowed"
                        )}
                      >
                        <div
                          className={cn(
                            "w-[111.67px] h-10.75 rounded-[9px] flex items-center justify-center transition-all p-px",
                            isSelected ? "border-2" : "border-2 border-transparent"
                          )}
                          style={isSelected ? { borderColor: color.value } : undefined}
                        >
                          <div
                            className="w-full h-full rounded-[8px] shadow-[0px_1px_2px_rgba(0,0,0,0.05)] border border-white/10"
                            style={{ backgroundColor: color.value }}
                          />
                        </div>
                        <span
                          className={cn(
                            "text-[12px] leading-5 transition-colors",
                            isSelected ? "text-foreground font-semibold" : "text-muted-foreground font-normal"
                          )}
                        >
                          {color.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.themeColor && (
                  <p className="text-xs text-destructive">{errors.themeColor.message as string}</p>
                )}
              </div>
            </div>
          )} */}
        </form>

        {!isView && (
          <div className="p-4 sm:p-6 border-t border-border/30 bg-background flex justify-end gap-3 sm:gap-6 shrink-0 z-10">
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 px-8"
            >
              {t("actions.cancel")}
            </Button>
            <Button
              type="button"
              disabled={isSaving}
              onClick={handleSubmit(onSubmit)}
              className="h-10 px-8"
            >
              {isSaving ? "Saving..." : t("actions.save")}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
