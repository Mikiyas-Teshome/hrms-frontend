"use client";

import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/common/theme-toggle";

interface PublicHeaderProps {
  showSave?: boolean;
  showLanguage?: boolean;
  onSave?: () => void;
}

export function PublicHeader({ showSave = false, showLanguage = true, onSave }: PublicHeaderProps) {
  const { t } = useTranslation("companyProfile");

  return (
    <header className="sticky top-0 z-50 w-full px-2 py-2 sm:px-4 flex items-center justify-between h-12 bg-background/80 backdrop-blur-md">
      <div className="flex items-center gap-2 rtl:flex-row-reverse w-1/3">
        <Building2 className="size-4 text-foreground" />
        <span className="text-base font-bold tracking-tight text-foreground">HRMS</span>
      </div>
      
      <div className="flex items-center justify-end gap-3 sm:gap-6 w-1/3">
        <ThemeToggle />
        {showLanguage && <LanguageSwitcher />}
        {showSave && (
          <Button 
            variant="ghost" 
            onClick={onSave}
            className="text-sm font-medium text-primary hover:bg-transparent hover:text-primary/80"
          >
            {t("topBar.save")}
          </Button>
        )}
      </div>
    </header>
  );
}
