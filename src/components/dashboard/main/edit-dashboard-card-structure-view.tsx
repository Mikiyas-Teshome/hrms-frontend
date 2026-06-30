'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminWidgetCatalogEntry } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import { WIDGET_DATA_CATEGORIES } from '@/features/admin-dashboard/admin-widget-structure.util';
import type { WidgetCardStructure, WidgetVisualization } from '@/features/admin-dashboard/admin-dashboard.types';
import { resolveWidgetStructure } from '@/features/admin-dashboard/admin-widget-structure.util';
import {
  AreaChartPreview,
  BarChartPreview,
  LineChartPreview,
  PieChartPreview,
  TablePreview,
} from '@/components/dashboard/main/dashboard-card-previews';

const VISUALIZATION_OPTIONS: {
  id: WidgetVisualization;
  labelKey: string;
  Preview: React.ComponentType;
}[] = [
  { id: 'table', labelKey: 'edit.cardStructure.visualizations.table', Preview: TablePreview },
  { id: 'pie_chart', labelKey: 'edit.cardStructure.visualizations.pieChart', Preview: PieChartPreview },
  { id: 'line_chart', labelKey: 'edit.cardStructure.visualizations.lineChart', Preview: LineChartPreview },
  { id: 'bar_chart', labelKey: 'edit.cardStructure.visualizations.barChart', Preview: BarChartPreview },
  { id: 'area_chart', labelKey: 'edit.cardStructure.visualizations.areaChart', Preview: AreaChartPreview },
];

interface EditDashboardCardStructureViewProps {
  card: AdminWidgetCatalogEntry;
  initialStructure: WidgetCardStructure;
  onBack: () => void;
  onClose: () => void;
  onSave: (structure: WidgetCardStructure) => void;
  isRTL: boolean;
}

export function EditDashboardCardStructureView({
  card,
  initialStructure,
  onBack,
  onClose,
  onSave,
  isRTL,
}: EditDashboardCardStructureViewProps) {
  const { t } = useTranslation('dashboard');

  const [structure, setStructure] = React.useState<WidgetCardStructure>(() =>
    resolveWidgetStructure(card, initialStructure),
  );

  React.useEffect(() => {
    setStructure(resolveWidgetStructure(card, initialStructure));
  }, [card, initialStructure]);

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const visualizationOptions = VISUALIZATION_OPTIONS.filter((option) =>
    card.allowedVisualizations.includes(option.id),
  );
  const dataCategoryOptions = WIDGET_DATA_CATEGORIES;

  const handleSave = () => {
    onSave(structure);
    onBack();
  };

  return (
    <div className={cn('flex flex-col h-full bg-background text-foreground', isRTL && 'direction-rtl')}>
      <div className="flex flex-col pt-6 gap-6 shrink-0 px-10">
        <div
          className={cn(
            'flex flex-row items-start w-full h-9',
            isRTL ? 'flex-row-reverse justify-between' : 'justify-between',
          )}
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-muted transition-colors"
          >
            <BackIcon className="w-4 h-4 text-foreground/80" />
            <span className="font-medium text-sm leading-5 text-foreground/80">
              {t('edit.cardStructure.back')}
            </span>
          </button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted text-foreground/80"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex items-center h-8">
          <h2
            className={cn(
              'text-2xl font-bold leading-8 text-foreground',
              isRTL && 'text-right w-full',
            )}
          >
            {t(card.titleKey)}
          </h2>
        </div>

        <div className="border-b border-border" />
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-6 flex flex-col gap-6">
        <div className="flex flex-col w-full bg-card border border-border/80 shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-xl overflow-hidden">
          <div className={cn('flex items-center px-6 h-12.5 bg-secondary/60', isRTL && 'justify-end')}>
            <span className="font-semibold text-sm leading-none text-foreground">
              {t('edit.cardStructure.dataType')}
            </span>
          </div>
          <div className="px-6 py-6">
            <div className="flex flex-col gap-3 max-w-md">
              <label
                className={cn(
                  'font-medium text-sm leading-5 text-foreground',
                  isRTL && 'text-right',
                )}
              >
                {t('edit.cardStructure.dataTypeLabel')}
              </label>
              <div className="relative">
                <select
                  value={structure.dataCategory}
                  onChange={(event) =>
                    setStructure((prev) => ({
                      ...prev,
                      dataCategory: event.target.value as WidgetCardStructure['dataCategory'],
                    }))
                  }
                  dir={isRTL ? 'rtl' : 'ltr'}
                  className="w-full h-9 px-3 pr-9 border border-border rounded-lg bg-background text-sm text-foreground shadow-[0px_1px_2px_rgba(0,0,0,0.05)] appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {dataCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {t(`edit.categories.${category}`)}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className={cn(
                    'absolute top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/50 pointer-events-none',
                    isRTL ? 'left-3' : 'right-3',
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {card.supportsStructureEdit && visualizationOptions.length > 0 && (
          <div className="flex flex-col w-full bg-card border border-border shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] rounded-[12px] overflow-hidden">
            <div className={cn('flex items-center px-6 h-[50px] bg-card-header-background border-b border-border', isRTL && 'flex-row-reverse')}>
              <span className="font-semibold text-[14px] leading-none text-foreground">
                {t('edit.cardStructure.visualization')}
              </span>
            </div>
            <div className="px-6 py-6">
              <div className={cn('flex flex-wrap gap-y-6 justify-between', isRTL && 'flex-row-reverse')}>
                {visualizationOptions.map(({ id, labelKey, Preview }) => (
                  <div
                    key={id}
                    className={cn(
                      'flex flex-row items-center gap-6 w-[244px] h-[100px] cursor-pointer select-none',
                      isRTL && 'flex-row-reverse'
                    )}
                    onClick={() => setStructure((prev) => ({ ...prev, visualization: id }))}
                  >
                    <div className={cn('flex items-center gap-3 w-[120px] shrink-0', isRTL && 'flex-row-reverse')}>
                      <Checkbox
                        checked={structure.visualization === id}
                        onCheckedChange={() =>
                          setStructure((prev) => ({ ...prev, visualization: id }))
                        }
                        className="w-4 h-4 rounded-[4px] border-border shadow-[0px_1px_2px_rgba(0,0,0,0.05)] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <span className="font-medium text-[14px] leading-none text-foreground">
                        {t(labelKey)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'w-[100px] h-[100px] rounded-[5px] overflow-hidden border transition-all shrink-0',
                        structure.visualization === id
                          ? 'border-primary ring-1 ring-primary/20'
                          : 'border-border',
                      )}
                    >
                      <Preview />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex items-end px-10 py-4 gap-6 border-t border-border shrink-0',
          isRTL ? 'flex-row-reverse justify-end' : 'flex-row justify-end',
        )}
      >
        <Button
          variant="outline"
          onClick={onBack}
          className="h-9 min-w-25 border-border text-foreground/80 font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
        >
          {t('edit.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          className="h-9 min-w-25 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
        >
          {t('edit.saveChanges')}
        </Button>
      </div>
    </div>
  );
}
