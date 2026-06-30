import { LucideIcon, TrendingUp, TrendingDown, Minus, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconClassName?: string;
    iconContainerClassName?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    subText?: string;
    isEditing?: boolean;
    onDelete?: () => void;
    isPlaceholder?: boolean;
    onAdd?: () => void;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    iconClassName,
    iconContainerClassName,
    trend,
    trendValue,
    subText,
    isEditing,
    onDelete,
    isPlaceholder,
    onAdd,
}: StatCardProps) {
    const { t, i18n } = useTranslation('dashboard');
    const isRTL = i18n.language === 'ar';

    if (isPlaceholder) {
        return (
            <button
                type="button"
                onClick={onAdd}
                className="flex flex-col items-center justify-center p-4 min-h-35 h-full rounded-[14px] border-2 border-dashed border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/50 hover:bg-blue-100/50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer"
            >
                <div className="w-10 h-10 rounded-full border border-blue-200 dark:border-slate-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">{t('edit.addKpiCard')}</span>
            </button>
        );
    }

    return (
        <div
            className={cn(
                'relative flex flex-col justify-between p-[16px_24px] min-h-35 h-full bg-card text-card-foreground rounded-[14px] border border-border transition-all',
                'shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]',
                isEditing && !isPlaceholder && 'border-solid shadow-none',
            )}
        >
            {isEditing && !isPlaceholder && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.();
                    }}
                    className={cn(
                        'absolute -top-1.25 w-5 h-5 bg-[#EF4444] rounded-full border-[1.33px] border-background flex items-center justify-center shadow-[0px_4px_4px_rgba(0,0,0,0.08)] hover:bg-red-600 transition-colors z-10 cursor-pointer',
                        isRTL ? '-left-1.25' : '-right-1.25',
                    )}
                >
                    <X className="w-3 h-3 text-white" />
                </button>
            )}

            <div className="flex items-start justify-between mb-3 shrink-0">
                <div
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg shrink-0 border border-border',
                        iconContainerClassName || 'bg-orange-50/50',
                    )}
                >
                    <Icon className={cn('w-5 h-5', iconClassName || 'text-orange-600')} />
                </div>

                <div className="flex flex-col items-end gap-0.5">
                    {trend && (
                        <div
                            className={cn(
                                'flex items-center gap-1 px-2 py-0.5 rounded-lg shrink-0 h-5',
                                trend === 'up'
                                    ? 'text-green-500'
                                    : trend === 'down'
                                      ? 'text-red-500'
                                      : 'text-muted-foreground',
                            )}
                        >
                            {trend === 'up' ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : trend === 'down' ? (
                                <TrendingDown className="w-3 h-3" />
                            ) : (
                                <Minus className="w-3 h-3" />
                            )}
                            <span className="text-xs font-semibold">{trendValue}</span>
                        </div>
                    )}
                    {subText && (
                        <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 shrink-0">
                            {subText}
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-normal leading-5 line-clamp-1">
                    {title}
                </p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-semibold leading-9 tracking-tight text-foreground">
                        {value}
                    </h3>
                </div>
            </div>
        </div>
    );
}
