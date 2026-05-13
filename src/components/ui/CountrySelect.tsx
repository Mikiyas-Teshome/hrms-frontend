import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Control, Controller, FieldError, FieldValues, Path } from "react-hook-form";
import { getAllCountries } from "countries-and-timezones";

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  error?: FieldError;
  t: (key: string) => string;
  disabled?: boolean;
  id?: string;
};

export function CountrySelect<T extends FieldValues>({ control, name, label, placeholder, error, t, disabled, id }: Props<T>) {
  const [open, setOpen] = useState(false);
  const { i18n } = useTranslation();

  const countries = useMemo(() => {
    try {
      const displayNames = new Intl.DisplayNames([i18n.language || "en"], { type: "region" });
      return Object.values(getAllCountries())
        .map((country) => ({
          value: country.id,
          label: displayNames.of(country.id) || country.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    } catch (e) {
      return Object.values(getAllCountries())
        .map((country) => ({
          value: country.id,
          label: country.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    }
  }, [i18n.language]);

  return (
    <div className="space-y-3">
      <Label htmlFor={id} className="text-sm font-medium text-foreground rtl:text-end block">{label}</Label>
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
                  ? (countries.find((c) => c.value === field.value)?.label || field.value)
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder={placeholder} />
                <CommandList>
                  <CommandEmpty>{t("errors.noResults") || "No country found."}</CommandEmpty>
                  <CommandGroup>
                    {countries.map((c) => (
                      <CommandItem
                        key={c.value}
                        value={c.label}
                        onSelect={() => {
                          field.onChange(c.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === c.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {c.label}
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
          {error.message && (error.message.includes(' ') ? error.message : t(error.message.includes('errors.') ? error.message : `errors.${error.message}`))}
        </p>
      )}
    </div>
  );
}
