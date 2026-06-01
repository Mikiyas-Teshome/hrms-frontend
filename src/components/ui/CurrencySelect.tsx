import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Control, Controller, FieldError, FieldValues, Path } from "react-hook-form";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  error?: FieldError;
  t: (key: string) => string;
  disabled?: boolean;
};

export function CurrencySelect<T extends FieldValues>({ control, name, label, placeholder, error, t, disabled }: Props<T>) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  const currencies = useMemo(() => {
    try {
      const codes = Intl.supportedValuesOf("currency");
      const displayNames = new Intl.DisplayNames([i18n.language || "en"], { type: "currency" });
      return codes
        .map((code) => ({
          value: code,
          label: `${code} - ${displayNames.of(code)}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch {
      // Fallback for environments that might not support Intl.supportedValuesOf
      return [
        { value: "USD", label: "USD - US Dollar" },
        { value: "AED", label: "AED - UAE Dirham" },
        { value: "EUR", label: "EUR - Euro" },
        { value: "GBP", label: "GBP - British Pound" },
      ];
    }
  }, [i18n.language]);

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground rtl:text-end block">{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                disabled={disabled}
                className={cn(
                  "w-full justify-between font-normal h-9 px-4 rounded-[8px] bg-background border border-input focus:border-primary focus:ring-primary/20",
                  !field.value && "text-muted-foreground",
                  error && "border-destructive"
                )}
              >
                {field.value
                  ? currencies.find((curr) => curr.value === field.value)?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder={placeholder} />
                <CommandList>
                  <CommandEmpty>{t("errors.noResults") || "No currency found."}</CommandEmpty>
                  <CommandGroup>
                    {currencies.map((curr) => (
                      <CommandItem
                        key={curr.value}
                        value={curr.label}
                        onSelect={() => {
                          field.onChange(curr.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === curr.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {curr.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
      {error && (
        <p className="text-xs text-destructive rtl:text-end">
          {error.message?.includes('errors.') ? t(error.message) : error.message}
        </p>
      )}
    </div>
  );
}
