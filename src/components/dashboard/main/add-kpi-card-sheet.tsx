'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Users, CheckCheck, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

interface AddKpiCardSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (kpiId: string) => void;
}

export function AddKpiCardSheet({ isOpen, onClose, onAdd }: AddKpiCardSheetProps) {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';
    const [activeCategory, setActiveCategory] = React.useState('workforce');
    const [selectedKpis, setSelectedKpis] = React.useState<string[]>([]);

    const categories = [
        { id: 'workforce', label: t('edit.categories.workforce') },
        { id: 'attendance', label: t('edit.categories.attendance') },
        { id: 'leave', label: t('edit.categories.leave') },
        { id: 'payroll', label: t('edit.categories.payroll') },
        { id: 'compliance', label: t('edit.categories.compliance') },
    ];

    const kpis = [
        {
            id: 'total_employees',
            title: t('edit.kpis.totalEmployees.title'),
            description: t('edit.kpis.totalEmployees.desc'),
            icon: Users,
            iconColor: '#D97706',
            bgColor: 'rgba(217, 119, 6, 0.05)',
            borderColor: 'rgba(217, 119, 6, 0.5)',
        },
        {
            id: 'active_employees',
            title: t('edit.kpis.activeEmployees.title'),
            description: t('edit.kpis.activeEmployees.desc'),
            icon: CheckCheck,
            iconColor: '#22C55E',
            bgColor: 'rgba(34, 197, 94, 0.05)',
            borderColor: 'rgba(34, 197, 94, 0.5)',
        },
        {
            id: 'new_hires',
            title: t('edit.kpis.newHires.title'),
            description: t('edit.kpis.newHires.desc'),
            icon: Briefcase,
            iconColor: '#A855F7',
            bgColor: 'rgba(168, 85, 247, 0.05)',
            borderColor: 'rgba(168, 85, 247, 0.5)',
        },
        {
            id: 'attrition_rate',
            title: t('edit.kpis.attritionRate.title'),
            description: t('edit.kpis.attritionRate.desc'),
            icon: Users,
            iconColor: '#D97706',
            bgColor: 'rgba(217, 119, 6, 0.05)',
            borderColor: 'rgba(217, 119, 6, 0.5)',
        },
    ];

    const toggleKpi = (id: string) => {
        setSelectedKpis((prev) =>
            prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id],
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent
                side={isRTL ? 'left' : 'right'}
                className="p-0 w-234.75 max-w-234.75 border-none shadow-2xl overflow-hidden"
                showCloseButton={false}
            >
                <div className="flex flex-col h-full bg-background text-foreground">
                    {/* Header */}
                    <div className="flex flex-col p-[24px_40px_0px] gap-6">
                        <div className="flex items-center justify-between w-full h-9">
                            <div className="flex items-center gap-12 flex-1">
                                <SheetTitle className="text-2xl font-bold leading-[32px] text-foreground whitespace-nowrap">
                                    {t('edit.addKpiCardTitle')}
                                </SheetTitle>

                                <div className="relative w-87.5 shrink-0">
                                    <Search
                                        className={cn(
                                            'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none',
                                            isRTL ? 'right-3' : 'left-3',
                                        )}
                                    />
                                    <Input
                                        placeholder={t('edit.searchKpiPlaceholder')}
                                        className={cn(
                                            'h-9 w-full bg-background border-border rounded-lg text-sm shadow-[0px_1px_2px_rgba(0,0,0,0.05)] focus-visible:ring-primary',
                                            isRTL ? 'pr-10 text-right' : 'pl-10 text-left',
                                        )}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="w-11 h-9 rounded-lg hover:bg-muted shrink-0 text-foreground/80"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="mt-6 border-b border-border" />
                    </div>
                    {/* Body */}
                    <div className="flex flex-1 overflow-hidden p-[24px_40px] gap-6">
                        {/* Sidebar */}
                        <div className="w-50.25 flex flex-col gap-1 shrink-0">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={cn(
                                        'flex items-center px-2 h-8 rounded-lg text-sm transition-colors text-left',
                                        isRTL && 'text-right',
                                        activeCategory === cat.id
                                            ? 'bg-muted font-medium text-foreground'
                                            : 'text-foreground hover:bg-muted font-normal',
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Grid Area */}
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                            <h2 className="text-[18px] font-bold leading-[32px] text-foreground">
                                {t('edit.organizationCards')}
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 pb-6">
                                {kpis.map((kpi) => (
                                    <div
                                        key={kpi.id}
                                        className="relative w-50 h-37.5 bg-card border border-border rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] hover:border-primary/50 transition-all cursor-pointer group"
                                        onClick={() => toggleKpi(kpi.id)}
                                    >
                                        <Checkbox
                                            checked={selectedKpis.includes(kpi.id)}
                                            onCheckedChange={() => toggleKpi(kpi.id)}
                                            className={cn(
                                                'absolute top-2.75 w-4 h-4 rounded border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary',
                                                isRTL ? 'right-2.75' : 'left-2.75',
                                            )}
                                        />

                                        <div className="flex flex-col items-center justify-center h-full px-4 gap-4 mt-2">
                                            <div
                                                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border shrink-0"
                                                style={{
                                                    backgroundColor: kpi.bgColor,
                                                    borderColor: kpi.borderColor,
                                                }}
                                            >
                                                <kpi.icon
                                                    className="w-5 h-5"
                                                    style={{ color: kpi.iconColor }}
                                                />
                                            </div>

                                            <div className="text-center space-y-2">
                                                <p className="text-base font-semibold leading-4 text-foreground line-clamp-1">
                                                    {kpi.title}
                                                </p>
                                                <p className="text-xs font-normal leading-tight text-muted-foreground line-clamp-2 max-w-42.5">
                                                    {kpi.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* Footer */}
                    <div className="flex justify-end p-[16px_40px_24px] gap-6 bg-background border-t border-border">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                        >
                            {t('edit.cancel')}
                        </Button>
                        <Button
                            onClick={() => {
                                selectedKpis.forEach((id) => onAdd(id));
                                onClose();
                            }}
                            className="h-9 min-w-25 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
                        >
                            {t('edit.saveRole')}
                        </Button>
                    </div>{' '}
                </div>
            </SheetContent>
        </Sheet>
    );
}
