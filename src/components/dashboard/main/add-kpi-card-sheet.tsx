'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
  MAX_ADMIN_KPI_CARDS,
  type AdminKpiCatalogEntry,
} from '@/features/admin-dashboard/admin-kpi-catalog.constants';
import {
  filterCatalogByAllowedSlugs,
  filterCatalogByCategory,
  filterCatalogByPermission,
  getCategorySectionTitleKey,
  searchCatalogEntries,
} from '@/features/admin-dashboard/admin-kpi-catalog.util';
import type { AdminKpiCategory, AdminKpiSlug } from '@/features/admin-dashboard/admin-dashboard.types';

interface AddKpiCardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingSlugs: AdminKpiSlug[];
  allowedSlugs: AdminKpiSlug[];
  onAdd: (slugs: AdminKpiSlug[]) => void;
}

export function AddKpiCardSheet({
  isOpen,
  onClose,
  existingSlugs,
  allowedSlugs,
  onAdd,
}: AddKpiCardSheetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.language === 'ar';
  const { hasPermission } = usePermissions();
  const [activeCategory, setActiveCategory] = React.useState<AdminKpiCategory>('workforce');
  const [selectedKpis, setSelectedKpis] = React.useState<AdminKpiSlug[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  const categories: { id: AdminKpiCategory; label: string }[] = [
    { id: 'workforce', label: t('edit.categories.workforce') },
    { id: 'attendance', label: t('edit.categories.attendance') },
    { id: 'leave', label: t('edit.categories.leave') },
    { id: 'payroll', label: t('edit.categories.payroll') },
    { id: 'compliance', label: t('edit.categories.compliance') },
  ];

  const permittedCatalog = React.useMemo(() => {
    const byPermission = filterCatalogByPermission(hasPermission);
    return filterCatalogByAllowedSlugs(byPermission, allowedSlugs);
  }, [hasPermission, allowedSlugs]);

  const categoryKpis = React.useMemo(() => {
    const inCategory = filterCatalogByCategory(permittedCatalog, activeCategory);
    return searchCatalogEntries(inCategory, searchQuery, t);
  }, [permittedCatalog, activeCategory, searchQuery, t]);

  const remainingSlots = MAX_ADMIN_KPI_CARDS - existingSlugs.length;

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedKpis([]);
      setSearchQuery('');
      setActiveCategory('workforce');
    }
  }, [isOpen]);

  const toggleKpi = (slug: AdminKpiSlug) => {
    if (existingSlugs.includes(slug)) {
      return;
    }

    setSelectedKpis((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }
      if (prev.length >= remainingSlots) {
        return prev;
      }
      return [...prev, slug];
    });
  };

  const handleSave = () => {
    if (selectedKpis.length === 0) {
      onClose();
      return;
    }
    onAdd(selectedKpis);
    onClose();
  };

  const renderKpiCard = (kpi: AdminKpiCatalogEntry) => {
    const isAlreadyAdded = existingSlugs.includes(kpi.slug);
    const isSelected = selectedKpis.includes(kpi.slug);
    const isDisabled = isAlreadyAdded || (!isSelected && selectedKpis.length >= remainingSlots);

    return (
      <div
        key={kpi.slug}
        className={cn(
          'relative w-50 h-37.5 bg-card border border-border rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all group',
          isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50 cursor-pointer',
        )}
        onClick={() => {
          if (!isDisabled) {
            toggleKpi(kpi.slug);
          }
        }}
      >
        <Checkbox
          checked={isAlreadyAdded || isSelected}
          disabled={isDisabled}
          onCheckedChange={() => {
            if (!isDisabled) {
              toggleKpi(kpi.slug);
            }
          }}
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
            <kpi.icon className="w-5 h-5" style={{ color: kpi.iconColor }} />
          </div>

          <div className="text-center space-y-2">
            <p className="text-base font-semibold leading-4 text-foreground line-clamp-1">
              {t(kpi.titleKey)}
            </p>
            <p className="text-xs font-normal leading-tight text-muted-foreground line-clamp-2 max-w-42.5">
              {t(kpi.descKey)}
            </p>
          </div>
        </div>
      </div>
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
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
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

          <div className="flex flex-1 overflow-hidden p-[24px_40px] gap-6">
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

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
              <h2 className="text-[18px] font-bold leading-[32px] text-foreground">
                {t(getCategorySectionTitleKey(activeCategory))}
              </h2>

              {categoryKpis.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('edit.noKpiCardsAvailable')}</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6 pb-6">
                  {categoryKpis.map(renderKpiCard)}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end p-[16px_40px_24px] gap-6 bg-background border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="h-9 min-w-25 border-muted-foreground text-foreground/80 font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            >
              {t('edit.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={selectedKpis.length === 0}
              className="h-9 min-w-25 bg-primary hover:bg-primary/80 text-white font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
            >
              {t('edit.saveChanges')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
