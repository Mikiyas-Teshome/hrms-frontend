'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ADMIN_WIDGET_CATALOG_BY_SLUG } from '@/features/admin-dashboard/admin-widget-catalog.constants';
import type {
  AdminWidgetSlug,
  WidgetCardStructure,
} from '@/features/admin-dashboard/admin-dashboard.types';
import { resolveWidgetStructure } from '@/features/admin-dashboard/admin-widget-structure.util';
import { EditDashboardCardStructureView } from '@/components/dashboard/main/edit-dashboard-card-structure-view';

interface EditWidgetStructureSheetProps {
  isOpen: boolean;
  widgetSlug: AdminWidgetSlug | null;
  widgetConfigs: Partial<Record<AdminWidgetSlug, WidgetCardStructure>>;
  onClose: () => void;
  onSave: (slug: AdminWidgetSlug, structure: WidgetCardStructure) => void;
  isRTL: boolean;
}

export function EditWidgetStructureSheet({
  isOpen,
  widgetSlug,
  widgetConfigs,
  onClose,
  onSave,
  isRTL,
}: EditWidgetStructureSheetProps) {
  if (!widgetSlug) {
    return null;
  }

  const entry = ADMIN_WIDGET_CATALOG_BY_SLUG[widgetSlug];
  if (!entry.supportsStructureEdit) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isRTL ? 'left' : 'right'}
        className="p-0 w-full max-w-234.75 border-none shadow-2xl overflow-hidden"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Edit widget structure</SheetTitle>
        </SheetHeader>
        <EditDashboardCardStructureView
          card={entry}
          initialStructure={resolveWidgetStructure(entry, widgetConfigs[widgetSlug])}
          onBack={onClose}
          onClose={onClose}
          onSave={(structure) => onSave(widgetSlug, structure)}
          isRTL={isRTL}
        />
      </SheetContent>
    </Sheet>
  );
}
