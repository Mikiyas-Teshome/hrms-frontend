/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useMemo } from 'react';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { OUType, OrganizationUnitType } from '@/features/organization/organization.types';
import { OrgHierarchyStats, OrgLoadingState } from '@/components/dashboard/organization/org-stats';
import { Building2, GitBranch, Layers2, Users, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// ─── Type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
    string,
    { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
    COMPANY: {
        label: 'Company',
        icon: <Building2 className="size-4 text-orange-500" />,
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-500/10',
    },
    DIVISION: {
        label: 'Division',
        icon: <GitBranch className="size-4 text-indigo-500" />,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    SUB_DIVISION: {
        label: 'Sub-division',
        icon: <Layers2 className="size-4 text-violet-500" />,
        color: 'text-violet-600',
        bg: 'bg-violet-50 dark:bg-violet-500/10',
    },
    DEPARTMENT: {
        label: 'Department',
        icon: <Users className="size-4 text-pink-500" />,
        color: 'text-pink-600',
        bg: 'bg-pink-50 dark:bg-pink-500/10',
    },
};

// ─── Flatten ──────────────────────────────────────────────────────────────────

function flattenNodes(nodes: OrganizationUnitType[]): OrganizationUnitType[] {
    const result: OrganizationUnitType[] = [];
    const traverse = (node: OrganizationUnitType) => {
        result.push(node);
        (node.children || []).forEach(traverse);
    };
    nodes.forEach(traverse);
    return result;
}

function findParentName(hierarchy: OrganizationUnitType[], parentId?: string | null): string {
    if (!parentId) return '—';
    const all = flattenNodes(hierarchy);
    return all.find((n) => n.id === parentId)?.name ?? '—';
}

// ─── Unit Row ─────────────────────────────────────────────────────────────────

interface UnitRowProps {
    unit: OrganizationUnitType;
    parentName: string;
    cfg: (typeof TYPE_CONFIG)[string];
}

function UnitRow({ unit, parentName, cfg }: UnitRowProps) {
    return (
        <div className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/60 bg-card hover:bg-muted/30 transition-colors">
            <div
                className={`shrink-0 flex items-center justify-center w-9 h-9 rounded-full ${cfg.bg}`}
            >
                {cfg.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{unit.name}</p>
                {parentName !== '—' && (
                    <p className="text-xs text-muted-foreground truncate">
                        Parent: {parentName}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground">
                    {unit.totalMembers ?? 0} members
                </span>
                <Badge
                    variant={unit.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="text-[11px] capitalize"
                >
                    {(unit.status ?? 'active').toLowerCase()}
                </Badge>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface OrgUnitListProps {
    type: OUType;
    title: string;
    description: string;
}

export function OrgUnitList({ type, title, description }: OrgUnitListProps) {
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.COMPANY;

    const units = useMemo(() => {
        if (!hierarchy) return [];
        return flattenNodes(hierarchy).filter((n) => n.type === type);
    }, [hierarchy, type]);

    if (isLoading) return <OrgLoadingState />;

    return (
        <div className="space-y-6">
            {/* Stats from hierarchy */}
            <OrgHierarchyStats />

            {/* List */}
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${cfg.bg}`}>{cfg.icon}</div>
                        <div>
                            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                            <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {units.length} {units.length === 1 ? cfg.label : cfg.label + 's'}
                    </Badge>
                </div>

                {/* Body */}
                <div className="p-4 space-y-2">
                    {units.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                            <div className="p-3 rounded-full bg-muted">
                                <AlertCircle className="size-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-foreground">
                                No {cfg.label.toLowerCase()}s found
                            </p>
                            <p className="text-xs text-muted-foreground max-w-[260px]">
                                Add {cfg.label.toLowerCase()}s from the Organisational hierarchy
                                page using the unit builder.
                            </p>
                        </div>
                    ) : (
                        units.map((unit) => (
                            <UnitRow
                                key={unit.id}
                                unit={unit}
                                parentName={findParentName(hierarchy!, unit.parentId)}
                                cfg={cfg}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
