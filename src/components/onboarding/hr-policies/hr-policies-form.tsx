"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Clock, Settings, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormSelect } from "@/components/ui/FormSelect";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { hrPoliciesSchema, type HrPoliciesValues } from "@/components/onboarding/schemas/hr-policies";
import { cn } from "@/lib/utils";
import { AddLeaveTypeSheet } from "@/components/onboarding/hr-policies/add-leave-type-sheet";
import { AddHolidaySheet } from "@/components/onboarding/hr-policies/add-holiday-sheet";
import { type LeaveTypeValues } from "@/components/onboarding/schemas/leave-type";
import { type HolidayValues } from "@/components/onboarding/schemas/holiday";
import { WEEK_DAYS, CALENDAR_TYPES } from '@/features/attendance/attendance.utils';


interface HrPoliciesFormProps {
  onNext?: () => void;
  onBack?: () => void;
}

import { useOnboarding } from "@/components/onboarding/context/OnboardingContext";
import { useCompanyOptions } from "@/features/organization/hooks/useOrganization";
import { useCreateShiftTemplate, useCreateHoliday } from "@/features/attendance/hooks/useAttendance";
import { ShiftType } from "@/features/attendance/attendance.types";
import { useCreateLeaveType } from "@/features/leave-type/hooks/useLeaveType";
import { VALID_LEAVE_CODES } from "@/features/leave-type/leave-type.types";
import { useToast } from "@/hooks/use-toast";

export function HrPoliciesForm({ onNext, onBack }: HrPoliciesFormProps) {
  const { toast } = useToast();
  const { t, i18n } = useTranslation("hrPolicies");
  const router = useRouter();
  const { setPoliciesData, policiesData } = useOnboarding();
  const [isLeaveSheetOpen, setIsLeaveSheetOpen] = useState(false);
  const [isHolidaySheetOpen, setIsHolidaySheetOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editingPolicyData, setEditingPolicyData] = useState<LeaveTypeValues | null>(null);
  const [editingHolidayId, setEditingHolidayId] = useState<string | null>(null);
  const [editingHolidayData, setEditingHolidayData] = useState<HolidayValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Queries and mutations
  const { companies: companiesData, isLoading: isLoadingCompanies } = useCompanyOptions();
  const { mutateAsync: createShiftTemplate } = useCreateShiftTemplate();
  const { mutateAsync: createLeaveType } = useCreateLeaveType();
  const { mutateAsync: createHoliday } = useCreateHoliday();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<HrPoliciesValues>({
    resolver: zodResolver(hrPoliciesSchema),
    defaultValues: Object.keys(policiesData).length > 0 ? policiesData : {
      scheduleType: "gregorian",
      scheduleName: "Standard Shift",
      breakDuration: 60,
      flexibleMinutes: 15,
      overtimeAllowed: true,
      workDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      shiftStart: "09:00:00",
      shiftEnd: "17:00:00",
      leavePolicies: [
        { id: "annual", name: "Annual Leave", code: "annual", enabled: true, days: 25, condition: "paid", carryForwardAllowed: false, description: "Standard annual leave" },
        { id: "sick", name: "Sick Leave", code: "sick", enabled: true, days: 10, condition: "paid", carryForwardAllowed: false, description: "Sick leave" },
        { id: "maternity", name: "Maternity Leave", code: "maternity", enabled: true, days: 90, condition: "paid", carryForwardAllowed: true, description: "Maternity leave policy" },
      ] as any,
      holidays: [
        { id: "newYear", name: "New Year", enabled: true, date: new Date(new Date().getFullYear(), 0, 1).toISOString(), isReligious: false, type: "gregorian" },
      ] as any,
    },
  });

  const selectedDays = watch("workDays");
  const scheduleType = watch("scheduleType");
  const leavePolicies = watch("leavePolicies");
  const holidays = watch("holidays");
  const formCompanyOuId = watch("companyOuId");

  useEffect(() => {
    if (companiesData && companiesData.length > 0 && !formCompanyOuId) {
      setValue("companyOuId", companiesData[0].id, { shouldValidate: true });
    }
  }, [companiesData, formCompanyOuId, setValue]);

  const toggleDay = (day: string) => {
    const current = [...selectedDays];
    const index = current.indexOf(day);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(day);
    }
    setValue("workDays", current, { shouldValidate: true });
  };

  const updateLeavePolicy = (id: string, field: "enabled" | "days", value: boolean | number) => {
    const updated = leavePolicies.map(p => p.id === id ? { ...p, [field]: value } : p);
    setValue("leavePolicies", updated, { shouldValidate: true });
  };

  const handleEditLeavePolicy = (policy: HrPoliciesValues["leavePolicies"][number]) => {
    const policyData: LeaveTypeValues = {
      name: policy.name || t(`leavePolicies.types.${policy.id}.name`),
      code: (policy as any).code || "",
      carryForwardAllowed: (policy as any).carryForwardAllowed || false,
      status: policy.enabled ? "active" : "inactive",
      maxDays: policy.days,
      condition: (policy.condition as "paid" | "unpaid") || "paid",
      description: policy.description || t(`leavePolicies.types.${policy.id}.description`),
    };
    setEditingPolicyId(policy.id);
    setEditingPolicyData(policyData);
    setIsLeaveSheetOpen(true);
  };

  const handleLeaveSheetSubmit = (data: LeaveTypeValues) => {
    if (editingPolicyId) {
      // Update existing policy
      const updated = leavePolicies.map((p) => 
        p.id === editingPolicyId 
          ? { 
              ...p, 
              name: data.name,
              code: data.code,
              enabled: data.status === "active", 
              days: data.maxDays,
              condition: data.condition,
              carryForwardAllowed: data.carryForwardAllowed,
              description: data.description 
            } 
          : p
      );
      setValue("leavePolicies", updated, { shouldValidate: true });
    } else {
      // Add new policy
      const newPolicy = {
        id: data.name.toLowerCase().replace(/\s+/g, "-"),
        name: data.name,
        code: data.code,
        enabled: data.status === "active",
        days: data.maxDays,
        condition: data.condition,
        carryForwardAllowed: data.carryForwardAllowed,
        description: data.description,
      };
      setValue("leavePolicies", [...leavePolicies, newPolicy], { shouldValidate: true });
    }
    // Reset editing state
    setEditingPolicyId(null);
    setEditingPolicyData(null);
  };

  const updateHoliday = (id: string, enabled: boolean) => {
    const updated = holidays.map(h => h.id === id ? { ...h, enabled } : h);
    setValue("holidays", updated, { shouldValidate: true });
  };

  const handleEditHoliday = (holiday: HrPoliciesValues["holidays"][number]) => {
    const holidayData: HolidayValues = {
      name: holiday.name || t(`holidays.list.${holiday.id}`),
      date: holiday.date ? (holiday.date.includes('T') ? holiday.date.split('T')[0] : holiday.date) : "",
      isReligious: (holiday as any).isReligious || false,
      type: (holiday as any).type || "gregorian",
    };
    setEditingHolidayId(holiday.id);
    setEditingHolidayData(holidayData);
    setIsHolidaySheetOpen(true);
  };

  const handleHolidaySheetSubmit = (data: HolidayValues) => {
    if (editingHolidayId) {
      const updated = holidays.map(h => 
        h.id === editingHolidayId 
        ? {
            ...h,
            name: data.name,
            date: data.date,
            isReligious: data.isReligious,
            type: data.type
          }
        : h
      );
      setValue("holidays", updated, { shouldValidate: true });
    } else {
      const newHoliday = {
        id: data.name.toLowerCase().replace(/\s+/g, "-"),
        name: data.name,
        enabled: true,
        date: data.date,
        isReligious: data.isReligious,
        type: data.type,
      };
      setValue("holidays", [...holidays, newHoliday], { shouldValidate: true });
    }
    setEditingHolidayId(null);
    setEditingHolidayData(null);
  };

  const formatHolidayDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const onSubmit = async (data: HrPoliciesValues) => {
    if (!data.companyOuId) {
      toast({ title: t("setup.error"), description: t("setup.selectCompanyFirst", { defaultValue: "Please select a company first." }), variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    try {
      // 1. Shift Template
      const currentDate = new Date().toISOString().split('T')[0];
      const parseTime = (timeStr: string) => {
        try {
          return new Date(`${currentDate}T${timeStr}`).toISOString();
        } catch(err) {
          return new Date().toISOString();
        }
      };

      const dayMap: Record<string, number> = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
      let workingDaysMapped = data.workDays.map((d: any) => dayMap[d as string] || 1);
      if (workingDaysMapped.length === 0) workingDaysMapped = [1,2,3,4,5];

      await createShiftTemplate({
        companyOuId: data.companyOuId,
        name: "Standard Shift",
        startTime: parseTime(data.shiftStart),
        endTime: parseTime(data.shiftEnd),
        workingDays: workingDaysMapped,
        breakDuration: data.breakDuration || 60,
        flexibleMinutes: data.flexibleMinutes || 15,
        overtimeAllowed: data.overtimeAllowed !== false,
        type: ShiftType.DAY,
      });

      // 2. Leave Types
      const leavesToCreate = data.leavePolicies.filter((l: any) => l.enabled);
      const leavePromises = leavesToCreate.map((l: any) => {
        const backendCode = VALID_LEAVE_CODES.includes((l as any).code) ? (l as any).code : VALID_LEAVE_CODES.includes(l.id as any) ? l.id : "custom";       
        return createLeaveType({
          code: backendCode,
          name: l.name || "",
          maxDaysPerYear: l.days || 0,
          paid: l.condition === "paid",
          carryForwardAllowed: (l as any).carryForwardAllowed || false,
          companyOuId: data.companyOuId!,
        }).catch(err => {
          // If the leave type already exists, we ignore the error and continue
          if (err.message?.includes("LEAVE_TYPE_CODE_EXISTS") || err.message?.includes("LEAVE_TYPES_CODE_EXISTS")) {
            return null;
          }
          throw err;
        });
      });
      await Promise.all(leavePromises);

      // 3. Holidays
      const holidaysToCreate = data.holidays.filter((h: any) => h.enabled);
      const holidayPromises = holidaysToCreate.map((h: any) => {
        let hDate = new Date();
        if (h.date) hDate = new Date(h.date);
        
        return createHoliday({
          companyOuId: data.companyOuId!,
          name: h.name || (h as any).id,
          date: hDate.toISOString(),
          isReligious: (h as any).isReligious || false,
          type: data.scheduleType as any,
          year: hDate.getFullYear(),
        }).catch(err => {
          // If the holiday already exists or has a conflict, we ignore the error and continue
          if (err.message?.includes("CONFLICT")) {
            return null;
          }
          throw err;
        });
      });
      await Promise.all(holidayPromises);

      toast({ title: "Success", description: t("setup.successMessage", { defaultValue: "Policies successfully saved!" }) });
      setPoliciesData(data);
      if (onNext) {
        onNext();
      } else {
        router.push("/onboarding/payroll-structure");
      }
    } catch (err: any) {
       console.error("Error saving policy:", err);
       toast({ title: "Error", description: err.message || t("setup.errorMessage", { defaultValue: "Failed to save policy." }), variant: "destructive" });
    } finally {
       setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-20">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="overflow-hidden rounded-xl border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] bg-card">
          <div className="flex h-[50px] items-center bg-muted/40 border-b border-border px-6 rtl:flex-row-reverse">
            <h3 className="text-sm font-semibold text-foreground">{t("setup.title")}</h3>
          </div>
          
          <CardContent className="flex flex-col p-6 gap-6">
            {/* Select company block */}
            <div className="flex flex-col gap-3">
               <FormSelect
                 id="companyOuId"
                 label={t("setup.selectCompany")}
                 placeholder={isLoadingCompanies ? t("setup.loadingCompanies", { defaultValue: "Loading..." }) : t("setup.selectCompanyPlaceholder")}
                 control={control}
                 name="companyOuId"
                 error={errors.companyOuId}
                 options={companiesData?.map(c => ({ label: c.name, value: c.id })) || []}
                 t={t}
               />
            </div>

            <div className="w-full border-t border-border" />

            {/* Working Hours Section (No Wrapper Card) */}
            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-semibold text-foreground rtl:text-end">{t("workingHours.title")}</h4>
              <RadioGroup 
                value={scheduleType}
                onValueChange={(val) => setValue("scheduleType", val as any, { shouldValidate: true })}
                className="grid grid-cols-1 gap-4 md:grid-cols-3 px-6"
              >
                {CALENDAR_TYPES.map((type) => (
                  <Label
                    key={type}
                    htmlFor={`schedule-${type}`}
                    className={cn(
                      "relative flex cursor-pointer flex-col gap-3 rounded-2xl border p-4 transition-all hover:bg-muted/50",
                      "rtl:text-end",
                      scheduleType === type ? "border-button-foreground ring-1 ring-primary shadow-sm bg-[#2865E31F]" : "border-[#136DEC]/20"
                    )}
                  >
                    <div className="flex items-start gap-3 rtl:flex-row-reverse">
                      <RadioGroupItem 
                        value={type} 
                        id={`schedule-${type}`} 
                        className="mt-1 shrink-0 bg-background border-primary" 
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{t(`workingHours.${type}.title`)}</p>
                        <p className="text-[12px] font-normal leading-relaxed text-muted-foreground">
                          {t(`workingHours.${type}.description`)}
                        </p>
                      </div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>
            
            {/* Work Days */}
            <div className="space-y-4 px-6">
              <Label className="text-sm font-medium text-foreground rtl:text-end block">{t("workingHours.workDays")}</Label>
              <div className="flex flex-wrap gap-3 rtl:flex-row-reverse">
                {WEEK_DAYS.map(({ label: day }) => (
                  <Button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "h-8 w-16 rounded-lg text-xs font-bold transition-colors",
                      selectedDays.includes(day) 
                        ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                        : "bg-muted text-muted-foreground hover:bg-button-background"
                    )}
                  >
                    {t(`workingHours.days.${day}`)}
                  </Button>
                ))}
              </div>
              {errors.workDays && (
                <p className="text-xs text-destructive rtl:text-end">{t(`errors.${errors.workDays.message}`)}</p>
              )}
            </div>

            {/* Shift Times & Advanced Working Hours */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 px-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground rtl:text-end block">{t("workingHours.scheduleName", { defaultValue: "Schedule Name" })}</Label>
                <Input 
                  {...register("scheduleName")}
                  placeholder="e.g. Standard Day Shift"
                  className={cn("w-full border-border bg-background", errors.scheduleName && "border-destructive")}
                />
                {errors.scheduleName && <p className="text-xs text-destructive">{errors.scheduleName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground rtl:text-end block">{t("workingHours.shiftStart")}</Label>
                <div className="relative">
                  <Clock className="absolute inset-is-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground ml-3" />
                  <Input 
                    type="time"
                    step="1"
                    {...register("shiftStart")}
                    placeholder={t("workingHours.shiftStartPlaceholder")}
                    className={cn("w-full ps-10 border-border bg-background dark:scheme-dark", errors.shiftStart && "border-destructive")}
                  />
                </div>
                {errors.shiftStart && (
                  <p className="text-xs text-destructive rtl:text-end">{t(`errors.${errors.shiftStart.message}`)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground rtl:text-end block">{t("workingHours.shiftEnd")}</Label>
                <div className="relative">
                  <Clock className="absolute inset-is-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground ml-3" />
                  <Input 
                    type="time"
                    step="1"
                    {...register("shiftEnd")}
                    placeholder={t("workingHours.shiftEndPlaceholder")}
                    className={cn("w-full ps-10 border-border bg-background dark:scheme-dark", errors.shiftEnd && "border-destructive")}
                  />
                </div>
                {errors.shiftEnd && (
                  <p className="text-xs text-destructive rtl:text-end">{t(`errors.${errors.shiftEnd.message}`)}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground rtl:text-end block">{t("workingHours.breakDuration", { defaultValue: "Break Duration (min)" })}</Label>
                <Input 
                  type="number"
                  {...register("breakDuration", { valueAsNumber: true })}
                  className={cn("w-full border-border bg-background dark:scheme-dark", errors.breakDuration && "border-destructive")}
                />
                {errors.breakDuration && <p className="text-xs text-destructive">{errors.breakDuration.message}</p>}
              </div>
              <div className="space-y-2">
                 <Label className="text-sm font-semibold text-foreground rtl:text-end block">{t("workingHours.flexibleMinutes", { defaultValue: "Flexible Minutes" })}</Label>
                 <Input 
                   type="number"
                   {...register("flexibleMinutes", { valueAsNumber: true })}
                   className={cn("w-full border-border bg-background dark:scheme-dark", errors.flexibleMinutes && "border-destructive")}
                 />
                 {errors.flexibleMinutes && <p className="text-xs text-destructive">{errors.flexibleMinutes.message}</p>}
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input 
                  type="checkbox"
                  {...register("overtimeAllowed")}
                  className="w-4 h-4 rounded border-border"
                />
                <Label>{t("workingHours.overtimeAllowed", { defaultValue: "Overtime Allowed" })}</Label>
              </div>
            </div>

            <div className="w-full border-t border-border" />

            {/* Leave Policies Section (No Wrapper Card) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center flex-row rtl:flex-row-reverse">
                <h4 className="text-sm font-semibold text-foreground">{t("leavePolicies.title")}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingPolicyId(null);
                    setEditingPolicyData(null);
                    setIsLeaveSheetOpen(true);
                  }}
                  className="h-auto p-0 text-sm font-medium text-primary hover:bg-transparent hover:text-primary/80"
                >
                  <Plus className="me-1 size-4" />
                  {t("leavePolicies.addNew")}
                </Button>
              </div>
              
              <div className="space-y-4 px-6">
                {leavePolicies.map((policy) => (
                  <div key={policy.id} className="flex flex-col items-start justify-between gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center rtl:flex-row-reverse bg-background">
                    <div className="flex gap-4 items-center rtl:flex-row-reverse">
                      <Checkbox 
                        checked={policy.enabled} 
                        onCheckedChange={(checked) => updateLeavePolicy(policy.id, "enabled", !!checked)}
                      />
                      <div className="space-y-1 rtl:text-end">
                        <p className="text-sm font-medium text-foreground">
                          {policy.name || t(`leavePolicies.types.${policy.id}.name`)}
                        </p>
                        <p className="text-xs font-normal text-muted-foreground">
                          {policy.description || t(`leavePolicies.types.${policy.id}.description`)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rtl:flex-row-reverse">
                      <div className="flex items-center gap-2 rtl:flex-row-reverse">
                        <Input 
                          type="number" 
                          value={policy.days}
                          onChange={(e) => updateLeavePolicy(policy.id, "days", parseInt(e.target.value) || 0)}
                          className="h-9 w-16 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-auto [&::-webkit-inner-spin-button]:appearance-auto bg-background dark:scheme-dark"
                        />
                        <span className="text-sm font-medium text-foreground">{t("leavePolicies.days")}</span>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditLeavePolicy(policy)}
                        className="size-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full border-t border-border" />

            {/* Holiday Calendar Section (No Wrapper Card) */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center flex-row rtl:flex-row-reverse">
                <h4 className="text-sm font-semibold text-foreground">{t("holidays.title")}</h4>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setEditingHolidayId(null);
                    setEditingHolidayData(null);
                    setIsHolidaySheetOpen(true);
                  }}
                  className="h-auto p-0 text-sm font-medium text-primary hover:bg-transparent hover:text-primary/80"
                >
                  <Plus className="me-1 size-4" />
                  {t("holidays.addNew")}
                </Button>
              </div>

              <div className="space-y-4 px-6">
                {holidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between rounded-xl border border-border p-4 rtl:flex-row-reverse bg-background">
                    <div className="flex items-center gap-4 rtl:flex-row-reverse">
                      <Checkbox 
                        checked={holiday.enabled} 
                        onCheckedChange={(checked) => updateHoliday(holiday.id, !!checked)}
                      />
                      <span className="text-sm font-medium text-foreground rtl:text-end">
                        {holiday.name || t(`holidays.list.${holiday.id}`)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 rtl:flex-row-reverse">
                      <span className="text-sm font-medium text-foreground">
                        {holiday.date ? formatHolidayDate(holiday.date) : t(`holidays.list.${holiday.id}${"Date"}`)}
                      </span>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditHoliday(holiday)}
                        className="size-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 pb-10">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                router.push("/onboarding/organization-structure");
              }
            }}
            className="flex items-center gap-2 text-sm font-medium text-foreground/80 transition-transform hover:translate-x-[-4px] rtl:hover:translate-x-[4px] rtl:flex-row-reverse"
          >
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {t("actions.back")}
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            size="lg"
            className="px-8 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSaving ? t("actions.saving", { defaultValue: "Saving..." }) : t("actions.continue")}
          </Button>
        </div>
      </form>

      <AddLeaveTypeSheet
        open={isLeaveSheetOpen}
        onOpenChange={(open) => {
          setIsLeaveSheetOpen(open);
          if (!open) {
            setEditingPolicyId(null);
            setEditingPolicyData(null);
          }
        }}
        initialData={editingPolicyData}
        onSubmit={handleLeaveSheetSubmit}
      />
      <AddHolidaySheet
        open={isHolidaySheetOpen}
        onOpenChange={(open) => {
          setIsHolidaySheetOpen(open);
          if (!open) {
            setEditingHolidayId(null);
            setEditingHolidayData(null);
          }
        }}
        initialData={editingHolidayData}
        defaultCalendarType={scheduleType}
        onSubmit={handleHolidaySheetSubmit}
      />
    </div>
  );
}
