'use client';

import * as React from 'react';
import {
    LayoutDashboard,
    Shield,
    Users,
    Building2,
    CalendarCheck,
    CalendarOff,
    CircleDollarSign,
    FileText,
    BarChart3,
    Settings,
    Bot,
    CircleHelp,
    LogOut,
    ChevronDown,
    HandHeart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

import { useTranslation } from 'react-i18next';
import { useLogout } from '@/features/auth/hooks/useAuth';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import Link from 'next/link';
import AddEmployeeSheet from '@/components/dashboard/employees/AddEmployeeSheet';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarTrigger,
    useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { usePathname, useRouter } from 'next/navigation';

type SidebarSubItem = {
    title: string;
    url: string;
    module?: string;
    action?: string;
    actions?: string[];
    onClick?: () => void;
};

type SidebarItem = {
    title: string;
    url: string;
    icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    module?: string;
    action?: string;
    isActive?: boolean;
    items?: SidebarSubItem[];
    onClick?: () => void;
};

const SIDEBAR_SUBMENU_STATE_KEY = 'dashboard-sidebar-submenu-state';

export function DashboardSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { t } = useTranslation(['dashboard', 'logoutConfirm']);
    const { mutateAsync: logoutUser } = useLogout();
    const router = useRouter();
    const pathname = usePathname();
    const [showLogoutModal, setShowLogoutModal] = React.useState(false);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);
    const { permissionsMap, isInitializing } = useAuth();
    const [showAddEmployeeSheet, setShowAddEmployeeSheet] = React.useState(false);
    const [submenuOpenState, setSubmenuOpenState] = React.useState<Record<string, boolean>>({});
    const { state, setOpen } = useSidebar();

    React.useEffect(() => {
        try {
            const savedState = localStorage.getItem(SIDEBAR_SUBMENU_STATE_KEY);
            if (savedState) {
                setSubmenuOpenState(JSON.parse(savedState) as Record<string, boolean>);
            }
        } catch (error) {
            console.error('Failed to restore sidebar submenu state', error);
        }
    }, []);

    React.useEffect(() => {
        setSubmenuOpenState({});
        try {
            localStorage.removeItem(SIDEBAR_SUBMENU_STATE_KEY);
        } catch (error) {
            console.error('Failed to clear sidebar submenu state', error);
        }
    }, [pathname]);

    const setSubmenuOpen = React.useCallback((menuUrl: string, open: boolean) => {
        setSubmenuOpenState((prev) => {
            const next = { ...prev, [menuUrl]: open };
            try {
                localStorage.setItem(SIDEBAR_SUBMENU_STATE_KEY, JSON.stringify(next));
            } catch (error) {
                console.error('Failed to persist sidebar submenu state', error);
            }
            return next;
        });
    }, []);

    const isSubmenuOpen = React.useCallback(
        (menuUrl: string) => {
            const persisted = submenuOpenState[menuUrl];
            if (typeof persisted === 'boolean') {
                return persisted;
            }
            return pathname.startsWith(menuUrl);
        },
        [submenuOpenState, pathname],
    );

    const handleLogoutClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await logoutUser();
            if (response) {
                router.push('/login');
            }
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutModal(false);
        }
    };

    const menuItems: SidebarItem[] = [
        {
            title: t('sidebar.dashboard'),
            url: '/dashboard',
            icon: LayoutDashboard,
            isActive: pathname === '/dashboard',
            module: 'dashboard',
        },
        {
            title: t('sidebar.roles'),
            url: '/dashboard/roles',
            icon: Shield,
            module: 'roles',
        },
        // {
        //     title: t('sidebar.payrollOfficer.title'),
        //     url: '/dashboard/payroll-officer',
        //     icon: CircleDollarSign,
        //     module: 'payroll_runs',
        // },
        {
            title: t('sidebar.employees.title'),
            url: '/dashboard/employees',
            icon: Users,
            module: 'employees',
            items: [
                {
                    title: t('sidebar.employees.directory'),
                    url: '/dashboard/employees/directory',
                    module: 'employees',
                },
                {
                    title: t('sidebar.employees.lifecycle', { defaultValue: 'Employee lifecycle' }),
                    url: '/dashboard/employees/lifecycle',
                    module: 'employee_lifecycle',
                },
                {
                    title: t('sidebar.employees.contractManagement', {
                        defaultValue: 'Contract management',
                    }),
                    url: '/dashboard/employees/contracts',
                    module: 'contracts',
                    actions: ['read', 'create'],
                },
                {
                    title: t('sidebar.employees.add'),
                    url: '#',
                    onClick: () => setShowAddEmployeeSheet(true),
                    module: 'employees',
                    action: 'create',
                },
            ],
        },
        {
            title: t('sidebar.organization.title'),
            url: '/dashboard/organization',
            icon: Building2,
            module: 'org_hierarchy',
            items: [
                {
                    title: t('sidebar.organization.hierarchy'),
                    url: '/dashboard/organization/hierarchy',
                    module: 'org_hierarchy',
                },
                {
                    title: t('sidebar.organization.company'),
                    url: '/dashboard/organization/company',
                    module: 'org_hierarchy',
                },
                {
                    title: t('sidebar.organization.division'),
                    url: '/dashboard/organization/division',
                    module: 'org_hierarchy',
                },
                {
                    title: t('sidebar.organization.subDivision'),
                    url: '/dashboard/organization/sub-division',
                    module: 'org_hierarchy',
                },
                {
                    title: t('sidebar.organization.department'),
                    url: '/dashboard/organization/department',
                    module: 'org_hierarchy',
                },
            ],
        },
        {
            title: t('sidebar.attendance.title'),
            url: '/dashboard/attendance',
            icon: CalendarCheck,
            module: 'attendance',
            items: [
                {
                    title: t('sidebar.attendance.overview'),
                    url: '/dashboard/attendance/overview',
                    module: 'attendance',
                },
                {
                    title: t('sidebar.attendance.shifts'),
                    url: '/dashboard/attendance/shifts',
                    module: 'shifts',
                },
                {
                    title: t('sidebar.attendance.overtime'),
                    url: '/dashboard/attendance/overtime',
                    module: 'overtime',
                },
            ],
        },
        {
            title: t('sidebar.leave.title'),
            url: '/dashboard/leave',
            icon: CalendarOff,
            module: 'leave_types',
            items: [
                {
                    title: t('sidebar.leave.requests'),
                    url: '/dashboard/leave/leave-requests',
                    module: 'leave_requests',
                },
                {
                    title: t('sidebar.leave.types'),
                    url: '/dashboard/leave/leave-types',
                    module: 'leave_types',
                },
                {
                    title: t('sidebar.leave.policies'),
                    url: '/dashboard/leave/policies',
                    module: 'leave_policies',
                },
                {
                    title: t('sidebar.leave.balances'),
                    url: '/dashboard/leave/balances',
                    module: 'leave_balances',
                },
            ],
        },
        {
            title: t('sidebar.payroll.title'),
            url: '/dashboard/payroll',
            icon: CircleDollarSign,
            module: 'payroll_runs',
            items: [
                {
                    title: t('sidebar.payroll.runs'),
                    url: '/dashboard/payroll/runs',
                    module: 'payroll_runs',
                },
                {
                    title: t('sidebar.payroll.salaries'),
                    url: '/dashboard/payroll/salaries',
                    module: 'employee_salaries',
                },
                {
                    title: t('sidebar.payroll.components'),
                    url: '/dashboard/payroll/components',
                    module: 'payroll_components',
                },
                {
                    title: t('sidebar.payroll.payslips'),
                    url: '/dashboard/payroll/payslips',
                    module: 'payslips',
                },
            ],
        },
        {
            title: t('sidebar.benefits.title'),
            url: '/dashboard/benefits',
            icon: HandHeart,
            module: 'benefits_insurance',
            items: [
                {
                    title: t('sidebar.benefits.insurance'),
                    url: '/dashboard/benefits/insurance',
                },
                {
                    title: t('sidebar.benefits.entitlements'),
                    url: '/dashboard/benefits/entitlements',
                },
            ],
        },
        {
            title: t('sidebar.documents.title'),
            url: '/dashboard/documents',
            icon: FileText,
            module: 'documents',
            items: [
                {
                    title: t('sidebar.documents.employee'),
                    url: '/dashboard/documents/employee-documents',
                    module: 'documents',
                },
                {
                    title: t('sidebar.documents.compliance'),
                    url: '/dashboard/documents/compliance-tracking',
                    module: 'compliance',
                },
                {
                    title: t('sidebar.documents.categories'),
                    url: '/dashboard/documents/categories',
                    module: 'document_categories',
                },
            ],
        },
        {
            title: t('sidebar.reports.title'),
            url: '/dashboard/reports',
            icon: BarChart3,
            module: 'reports_hr',
            items: [
                {
                    title: t('sidebar.reports.hr'),
                    url: '/dashboard/reports/hr-reports',
                    module: 'reports_hr',
                },
                {
                    title: t('sidebar.reports.payroll'),
                    url: '/dashboard/reports/payroll-reports',
                    module: 'reports_payroll',
                },
                {
                    title: t('sidebar.reports.custom'),
                    url: '/dashboard/reports/custom-reports',
                    module: 'reports_custom',
                },
            ],
        },
    ]
        .map((item: SidebarItem) => {
            // Filter sub-items first
            const filteredSubItems = item.items?.filter((subItem: SidebarSubItem) => {
                if (!subItem.module) return true;
                if (!permissionsMap) return false;
                if (permissionsMap['all']?.['manage']) return true;

                const checkAction = (action: string) => {
                    const modulePerms = permissionsMap[subItem.module!];
                    if (!modulePerms) return false;

                    return (
                        !!modulePerms[action] ||
                        !!modulePerms['manage'] ||
                        (action === 'read' && Object.keys(modulePerms).length > 0)
                    );
                };

                if (subItem.actions?.length) {
                    return subItem.actions.every((requiredAction) => checkAction(requiredAction));
                }

                const action = subItem.action || 'read';
                return checkAction(action);
            });

            return { ...item, items: filteredSubItems };
        })
        .filter((item: SidebarItem) => {
            if (isInitializing) return false;
            if (!permissionsMap) return false;

            // Global Super Admin check
            if (permissionsMap['all']?.['manage']) return true;

            const checkPerm = (mod?: string, action: string = 'read') => {
                if (!mod) return false;
                const modulePerms = permissionsMap[mod];
                if (!modulePerms) return false;

                return (
                    !!modulePerms[action] ||
                    !!modulePerms['manage'] ||
                    (action === 'read' && Object.keys(modulePerms).length > 0)
                );
            };

            // Visible if parent is allowed OR if any (already filtered) child exists
            const parentAllowed = !item.module || checkPerm(item.module);
            const hasVisibleChildren = item.items && item.items.length > 0;

            return parentAllowed || hasVisibleChildren;
        });

    const systemItems = [
        {
            title: t('sidebar.settings'),
            url: '/dashboard/settings',
            icon: Settings,
        },
        {
            title: t('sidebar.assistant'),
            url: '/dashboard/assistant',
            icon: Bot,
        },
    ];

    const footerItems = [
        {
            title: t('sidebar.help'),
            url: '/dashboard/help',
            icon: CircleHelp,
        },
        {
            title: t('sidebar.logout'),
            url: '/logout',
            icon: LogOut,
        },
    ];

    return (
        <>
            <Sidebar variant="sidebar" collapsible="icon" {...props}>
                <SidebarHeader className="p-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Building2 className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-semibold">HRMS</span>
                            </div>
                        </div>
                        <div className="hidden md:block group-data-[collapsible=icon]:hidden">
                            <SidebarTrigger className="-ml-1 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="px-2">
                    <SidebarGroup>
                        <SidebarGroupLabel className="p-2 text-xs font-medium text-muted-foreground capitalize tracking-wider group-data-[collapsible=icon]:hidden">
                            {t('sidebar.platform')}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        {item.items ? (
                                            <Collapsible
                                                asChild
                                                className="group/collapsible"
                                                open={isSubmenuOpen(item.url)}
                                                onOpenChange={(open) => {
                                                    if (state === 'collapsed') {
                                                        setOpen(true);
                                                        setSubmenuOpen(item.url, true);
                                                    } else {
                                                        setSubmenuOpen(item.url, open);
                                                    }
                                                }}
                                            >
                                                <div>
                                                    <CollapsibleTrigger asChild>
                                                        <SidebarMenuButton tooltip={item.title}>
                                                            {item.icon && <item.icon />}
                                                            <span>{item.title}</span>
                                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                                                        </SidebarMenuButton>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent>
                                                        <SidebarMenuSub>
                                                            {item.items.map(
                                                                (subItem: SidebarSubItem) => (
                                                                    <SidebarMenuSubItem
                                                                        key={subItem.title}
                                                                    >
                                                                        <SidebarMenuSubButton
                                                                            asChild
                                                                            isActive={
                                                                                pathname ===
                                                                                subItem.url
                                                                            }
                                                                        >
                                                                            <Link
                                                                                href={subItem.url}
                                                                                onClick={(e) => {
                                                                                    if (
                                                                                        subItem.onClick
                                                                                    ) {
                                                                                        e.preventDefault();
                                                                                        subItem.onClick();
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <span>
                                                                                    {subItem.title}
                                                                                </span>
                                                                            </Link>
                                                                        </SidebarMenuSubButton>
                                                                    </SidebarMenuSubItem>
                                                                ),
                                                            )}
                                                        </SidebarMenuSub>
                                                    </CollapsibleContent>
                                                </div>
                                            </Collapsible>
                                        ) : (
                                            <SidebarMenuButton
                                                asChild
                                                tooltip={item.title}
                                                isActive={item.isActive}
                                            >
                                                <Link
                                                    href={item.url}
                                                    onClick={(e) => {
                                                        if (state === 'collapsed') {
                                                            setOpen(true);
                                                        }
                                                        if (
                                                            'onClick' in item &&
                                                            typeof item.onClick === 'function'
                                                        ) {
                                                            e.preventDefault();
                                                            (item as any).onClick();
                                                        }
                                                    }}
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel className="p-2text-xs font-medium text-muted-foreground capitalize tracking-wider group-data-[collapsible=icon]:hidden">
                            {t('sidebar.system')}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {systemItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title}>
                                            <Link
                                                href={item.url}
                                                onClick={() => {
                                                    if (state === 'collapsed') setOpen(true);
                                                }}
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <SidebarMenu>
                        {footerItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={item.title}
                                    className={
                                        item.url === '/logout'
                                            ? 'text-destructive hover:text-destructive active:text-destructive cursor-pointer'
                                            : ''
                                    }
                                >
                                    {item.url === '/logout' ? (
                                        <a
                                            onClick={(e) => {
                                                if (state === 'collapsed') setOpen(true);
                                                handleLogoutClick(e);
                                            }}
                                            className="flex items-center w-full"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </a>
                                    ) : (
                                        <Link
                                            href={item.url}
                                            onClick={() => {
                                                if (state === 'collapsed') setOpen(true);
                                            }}
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    )}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <ConfirmationModal
                open={showLogoutModal}
                onOpenChange={setShowLogoutModal}
                onConfirm={confirmLogout}
                title={t('title', { ns: 'logoutConfirm' })}
                message={t('message', { ns: 'logoutConfirm' })}
                confirmLabel={t('confirm', { ns: 'logoutConfirm' })}
                cancelLabel={t('cancel', { ns: 'logoutConfirm' })}
                variant="primary"
                isLoading={isLoggingOut}
            />

            <AddEmployeeSheet open={showAddEmployeeSheet} onOpenChange={setShowAddEmployeeSheet} />
        </>
    );
}
