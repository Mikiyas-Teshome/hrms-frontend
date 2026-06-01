import type { LucideIcon } from 'lucide-react';

export type DashboardNavigationActionId = 'add-employee';

export type DashboardNavigationSubItemConfig = {
    titleKey: string;
    titleDefault?: string;
    url: string;
    module?: string;
    action?: string;
    actions?: string[];
    keywords?: string[];
    searchable?: boolean;
    actionId?: DashboardNavigationActionId;
};

export type DashboardNavigationItemConfig = {
    titleKey: string;
    titleDefault?: string;
    url: string;
    icon?: LucideIcon;
    module?: string;
    action?: string;
    keywords?: string[];
    searchable?: boolean;
    items?: DashboardNavigationSubItemConfig[];
};

export type DashboardNavigationSubItem = {
    title: string;
    url: string;
    module?: string;
    action?: string;
    onClick?: () => void;
};

export type DashboardNavigationItem = {
    title: string;
    url: string;
    icon?: LucideIcon;
    module?: string;
    action?: string;
    isActive?: boolean;
    items?: DashboardNavigationSubItem[];
    onClick?: () => void;
};

export type DashboardQuickSearchItem = {
    id: string;
    title: string;
    url: string;
    group: string;
    icon?: LucideIcon;
    searchValue: string;
};

export type DashboardNavigationActionHandlers = Partial<
    Record<DashboardNavigationActionId, () => void>
>;
