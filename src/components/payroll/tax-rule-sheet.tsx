"use client";

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FormSection } from "@/components/ui/form-section";
import { FormSelect } from "@/components/ui/FormSelect";
import {
  CreateTaxRuleInput,
  TaxRuleResponse,
  TaxRuleStatus,
} from "@/features/payroll/tax-rules/tax-rules.types";
import { taxRuleSchema, TaxRuleFormValues } from '@/features/payroll/schemas/tax-rule.schema';

const defaultBracket = (): TaxRuleFormValues["brackets"][number] => ({
  minAmount: 0,
  maxAmount: null,
  rate: 0,
  sortOrder: 0,
});

function buildNextBracket(
  brackets: TaxRuleFormValues["brackets"],
): TaxRuleFormValues["brackets"][number] {
  const last = brackets[brackets.length - 1];
  if (!last) {
    return defaultBracket();
  }

  const previousMax = last.maxAmount;
  const minAmount =
    previousMax != null && !Number.isNaN(previousMax)
      ? previousMax
      : Number(last.minAmount) || 0;

  return {
    minAmount,
    maxAmount: null,
    rate: 0,
    sortOrder: brackets.length,
  };
}

function buildFormValues(rule?: TaxRuleResponse | null): TaxRuleFormValues {
  if (!rule) {
    return {
      name: "",
      description: "",
      status: TaxRuleStatus.inactive,
      effectiveFrom: new Date().toISOString().slice(0, 10),
      effectiveTo: "",
      brackets: [
        { minAmount: 0, maxAmount: 1000, rate: 0, sortOrder: 0 },
        { minAmount: 1000, maxAmount: null, rate: 10, sortOrder: 1 },
      ],
    };
  }

  return {
    name: rule.name,
    description: rule.description ?? "",
    status: rule.status,
    effectiveFrom: rule.effectiveFrom.slice(0, 10),
    effectiveTo: rule.effectiveTo ? rule.effectiveTo.slice(0, 10) : "",
    brackets: rule.brackets.map((bracket, index) => ({
      minAmount: bracket.minAmount,
      maxAmount: bracket.maxAmount ?? null,
      rate: bracket.rate,
      sortOrder: bracket.sortOrder ?? index,
    })),
  };
}

type TaxRuleSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: TaxRuleResponse | null;
  onSubmit: (values: CreateTaxRuleInput) => Promise<boolean>;
  isSubmitting?: boolean;
};

export function TaxRuleSheet({
  open,
  onOpenChange,
  initial,
  onSubmit,
  isSubmitting = false,
}: TaxRuleSheetProps) {
  const { t } = useTranslation("payroll");
  const isEditing = Boolean(initial?.id);
  const wasOpenRef = useRef(false);
  const loadedRuleIdRef = useRef<string | undefined>(undefined);

  const form = useForm<TaxRuleFormValues>({
    resolver: zodResolver(taxRuleSchema) as never,
    defaultValues: buildFormValues(initial),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "brackets",
  });

  useEffect(() => {
    const ruleId = initial?.id ?? "new";
    if (open && (!wasOpenRef.current || loadedRuleIdRef.current !== ruleId)) {
      form.reset(buildFormValues(initial));
      loadedRuleIdRef.current = ruleId;
    }
    wasOpenRef.current = open;
  }, [open, initial, form]);

  const handleAddBracket = () => {
    const brackets = form.getValues("brackets");
    append(buildNextBracket(brackets));
  };

  const handleFormSubmit = async (values: TaxRuleFormValues) => {
    const saved = await onSubmit({
      name: values.name.trim(),
      description: values.description?.trim() || undefined,
      status: values.status,
      effectiveFrom: values.effectiveFrom,
      effectiveTo: values.effectiveTo || undefined,
      brackets: values.brackets.map((bracket, index) => ({
        minAmount: Number(bracket.minAmount),
        maxAmount: bracket.maxAmount == null ? null : Number(bracket.maxAmount),
        rate: Number(bracket.rate),
        sortOrder: index,
      })),
    });
    if (saved) {
      onOpenChange(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="sm:max-w-2xl px-10 py-6 gap-6 flex flex-col h-full border-0 shadow-2xl bg-background"
      >
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle className="text-2xl font-bold text-foreground">
            {isEditing
              ? t("taxRules.sheet.editTitle", "Edit tax rule")
              : t("taxRules.sheet.createTitle", "Create tax rule")}
          </SheetTitle>
          <SheetClose className="text-foreground/80 hover:text-foreground transition-colors rounded-lg cursor-pointer">
            <X className="h-5 w-5" strokeWidth={1.33} />
            <span className="sr-only">{t("taxRules.sheet.cancel", "Cancel")}</span>
          </SheetClose>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Form {...form}>
            <form
              id="tax-rule-form"
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-8"
            >
              <FormSection
                title={t("taxRules.sheet.ruleInfo", "Rule info")}
                description={t(
                  "taxRules.sheet.ruleInfoDesc",
                  "Name, status, and effective dates for this tax rule.",
                )}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="space-y-3 md:col-span-2">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t("taxRules.sheet.name", "Name")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={t("taxRules.sheet.namePlaceholder", "e.g. 2026 Income tax")}
                            {...field}
                            className="h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="space-y-3 md:col-span-2">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t("taxRules.sheet.description", "Description")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t(
                              "taxRules.sheet.descriptionPlaceholder",
                              "Optional notes for payroll officers",
                            )}
                            {...field}
                            className="min-h-24 resize-none border-border shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormSelect
                    id="tax-rule-status"
                    label={t("taxRules.sheet.status", "Status")}
                    control={form.control}
                    name="status"
                    t={t}
                    options={[
                      {
                        label: t("taxRules.status.active", "Active"),
                        value: TaxRuleStatus.active,
                      },
                      {
                        label: t("taxRules.status.inactive", "Inactive"),
                        value: TaxRuleStatus.inactive,
                      },
                    ]}
                  />

                  <FormField
                    control={form.control}
                    name="effectiveFrom"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t("taxRules.sheet.effectiveFrom", "Effective from")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg dark:scheme-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="effectiveTo"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-medium text-foreground">
                          {t("taxRules.sheet.effectiveTo", "Effective to (optional)")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            className="h-9 border-border focus:border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-lg dark:scheme-dark"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormSection>

              <FormSection
                title={t("taxRules.sheet.bracketsTitle", "Tax brackets")}
                description={t(
                  "taxRules.sheet.bracketsDesc",
                  "Progressive rates applied to taxable income in order.",
                )}
              >
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-lg"
                    onClick={handleAddBracket}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t("taxRules.sheet.addBracket", "Add bracket")}
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="rounded-xl border border-border bg-muted/20 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">
                          {t("taxRules.sheet.bracketLabel", "Bracket {{index}}", {
                            index: index + 1,
                          })}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          disabled={fields.length <= 1}
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`brackets.${index}.minAmount`}
                          render={({ field: bracketField }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-medium text-foreground">
                                {t("taxRules.sheet.minAmount", "Min amount")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  value={bracketField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    bracketField.onChange(value === "" ? 0 : Number(value));
                                  }}
                                  className="h-9 border-border rounded-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`brackets.${index}.maxAmount`}
                          render={({ field: bracketField }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-medium text-foreground">
                                {t("taxRules.sheet.maxAmount", "Max amount")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step="0.01"
                                  placeholder={t("taxRules.sheet.unlimited", "Unlimited")}
                                  value={bracketField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    bracketField.onChange(value === "" ? null : Number(value));
                                  }}
                                  className="h-9 border-border rounded-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`brackets.${index}.rate`}
                          render={({ field: bracketField }) => (
                            <FormItem className="space-y-3">
                              <FormLabel className="text-sm font-medium text-foreground">
                                {t("taxRules.sheet.rate", "Rate %")}
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  step="0.01"
                                  value={bracketField.value ?? ""}
                                  onChange={(event) => {
                                    const value = event.target.value;
                                    bracketField.onChange(value === "" ? 0 : Number(value));
                                  }}
                                  className="h-9 border-border rounded-lg"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {form.formState.errors.brackets?.message ? (
                  <p className="text-xs text-destructive">
                    {String(form.formState.errors.brackets.message)}
                  </p>
                ) : null}
              </FormSection>
            </form>
          </Form>
        </div>

        <SheetFooter className="border-t border-border mt-auto shrink-0 pt-6">
          <div className="flex justify-end gap-3 w-full sm:w-auto">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="h-9 min-w-25 px-4 font-medium rounded-lg border-muted-foreground/20 text-foreground/80 hover:bg-muted flex-1 sm:flex-none"
              >
                {t("taxRules.sheet.cancel", "Cancel")}
              </Button>
            </SheetClose>
            <Button
              type="submit"
              form="tax-rule-form"
              disabled={isSubmitting}
              className="h-9 min-w-25 px-4 font-medium rounded-lg bg-primary hover:bg-primary/80 text-[#FAFAFA] flex-1 sm:flex-none"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isEditing
                ? t("taxRules.sheet.save", "Save tax rule")
                : t("taxRules.sheet.create", "Create tax rule")}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
