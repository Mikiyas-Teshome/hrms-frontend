"use client";

import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/lib/i18n";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export const LanguageSwitcher = () => {
    const { t, i18n } = useTranslation("languageSwitcher");
    const locale = i18n.language.startsWith('ar') ? 'ar' : 'en';

    const onLocaleChange = (nextLocale: string) => {
        changeLanguage(nextLocale as "en" | "ar");
    };

    return (
        <Select value={locale} onValueChange={onLocaleChange}>
            <SelectTrigger className="w-fit border-none shadow-none focus:ring-0 bg-transparent px-2 text-muted-foreground font-normal text-sm gap-2">
                <SelectValue
                    placeholder={locale === 'en' ? t('languages.english') : t('languages.arabic')}
                />
            </SelectTrigger>
            <SelectContent
                position="popper"
                side="top"
                align="end"
                className="min-w-45 bg-background border border-border shadow-md rounded-lg"
            >
                <SelectItem value="en" className="text-sm py-2 px-3 cursor-pointer">
                    {t('languages.english')}
                </SelectItem>
                <SelectItem value="ar" className="text-sm py-2 px-3 cursor-pointer font-arabic">
                    {t('languages.arabic')}
                </SelectItem>
            </SelectContent>
        </Select>
    );
};
