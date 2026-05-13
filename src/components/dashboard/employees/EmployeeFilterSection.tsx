'use client';

import React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface EmployeeFilterSectionProps {
    isVisible: boolean;
    onReset: () => void;
    onApply: () => void;
}

const EmployeeFilterSection: React.FC<EmployeeFilterSectionProps> = ({ 
    isVisible, 
    onReset, 
    onApply 
}) => {
    const { t } = useTranslation('employees');

    if (!isVisible) return null;

    return (
        <div className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg p-4 sm:p-6 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col lg:flex-row items-end gap-4 lg:gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 flex-1 w-full">
                    {/* Branch */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">{t('branch')}</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-9 bg-background border-border shadow-xs">
                                <SelectValue placeholder={t('all')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="dubai">Dubai</SelectItem>
                                <SelectItem value="abu-dhabi">Abu Dhabi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">{t('department')}</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-9 bg-background border-border shadow-xs">
                                <SelectValue placeholder={t('all')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                                <SelectItem value="management">Management</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Role */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">{t('role')}</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-9 bg-background border-border shadow-xs">
                                <SelectValue placeholder={t('all')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="developer">Developer</SelectItem>
                                <SelectItem value="designer">Designer</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">{t('status')}</label>
                        <Select defaultValue="all">
                            <SelectTrigger className="h-9 bg-background border-border shadow-xs">
                                <SelectValue placeholder={t('all')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t('all')}</SelectItem>
                                <SelectItem value="active">{t('active')}</SelectItem>
                                <SelectItem value="terminated">{t('terminated')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <Button 
                        onClick={onApply}
                        className="h-9 min-w-[102px] bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('applyFilters')}
                    </Button>
                    <Button 
                        variant="outline"
                        onClick={onReset}
                        className="h-9 min-w-[101px] border-muted-foreground text-foreground/80 hover:text-foreground font-medium rounded-lg flex-1 lg:flex-none"
                    >
                        {t('resetFilters')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeFilterSection;
