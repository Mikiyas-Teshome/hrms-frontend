"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSelect } from "@/components/ui/FormSelect";
import { FormField } from "@/components/ui/FormField";
import { leaveTypeSchema, type LeaveTypeValues } from "@/components/onboarding/schemas/leave-type";
import { cn } from "@/lib/utils";

interface AddLeaveTypeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: LeaveTypeValues) => void;
  initialData?: Partial<LeaveTypeValues> | null;
}

export function AddLeaveTypeSheet({
  open,
  onOpenChange,
  onSubmit,
  initialData,
}: AddLeaveTypeSheetProps) {
  const { t, i18n } = useTranslation("hrPolicies");
  const isRTL = i18n.language === "ar";
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<LeaveTypeValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      status: "active",
      condition: "paid",
      maxDays: 0,
      code: "",
      carryForwardAllowed: false,
    },
  });

  const status = watch("status");
  const condition = watch("condition");

  useEffect(() => {
    if (open) {
      reset(initialData || {
        name: "",
        code: "",
        status: "active",
        condition: "paid",
        maxDays: 0,
        carryForwardAllowed: false,
        description: "",
      });
    }
  }, [open, initialData, reset]);

  const handleFormSubmit = (data: LeaveTypeValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRTL ? "left" : "right"}
        showCloseButton={false}
        className="w-full sm:!max-w-[800px] border-none p-0 focus:outline-none"
      >
        <div className="flex h-full flex-col bg-background overflow-y-auto">
          <div className="flex flex-col px-10 pt-6 gap-6">
            <div className="flex justify-end h-[68px] items-start">
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-[44px] h-[36px] p-[8px_12px] rounded-lg hover:bg-muted"
                >
                  <X className="size-5 text-foreground/80" strokeWidth={1.33} />
                </Button>
              </SheetClose>
            </div>

            <div className="flex flex-col gap-6">
              <SheetTitle className="text-start text-2xl font-bold leading-8 text-foreground p-0">
                {isEditing 
                  ? t("leavePolicies.addLeaveType.titleUpdate") 
                  : t("leavePolicies.addLeaveType.title")}
              </SheetTitle>
              <div className="w-full border-t border-border" />
            </div>
          </div>

          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="flex flex-1 flex-col px-10 py-6 gap-8"
          >
            <div className="flex flex-col w-full rounded-xl border border-border/80 bg-card shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="flex h-[50px] items-center bg-muted px-6">
                <h3 className="font-sans text-sm font-semibold text-foreground">
                  {t("leavePolicies.addLeaveType.leaveInfo")}
                </h3>
              </div>
              
              <div className="flex flex-col gap-4 px-6 py-6">
                <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
                  <div className="flex flex-col gap-6">
                    <FormField
                      id="name"
                      label={t("leavePolicies.addLeaveType.leaveName")}
                      placeholder={t("leavePolicies.addLeaveType.leaveNamePlaceholder")}
                      register={register}
                      name="name"
                      error={errors.name}
                      t={t}
                    />
                  </div>

                  <div className="flex flex-col gap-6">
                    <FormSelect
                      id="code"
                      label={t("leavePolicies.addLeaveType.code", { defaultValue: "Code" })}
                      placeholder={t("leavePolicies.addLeaveType.codePlaceholder", { defaultValue: "Select Code" })}
                      control={control}
                      name="code"
                      error={errors.code}
                      options={[
                        { label: "Annual", value: "annual" },
                        { label: "Sick", value: "sick" },
                        { label: "Unpaid", value: "unpaid" },
                        { label: "Maternity", value: "maternity" },
                        { label: "Custom", value: "custom" }
                      ]}
                      t={t}
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-6">
                    <FormSelect
                      id="status"
                      label={t("leavePolicies.addLeaveType.status")}
                      placeholder={t("leavePolicies.addLeaveType.status")}
                      control={control}
                      name="status"
                      options={[
                        { label: t("leavePolicies.addLeaveType.statusActive"), value: "active" },
                        { label: t("leavePolicies.addLeaveType.statusInactive"), value: "inactive" }
                      ]}
                      t={t}
                    />
                  </div>

                  {/* Max Days */}
                  <div className="flex flex-col gap-6">
                    <FormField
                      id="maxDays"
                      label={t("leavePolicies.addLeaveType.maxDays")}
                      placeholder={t("leavePolicies.addLeaveType.maxDaysPlaceholder")}
                      register={register}
                      name="maxDays"
                      error={errors.maxDays}
                      type="number"
                      validation={{ valueAsNumber: true }}
                      t={t}
                    />
                  </div>

                  {/* Condition */}
                  <div className="flex flex-col gap-6">
                    <FormSelect
                      id="condition"
                      label={t("leavePolicies.addLeaveType.condition")}
                      placeholder={t("leavePolicies.addLeaveType.condition")}
                      control={control}
                      name="condition"
                      options={[
                        { label: t("leavePolicies.addLeaveType.conditionPaid"), value: "paid" },
                        { label: t("leavePolicies.addLeaveType.conditionUnpaid"), value: "unpaid" }
                      ]}
                      t={t}
                    />
                  </div>

                  {/* Carry Forward Allowed */}
                  <div className="flex flex-col gap-6 justify-center mt-2">
                    <div className="flex items-center gap-2 rtl:flex-row-reverse w-full">
                      <Label className="font-sans text-sm font-medium text-foreground leading-5 flex-1">
                        {t("leavePolicies.addLeaveType.carryForward", { defaultValue: "Allow Carry Forward" })}
                      </Label>
                      <input
                        type="checkbox"
                        {...register("carryForwardAllowed")}
                        className="w-4 h-4 rounded border-border"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-6 w-full h-[142px]">
                  <Label className="font-sans text-sm font-medium text-foreground leading-5">
                    {t("leavePolicies.addLeaveType.description")}
                  </Label>
                  <Textarea
                    {...register("description")}
                    placeholder={t("leavePolicies.addLeaveType.descriptionPlaceholder")}
                    className="min-h-[110px] rounded-lg border-border bg-background px-3 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons (Container) */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-6 py-4 h-[68px]">
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 w-full sm:w-[100px] border-primary/50 text-sm font-medium text-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)] hover:bg-primary/5 rounded-lg"
                >
                  {t("leavePolicies.addLeaveType.actions.cancel")}
                </Button>
              </SheetClose>
              <Button
                type="submit"
                className="h-9 w-full sm:w-[134px] bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 rounded-lg"
              >
                {isEditing 
                  ? t("leavePolicies.addLeaveType.actions.saveUpdate") 
                  : t("leavePolicies.addLeaveType.actions.save")}
              </Button>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
