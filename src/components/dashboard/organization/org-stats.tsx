'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, GitBranch, Layers2, Users, Loader2 } from 'lucide-react';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { OrganizationUnitType } from '@/features/organization/organization.types';


interface StatCardProps {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value: number | string;
    loading?: boolean;
}

function StatCard({ icon, iconBg, label, value, loading }: StatCardProps) {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-sm">
            <div
                className={`shrink-0 flex items-center justify-center rounded-full w-12 h-12 ${iconBg}`}
            >
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium truncate">{label}</p>
                {loading ? (
                    <div className="mt-1 h-7 w-8 rounded bg-muted animate-pulse" />
                ) : (
                    <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
                )}
            </div>
        </div>
    );
}


function flattenNodes(nodes: OrganizationUnitType[]): OrganizationUnitType[] {
    const result: OrganizationUnitType[] = [];
    const traverse = (node: OrganizationUnitType) => {
        result.push(node);
        (node.children || []).forEach(traverse);
    };
    nodes.forEach(traverse);
    return result;
}


export function OrgHierarchyStats({ data: providedData }: { data?: OrganizationUnitType[] }) {
    const { t } = useTranslation('dashboard');
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();

    const stats = useMemo(() => {
        const sourceData = providedData || hierarchy;
        if (!sourceData) return { companies: 0, divisions: 0, subDivisions: 0, departments: 0 };
        const all = flattenNodes(sourceData);
        return {
            companies: all.filter((n: any) => n.type === 'COMPANY').length,
            divisions: all.filter((n: any) => n.type === 'DIVISION').length,
            subDivisions: all.filter((n: any) => n.type === 'SUB_DIVISION').length,
            departments: all.filter((n: any) => n.type === 'DEPARTMENT').length,
        };
    }, [hierarchy, providedData]);

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
                icon={<Building2 className="size-5 text-orange-500" />}
                iconBg="bg-orange-50 dark:bg-orange-500/10"
                label={t('orgStats.companies', { defaultValue: 'Number of companies' })}
                value={stats.companies}
                loading={isLoading}
            />
            <StatCard
                icon={<GitBranch className="size-5 text-indigo-500" />}
                iconBg="bg-indigo-50 dark:bg-indigo-500/10"
                label={t('orgStats.divisions', { defaultValue: 'Number of divisions' })}
                value={stats.divisions}
                loading={isLoading}
            />
            <StatCard
                icon={<Layers2 className="size-5 text-violet-500" />}
                iconBg="bg-violet-50 dark:bg-violet-500/10"
                label={t('orgStats.subDivisions', { defaultValue: 'Number of sub-divisions' })}
                value={stats.subDivisions}
                loading={isLoading}
            />
            <StatCard
                icon={<Users className="size-5 text-pink-500" />}
                iconBg="bg-pink-50 dark:bg-pink-500/10"
                label={t('orgStats.departments', { defaultValue: 'Number of departments' })}
                value={stats.departments}
                loading={isLoading}
            />
        </div>
    );
}

export function OrgLoadingState() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="relative">
                <Loader2 className="size-12 text-primary animate-spin" />
                <div className="absolute inset-0 size-12 border-4 border-primary/20 rounded-full" />
            </div>
            <p className="text-lg font-semibold text-foreground animate-pulse">
                Fetching organization hierarchy, please wait...
            </p>
        </div>
    );
}
