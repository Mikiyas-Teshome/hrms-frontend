import React, { useMemo, useState } from "react";
import ct from "countries-and-timezones";
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

export function TimezoneSelect<T extends FieldValues>({ control, name, label, placeholder, error, t, disabled }: Props<T>) {
  const [open, setOpen] = useState(false);

  const timezones = useMemo(() => {
    return Object.values(ct.getAllTimezones())
      .map((tz) => ({
        value: tz.name,
        label: `${tz.name.replace(/_/g, " ")} (GMT${tz.utcOffsetStr})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

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
                  ? timezones.find((tz) => tz.value === field.value)?.label
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder={placeholder} />
                <CommandList>
                  <CommandEmpty>{t("errors.noResults") || "No timezone found."}</CommandEmpty>
                  <CommandGroup>
                    {timezones.map((tz) => (
                      <CommandItem
                        key={tz.value}
                        value={tz.label}
                        onSelect={() => {
                          field.onChange(tz.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === tz.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {tz.label}
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
