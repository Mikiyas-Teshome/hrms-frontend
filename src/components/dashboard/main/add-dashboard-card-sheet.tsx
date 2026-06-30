'use client';

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, PencilLine } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { usePermissions } from '@/features/auth/hooks/usePermissions';
import {
  ADMIN_WIDGET_CATALOG,
  MAX_ADMIN_WIDGET_CARDS,
  type AdminWidgetCatalogEntry,
} from '@/features/admin-dashboard/admin-widget-catalog.constants';
import {
  filterWidgetCatalogByAllowedSlugs,
  filterWidgetCatalogByCategory,
  filterWidgetCatalogByPermission,
  getWidgetCategorySectionTitleKey,
  getWidgetSheetCategoriesWithCards,
  isCatalogEntryAdded,
  searchWidgetCatalogEntries,
} from '@/features/admin-dashboard/admin-widget-catalog.util';
import type {
  AdminWidgetSheetCategory,
  AdminWidgetSlug,
  WidgetCardStructure,
} from '@/features/admin-dashboard/admin-dashboard.types';
import { EditDashboardCardStructureView } from '@/components/dashboard/main/edit-dashboard-card-structure-view';

interface AddDashboardCardSheetProps {
  isOpen: boolean;
  onClose: () => void;
  existingSlugs: AdminWidgetSlug[];
  allowedSlugs: AdminWidgetSlug[];
  widgetConfigs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>;
  onAdd: (
    slugs: AdminWidgetSlug[],
    configs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>,
  ) => void;
}

export function AddDashboardCardSheet({
  isOpen,
  onClose,
  existingSlugs,
  allowedSlugs,
  widgetConfigs,
  onAdd,
}: AddDashboardCardSheetProps) {
  const { t, i18n } = useTranslation('dashboard');
  const isRTL = i18n.language === 'ar';
  const { hasPermission } = usePermissions();
  const [activeCategory, setActiveCategory] =
    React.useState<AdminWidgetSheetCategory>('workforce');
  const [selectedSlugs, setSelectedSlugs] = React.useState<AdminWidgetSlug[]>([]);
  const [pendingConfigs, setPendingConfigs] =
    React.useState<Partial<Record<AdminWidgetSlug, WidgetCardStructure>>>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const [editingCard, setEditingCard] = React.useState<AdminWidgetCatalogEntry | null>(null);

  const availableCatalog = React.useMemo(() => {
    const permitted = filterWidgetCatalogByPermission(ADMIN_WIDGET_CATALOG, hasPermission);
    return filterWidgetCatalogByAllowedSlugs(permitted, allowedSlugs);
  }, [hasPermission, allowedSlugs]);

  const availableCategories = React.useMemo(
    () =>
      getWidgetSheetCategoriesWithCards(availableCatalog).map((id) => ({
        id,
        label: t(`edit.categories.${id}`),
      })),
    [availableCatalog, t],
  );

  const visibleCards = React.useMemo(() => {
    if (searchQuery.trim()) {
      return searchWidgetCatalogEntries(availableCatalog, searchQuery, t);
    }

    return filterWidgetCatalogByCategory(availableCatalog, activeCategory);
  }, [availableCatalog, activeCategory, searchQuery, t]);

  const remainingSlots = MAX_ADMIN_WIDGET_CARDS - existingSlugs.length;

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedSlugs([]);
      setPendingConfigs({});
      setSearchQuery('');
      setEditingCard(null);
      return;
    }

    if (availableCategories.length > 0) {
      setActiveCategory((current) =>
        availableCategories.some((category) => category.id === current)
          ? current
          : availableCategories[0].id,
      );
    }
  }, [isOpen, availableCategories]);

  const toggleCard = (entry: AdminWidgetCatalogEntry) => {
    const slug = entry.slug;

    if (existingSlugs.includes(slug)) {
      return;
    }

    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) {
        return prev.filter((item) => item !== slug);
      }

      if (prev.length >= remainingSlots) {
        return prev;
      }

      return [...prev, slug];
    });
  };

  const handleStructureSave = (structure: WidgetCardStructure) => {
    if (!editingCard) {
      return;
    }

    const slug = editingCard.slug;

    setPendingConfigs((prev) => ({
      ...prev,
      [slug]: structure,
    }));

    if (!existingSlugs.includes(slug)) {
      setSelectedSlugs((prev) => {
        if (prev.includes(slug) || prev.length >= remainingSlots) {
          return prev;
        }

        return [...prev, slug];
      });
    }
  };

  const handleAdd = () => {
    if (selectedSlugs.length === 0) {
      return;
    }

    const configsForSelection = selectedSlugs.reduce<
      Partial<Record<AdminWidgetSlug, WidgetCardStructure>>
    >((acc, slug) => {
      const config = pendingConfigs[slug] ?? widgetConfigs[slug];
      if (config) {
        acc[slug] = config;
      }
      return acc;
    }, {});

    onAdd(selectedSlugs, configsForSelection);
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEditingCard(null);
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        className="p-0 w-234.75 max-w-234.75 border-none shadow-2xl overflow-hidden"
        showCloseButton={false}
      >
        {editingCard ? (
          <EditDashboardCardStructureView
            card={editingCard}
            initialStructure={
              pendingConfigs[editingCard.slug] ??
              widgetConfigs[editingCard.slug] ?? {
                dataCategory: editingCard.category,
                visualization: editingCard.defaultVisualization,
              }
            }
            onBack={() => setEditingCard(null)}
            onClose={onClose}
            onSave={handleStructureSave}
            isRTL={isRTL}
          />
        ) : (
          <div className="flex flex-col h-full bg-background text-foreground">
            <div className="flex flex-col p-[24px_40px_0px] gap-6">
              <div className="flex items-center justify-between w-full h-9">
                <div className="flex items-center gap-12 flex-1">
                  <SheetTitle className="text-2xl font-bold leading-[32px] text-foreground whitespace-nowrap">
                    {t('edit.addCardTitle')}
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
                      placeholder={t('edit.searchCardPlaceholder')}
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
              <div className="w-50.25 flex flex-col gap-1 shrink-0 overflow-y-auto pr-2 pb-4">
                {availableCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveCategory(category.id);
                      setSearchQuery('');
                    }}
                    className={cn(
                      'flex items-center px-4 h-8 rounded-lg text-sm transition-colors',
                      isRTL ? 'text-right' : 'text-left',
                      activeCategory === category.id
                        ? 'bg-muted font-medium text-foreground'
                        : 'text-foreground hover:bg-muted font-normal',
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                <h2 className="text-lg font-bold leading-[32px] text-foreground">
                  {searchQuery.trim()
                    ? t('edit.searchResults')
                    : t(getWidgetCategorySectionTitleKey(activeCategory))}
                </h2>

                {visibleCards.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('edit.noWidgetCardsAvailable')}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6 pr-4">
                    {visibleCards.map((card) => {
                      const isAdded = isCatalogEntryAdded(card, existingSlugs);
                      const isSelected = selectedSlugs.includes(card.slug);
                      const isDisabled =
                        isAdded || (!isSelected && selectedSlugs.length >= remainingSlots);

                      return (
                        <div
                          key={card.slug}
                          className={cn(
                            'flex flex-col w-75 h-52.5 bg-card border border-border rounded-xl shadow-[0px_1px_3px_rgba(0,0,0,0.04),0px_1px_2px_-1px_rgba(0,0,0,0.04)] transition-all relative',
                            isDisabled
                              ? 'opacity-60 cursor-not-allowed'
                              : 'hover:border-primary/50 cursor-pointer',
                          )}
                          onClick={() => {
                            if (!isDisabled) {
                              toggleCard(card);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between px-4 h-12.5 bg-muted/50 rounded-t-xl shrink-0 border-b border-border">
                            <Checkbox
                              checked={isAdded || isSelected}
                              disabled={isDisabled}
                              onCheckedChange={() => toggleCard(card)}
                              className="w-4 h-4 rounded-[4px] border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                              onClick={(event) => event.stopPropagation()}
                            />

                            <div className="flex items-center justify-center px-2 h-5 bg-background border border-border rounded-lg">
                              <span className="text-xs font-semibold text-foreground">
                                {t(card.typeKey)}
                              </span>
                            </div>

                            {card.supportsStructureEdit ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg text-foreground/80 hover:bg-background/50"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setEditingCard(card);
                                }}
                              >
                                <PencilLine className="w-4 h-4" />
                              </Button>
                            ) : (
                              <div className="w-8" />
                            )}
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
                            <div className="w-13 h-11 flex items-center justify-center rounded-lg border border-border/50">
                              <card.icon className="w-7 h-7" style={{ color: card.iconColor }} />
                            </div>

                            <div className="text-center space-y-1">
                              <p className="text-base font-semibold leading-4 text-foreground">
                                {t(card.titleKey)}
                              </p>
                              <p className="text-sm font-normal leading-4.25 text-muted-foreground">
                                {t(card.descKey)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                onClick={handleAdd}
                disabled={selectedSlugs.length === 0}
                className="h-9 min-w-25 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-sm px-4 shadow-[0px_1px_2px_rgba(0,0,0,0.05)]"
              >
                {t('edit.addSelectedCards')}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
