import { ReactNode } from 'react';
import { Cairo as CairoFont, Albert_Sans } from 'next/font/google';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrandColorProvider } from '@/components/providers/brand-color-provider';
import { Toaster } from '@/components/ui/toaster';

const albertSans = Albert_Sans({
    variable: '--font-albert-sans',
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

const cairo = CairoFont({
    variable: '--font-cairo',
    subsets: ['arabic'],
});

export const metadata: Metadata = {
    title: 'HRMS - Bekur',
    description: 'Advanced Human Resource Management System',
};

interface Props {
    children: ReactNode;
}

export default async function RootLayout({ children }: Props) {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('hrms_language')?.value as 'en' | 'ar') || 'en';
    const isRTL = locale === 'ar';

    return (
        <html
            lang={locale}
            dir={isRTL ? 'rtl' : 'ltr'}
            className={`${albertSans.variable} ${cairo.variable} h-full antialiased ${isRTL ? 'font-arabic' : 'font-sans'}`}
            suppressHydrationWarning
        >
            <body
                className="min-h-full flex flex-col bg-background text-foreground"
                suppressHydrationWarning
            >
                <ThemeProvider 
                    attribute="class" 
                    defaultTheme="system" 
                    storageKey="hrms-ui-theme"
                    enableColorScheme={false}
                    disableTransitionOnChange
                >
                    <BrandColorProvider>
                        <I18nProvider initialLanguage={locale}>
                            <QueryProvider>
                                <AuthProvider>
                                    <TooltipProvider>
                                        {children}
                                    </TooltipProvider>
                                    <Toaster />
                                </AuthProvider>
                            </QueryProvider>
                        </I18nProvider>
                    </BrandColorProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
