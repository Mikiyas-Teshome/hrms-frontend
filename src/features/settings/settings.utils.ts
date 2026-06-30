import { countryDialCodes } from '@/components/ui/PhoneCodeSelect';
import {
    DEFAULT_THEME_COLOR_ID,
    ORGANIZATION_THEME_COLORS,
    type ThemeColorId,
} from '@/constants/colors';
import type { CompanyResponse } from '@/features/company/company.types';

export function normalizeWebsiteUrl(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) {
        return '';
    }
    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }
    return `https://${trimmed}`;
}

export function splitPhoneNumber(phone?: string | null): { phoneCode: string; phone: string } {
    if (!phone?.trim()) {
        return { phoneCode: 'US', phone: '' };
    }

    const normalized = phone.trim();
    const sortedCodes = [...countryDialCodes].sort(
        (a, b) => b.dial_code.replace(/-/g, '').length - a.dial_code.replace(/-/g, '').length,
    );

    for (const entry of sortedCodes) {
        const dial = entry.dial_code.replace(/-/g, '');
        if (normalized.startsWith(dial)) {
            return {
                phoneCode: entry.code,
                phone: normalized.slice(dial.length).trim(),
            };
        }
    }

    return { phoneCode: 'US', phone: normalized };
}

export function combinePhoneNumber(phoneCode: string, phone: string): string | undefined {
    const trimmed = phone.trim();
    if (!trimmed) {
        return undefined;
    }

    const dial =
        countryDialCodes.find((entry) => entry.code === phoneCode)?.dial_code.replace(/-/g, '') ?? '';
    return `${dial}${trimmed}`;
}

export function resolveThemeColorId(
    value?: string | null,
    fallback?: string | null,
): ThemeColorId {
    const candidate = value ?? fallback;
    if (!candidate) {
        return DEFAULT_THEME_COLOR_ID;
    }

    const byId = ORGANIZATION_THEME_COLORS.find((color) => color.id === candidate);
    if (byId) {
        return byId.id;
    }

    const byHex = ORGANIZATION_THEME_COLORS.find(
        (color) => color.value.toLowerCase() === candidate.toLowerCase(),
    );
    if (byHex) {
        return byHex.id;
    }

    return DEFAULT_THEME_COLOR_ID;
}

export function emailsEqual(a?: string | null, b?: string | null): boolean {
    if (!a?.trim() || !b?.trim()) {
        return false;
    }

    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function buildGeneralFormValues(
    company: CompanyResponse,
    options: { currencyFallback: string; timezoneFallback: string },
) {
    const { phoneCode, phone } = splitPhoneNumber(company.phone);

    return {
        orgName: company.name ?? '',
        description: company.description ?? '',
        phoneCode,
        phone,
        email: company.email ?? '',
        address: company.address ?? '',
        city: company.city ?? '',
        state: company.state ?? '',
        postalCode: company.postalCode ?? '',
        country: company.country ?? '',
        currency: company.currency || options.currencyFallback,
        timezone: company.timezone || options.timezoneFallback,
    };
}

export function buildAppearanceFormValues(
    company: CompanyResponse,
    options: { themeColorFallback: string | null },
): { website: string; logoUrl: string | null; themeColor: ThemeColorId } {
    return {
        website: company.website ?? '',
        logoUrl: company.logo ?? null,
        themeColor: resolveThemeColorId(
            company.themeColor,
            options.themeColorFallback,
        ),
    };
}

export function buildOrgPreferencesFormValues(company: CompanyResponse) {
    return {
        multiDept: company.multiDept ?? true,
        crossDivision: company.crossDivision ?? true,
        requireDept: company.requireDept ?? true,
    };
}
