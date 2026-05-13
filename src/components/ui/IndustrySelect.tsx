import React, { useMemo, useState } from "react";
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

const INDUSTRIES = [
  "Accounting", "Airlines/Aviation", "Alternative Dispute Resolution", "Alternative Medicine", "Animation", "Apparel & Fashion", "Architecture & Planning", "Arts & Crafts", "Automotive", "Aviation & Aerospace", "Banking", "Biotechnology", "Broadcast Media", "Building Materials", "Business Supplies & Equipment", "Capital Markets", "Chemicals", "Civic & Social Organization", "Civil Engineering", "Commercial Real Estate", "Computer & Network Security", "Computer Games", "Computer Hardware", "Computer Networking", "Computer Software", "Construction", "Consumer Electronics", "Consumer Goods", "Consumer Services", "Cosmetics", "Dairy", "Defense & Space", "Design", "Education Management", "E-learning", "Electrical/Electronic Manufacturing", "Entertainment", "Environmental Services", "Events Services", "Executive Office", "Facilities Services", "Farming", "Financial Services", "Fine Art", "Fishery", "Food & Beverages", "Food Production", "Fund-raising", "Furniture", "Gambling & Casinos", "Glass, Ceramics & Concrete", "Government Administration", "Government Relations", "Graphic Design", "Health, Wellness & Fitness", "Higher Education", "Hospital & Health Care", "Hospitality", "Human Resources", "Import & Export", "Individual & Family Services", "Industrial Automation", "Information Services", "Information Technology & Services", "Insurance", "International Affairs", "International Trade & Development", "Internet", "Investment Banking", "Investment Management", "Judiciary", "Law Enforcement", "Law Practice", "Legal Services", "Legislative Office", "Leisure, Travel & Tourism", "Libraries", "Logistics & Supply Chain", "Luxury Goods & Jewelry", "Machinery", "Management Consulting", "Maritime", "Market Research", "Marketing & Advertising", "Mechanical or Industrial Engineering", "Media Production", "Medical Device", "Medical Practice", "Mental Health Care", "Military", "Mining & Metals", "Motion Pictures & Film", "Museums & Institutions", "Music", "Nanotechnology", "Newspapers", "Non-profit Organization Management", "Oil & Energy", "Online Media", "Outsourcing/Offshoring", "Package/Freight Delivery", "Packaging & Containers", "Paper & Forest Products", "Performing Arts", "Pharmaceuticals", "Philanthropy", "Photography", "Plastics", "Political Organization", "Primary/Secondary Education", "Printing", "Professional Training & Coaching", "Program Development", "Public Policy", "Public Relations & Communications", "Public Safety", "Publishing", "Railroad Manufacture", "Ranching", "Real Estate", "Recreational Facilities & Services", "Religious Institutions", "Renewables & Environment", "Research", "Restaurants", "Retail", "Security & Investigations", "Semiconductors", "Shipbuilding", "Sporting Goods", "Sports", "Staffing & Recruiting", "Supermarkets", "Telecommunications", "Textiles", "Think Tanks", "Tobacco", "Translation & Localization", "Transportation/Trucking/Railroad", "Utilities", "Venture Capital & Private Equity", "Veterinary", "Warehousing", "Wholesale", "Wine & Spirits", "Wireless", "Writing & Editing"
];

export function IndustrySelect<T extends FieldValues>({ control, name, label, placeholder, error, t, disabled }: Props<T>) {
  const [open, setOpen] = useState(false);

  const options = useMemo(() => {
    return INDUSTRIES.map((industry) => ({
      value: industry,
      label: industry,
    })).sort((a, b) => a.label.localeCompare(b.label));
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
                  ? (options.find((opt) => opt.value === field.value)?.label || field.value)
                  : placeholder}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
              <Command>
                <CommandInput placeholder={placeholder} />
                <CommandList className="max-h-[300px]">
                  <CommandEmpty>{t("errors.noResults") || "No industry found."}</CommandEmpty>
                  <CommandGroup>
                    {options.map((opt) => (
                      <CommandItem
                        key={opt.value}
                        value={opt.label}
                        onSelect={() => {
                          field.onChange(opt.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === opt.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {opt.label}
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
