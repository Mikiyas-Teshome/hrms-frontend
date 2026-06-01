import {
    BarChart3,
    Bot,
    Building2,
    CalendarCheck,
    CalendarOff,
    CircleDollarSign,
    CircleHelp,
    FileText,
    HandHeart,
    LayoutDashboard,
    Settings,
    Shield,
    Users,
} from 'lucide-react';
import type { DashboardNavigationItemConfig } from '@/components/dashboard/layout/dashboard-navigation.types';

export const DASHBOARD_PLATFORM_NAV_CONFIG: DashboardNavigationItemConfig[] = [
    {
        titleKey: 'sidebar.dashboard',
        url: '/dashboard',
        icon: LayoutDashboard,
        module: 'dashboard',
        keywords: ['home', 'overview', 'main'],
    },
    {
        titleKey: 'sidebar.roles',
        url: '/dashboard/roles',
        icon: Shield,
        module: 'roles',
        keywords: ['permissions', 'access', 'security'],
    },
    {
        titleKey: 'sidebar.employees.title',
        url: '/dashboard/employees',
        icon: Users,
        module: 'employees',
        keywords: ['employee', 'staff', 'people', 'workforce', 'team'],
        items: [
            {
                titleKey: 'sidebar.employees.directory',
                url: '/dashboard/employees/directory',
                module: 'employees',
                keywords: ['employee', 'directory', 'staff', 'people'],
            },
            {
                titleKey: 'sidebar.employees.lifecycle',
                titleDefault: 'Employee lifecycle',
                url: '/dashboard/employees/lifecycle',
                module: 'employee_lifecycle',
                keywords: ['employee', 'lifecycle', 'onboarding', 'offboarding'],
            },
            {
                titleKey: 'sidebar.employees.contractManagement',
                titleDefault: 'Contract management',
                url: '/dashboard/employees/contracts',
                module: 'contracts',
                actions: ['read', 'create'],
                keywords: ['employee', 'contract', 'agreement', 'template', 'type'],
            },
            {
                titleKey: 'sidebar.employees.add',
                url: '#',
                module: 'employees',
                action: 'create',
                actionId: 'add-employee',
                searchable: false,
            },
        ],
    },
    {
        titleKey: 'sidebar.organization.title',
        url: '/dashboard/organization',
        icon: Building2,
        module: 'org_hierarchy',
        keywords: ['organization', 'org', 'company', 'structure', 'hierarchy'],
        items: [
            {
                titleKey: 'sidebar.organization.hierarchy',
                url: '/dashboard/organization/hierarchy',
                module: 'org_hierarchy',
                keywords: ['organization', 'hierarchy', 'structure'],
            },
            {
                titleKey: 'sidebar.organization.company',
                url: '/dashboard/organization/company',
                module: 'org_hierarchy',
                keywords: ['organization', 'company'],
            },
            {
                titleKey: 'sidebar.organization.division',
                url: '/dashboard/organization/division',
                module: 'org_hierarchy',
                keywords: ['organization', 'division'],
            },
            {
                titleKey: 'sidebar.organization.subDivision',
                url: '/dashboard/organization/sub-division',
                module: 'org_hierarchy',
                keywords: ['organization', 'sub-division', 'subdivision'],
            },
            {
                titleKey: 'sidebar.organization.department',
                url: '/dashboard/organization/department',
                module: 'org_hierarchy',
                keywords: ['organization', 'department'],
            },
        ],
    },
    {
        titleKey: 'sidebar.attendance.title',
        url: '/dashboard/attendance',
        icon: CalendarCheck,
        module: 'attendance',
        keywords: ['attendance', 'time', 'clock', 'presence'],
        items: [
            {
                titleKey: 'sidebar.attendance.overview',
                url: '/dashboard/attendance/overview',
                module: 'attendance',
                keywords: ['attendance', 'overview'],
            },
            {
                titleKey: 'sidebar.attendance.shifts',
                url: '/dashboard/attendance/shifts',
                module: 'shifts',
                keywords: ['attendance', 'shift', 'schedule'],
            },
            {
                titleKey: 'sidebar.attendance.overtime',
                url: '/dashboard/attendance/overtime',
                module: 'overtime',
                keywords: ['attendance', 'overtime'],
            },
        ],
    },
    {
        titleKey: 'sidebar.leave.title',
        url: '/dashboard/leave',
        icon: CalendarOff,
        module: 'leave_types',
        keywords: ['leave', 'vacation', 'time off', 'holiday'],
        items: [
            {
                titleKey: 'sidebar.leave.requests',
                url: '/dashboard/leave/leave-requests',
                module: 'leave_requests',
                keywords: ['leave', 'request', 'vacation'],
            },
            {
                titleKey: 'sidebar.leave.types',
                url: '/dashboard/leave/leave-types',
                module: 'leave_types',
                keywords: ['leave', 'types'],
            },
            {
                titleKey: 'sidebar.leave.policies',
                url: '/dashboard/leave/policies',
                module: 'leave_policies',
                keywords: ['leave', 'policy', 'policies'],
            },
            {
                titleKey: 'sidebar.leave.balances',
                url: '/dashboard/leave/balances',
                module: 'leave_balances',
                keywords: ['leave', 'balance', 'balances'],
            },
        ],
    },
    {
        titleKey: 'sidebar.payroll.title',
        url: '/dashboard/payroll',
        icon: CircleDollarSign,
        module: 'payroll_runs',
        keywords: ['payroll', 'salary', 'compensation', 'pay'],
        items: [
            {
                titleKey: 'sidebar.payroll.runs',
                url: '/dashboard/payroll/runs',
                module: 'payroll_runs',
                keywords: ['payroll', 'runs'],
            },
            {
                titleKey: 'sidebar.payroll.salaries',
                url: '/dashboard/payroll/salaries',
                module: 'employee_salaries',
                keywords: ['payroll', 'salary', 'salaries', 'employee'],
            },
            {
                titleKey: 'sidebar.payroll.components',
                url: '/dashboard/payroll/components',
                module: 'payroll_components',
                keywords: ['payroll', 'components'],
            },
            {
                titleKey: 'sidebar.payroll.payslips',
                url: '/dashboard/payroll/payslips',
                module: 'payslips',
                keywords: ['payroll', 'payslip', 'payslips'],
            },
        ],
    },
    {
        titleKey: 'sidebar.benefits.title',
        url: '/dashboard/benefits',
        icon: HandHeart,
        module: 'benefits_insurance',
        keywords: ['benefits', 'insurance', 'entitlements'],
        items: [
            {
                titleKey: 'sidebar.benefits.insurance',
                url: '/dashboard/benefits/insurance',
                keywords: ['benefits', 'insurance'],
            },
            {
                titleKey: 'sidebar.benefits.entitlements',
                url: '/dashboard/benefits/entitlements',
                keywords: ['benefits', 'entitlements'],
            },
        ],
    },
    {
        titleKey: 'sidebar.documents.title',
        url: '/dashboard/documents',
        icon: FileText,
        module: 'documents',
        keywords: ['documents', 'files', 'compliance'],
        items: [
            {
                titleKey: 'sidebar.documents.employee',
                url: '/dashboard/documents/employee-documents',
                module: 'documents',
                keywords: ['documents', 'employee'],
            },
            {
                titleKey: 'sidebar.documents.compliance',
                url: '/dashboard/documents/compliance-tracking',
                module: 'compliance',
                keywords: ['documents', 'compliance'],
            },
            {
                titleKey: 'sidebar.documents.categories',
                url: '/dashboard/documents/categories',
                module: 'document_categories',
                keywords: ['documents', 'categories'],
            },
        ],
    },
    {
        titleKey: 'sidebar.reports.title',
        url: '/dashboard/reports',
        icon: BarChart3,
        module: 'reports_hr',
        keywords: ['reports', 'analytics', 'insights'],
        items: [
            {
                titleKey: 'sidebar.reports.hr',
                url: '/dashboard/reports/hr-reports',
                module: 'reports_hr',
                keywords: ['reports', 'hr'],
            },
            {
                titleKey: 'sidebar.reports.payroll',
                url: '/dashboard/reports/payroll-reports',
                module: 'reports_payroll',
                keywords: ['reports', 'payroll'],
            },
            {
                titleKey: 'sidebar.reports.custom',
                url: '/dashboard/reports/custom-reports',
                module: 'reports_custom',
                keywords: ['reports', 'custom'],
            },
        ],
    },
];

export const DASHBOARD_SYSTEM_NAV_CONFIG: DashboardNavigationItemConfig[] = [
    {
        titleKey: 'sidebar.settings',
        url: '/dashboard/settings',
        icon: Settings,
        keywords: ['settings', 'preferences', 'configuration'],
    },
    {
        titleKey: 'sidebar.assistant',
        url: '/dashboard/assistant',
        icon: Bot,
        keywords: ['assistant', 'ai', 'help'],
    },
];

export const DASHBOARD_FOOTER_NAV_CONFIG: DashboardNavigationItemConfig[] = [
    {
        titleKey: 'sidebar.help',
        url: '/dashboard/help',
        icon: CircleHelp,
        keywords: ['help', 'support'],
        searchable: true,
    },
];
