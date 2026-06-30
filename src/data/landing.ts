export const landingNavIds = ['home', 'features', 'howItWorks', 'pricing', 'faq', 'contact'] as const;

export type LandingNavId = (typeof landingNavIds)[number];

export const LANDING_AVATAR_IMAGE = '/assets/landing/sample.jpeg';
export const LANDING_DASHBOARD_PREVIEW_IMAGE = '/assets/landing/dashboard-preview.png';
export const LANDING_DASHBOARD_PREVIEW_DARK_IMAGE = '/assets/landing/dashboard-preview-dark.png';
export const LANDING_CONTACT_EMAIL =
    process.env.NEXT_PUBLIC_LANDING_CONTACT_EMAIL ?? 'sales@bekurhrms.com';

export const landingContactHighlights = [
    { id: 'demo', icon: 'calendar' },
    { id: 'enterprise', icon: 'building' },
    { id: 'response', icon: 'clock' },
] as const;

export const heroMemberAvatars = Array.from({ length: 4 }, (_, index) => ({
    id: `member-${index + 1}`,
    image: LANDING_AVATAR_IMAGE,
}));

export const landingFeatures = [
    {
        id: 'employeeData',
        icon: 'users',
    },
    {
        id: 'payroll',
        icon: 'wallet',
    },
    {
        id: 'performance',
        icon: 'target',
    },
    {
        id: 'attendance',
        icon: 'clock',
    },
    {
        id: 'leave',
        icon: 'calendar',
    },
    {
        id: 'reports',
        icon: 'barChart',
    },
] as const;

export const landingEmployeeSamples = [
    { id: 'sarah', initials: 'SM' },
    { id: 'james', initials: 'JC' },
] as const;

export const landingPerformancePreviewItems = [
    { id: 'q1Goals', progress: 85 },
    { id: 'teamOkrs', progress: 62 },
    { id: 'reviews', progress: 40 },
] as const;

export const landingStats = [
    { id: 'payroll', value: '92%' },
    { id: 'onboarding', value: '3x' },
    { id: 'productivity', value: '40%' },
    { id: 'satisfaction', value: '85%' },
] as const;

export const landingSteps = [
    { id: 'setup', icon: 'building' },
    { id: 'invite', icon: 'userPlus' },
    { id: 'configure', icon: 'settings' },
    { id: 'launch', icon: 'rocket' },
] as const;

export const trustedCompanies = [
    'Dropbox',
    'Discord',
    'GitHub',
    'Slack',
    'Intercom',
    'Canva',
    'Google',
    'Stripe',
] as const;

export const landingTestimonials = [
    { id: 'michael', image: LANDING_AVATAR_IMAGE, initials: 'MJ' },
    { id: 'sarah', image: LANDING_AVATAR_IMAGE, initials: 'SC' },
    { id: 'david', image: LANDING_AVATAR_IMAGE, initials: 'DK' },
    { id: 'emma', image: LANDING_AVATAR_IMAGE, initials: 'ER' },
    { id: 'james', image: LANDING_AVATAR_IMAGE, initials: 'JL' },
    { id: 'lisa', image: LANDING_AVATAR_IMAGE, initials: 'LM' },
] as const;

export const landingFaqItems = [
    { id: 'whatIs' },
    { id: 'freeTrial' },
    { id: 'security' },
    { id: 'integrations' },
    { id: 'support' },
    { id: 'cancel' },
] as const;

export const landingPricingPlans = [
    {
        id: 'essential',
        price: 3,
        featured: false,
        features: ['employeeManagement', 'leaveManagement', 'attendanceTracking'],
    },
    {
        id: 'professional',
        price: 6,
        featured: true,
        features: [
            'employeeManagement',
            'leaveManagement',
            'attendanceTracking',
            'shiftManagement',
            'payrollEngine',
            'benefitsManagement',
        ],
    },
    {
        id: 'enterprise',
        price: null,
        featured: false,
        features: [
            'employeeManagement',
            'leaveManagement',
            'attendanceTracking',
            'shiftManagement',
            'payrollEngine',
            'benefitsManagement',
            'complianceTracking',
            'aiAnalytics',
        ],
    },
] as const;

export const footerLinkGroups = [
    {
        id: 'product',
        links: ['features', 'pricing', 'faq'],
    },
    {
        id: 'company',
        links: ['about', 'careers', 'contact'],
    },
    {
        id: 'resources',
        links: ['blog', 'helpCenter', 'documentation'],
    },
    {
        id: 'legal',
        links: ['privacy', 'terms'],
    },
] as const;
