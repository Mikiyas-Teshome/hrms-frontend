'use client';

import React from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useOrganizationUnit } from '@/features/organization/hooks/useOrganization';
import { OUType, OrganizationUnitType } from '@/features/organization/organization.types';
import { Loader2 } from 'lucide-react';

interface OrgUnitDetailsSheetProps {
    isOpen: boolean;
    onClose: () => void;
    unitId: string | null;
    type: OUType;
}

const TYPE_LABELS: Record<OUType, string> = {
    COMPANY: 'Company',
    DIVISION: 'Division',
    SUB_DIVISION: 'Sub-division',
    DEPARTMENT: 'Department',
    GROUP: 'Group',
};

export function OrgUnitDetailsSheet({ isOpen, onClose, unitId, type }: OrgUnitDetailsSheetProps) {
    const { data: unit, isLoading } = useOrganizationUnit(unitId || '');

    // Helper to count children by type
    const countChildren = (targetUnit: OrganizationUnitType, childType: string) => {
        const count = (node: OrganizationUnitType): number => {
            let total = node.type === childType ? 1 : 0;
            if (node.children) {
                total += node.children.reduce((acc, child) => acc + count(child), 0);
            }
            return total;
        };
        return (targetUnit.children || []).reduce((acc, child) => acc + count(child), 0);
    };

    const profile = unit?.companyProfile;
    const stats = unit ? {
        divisions: countChildren(unit, 'DIVISION'),
        subDivisions: countChildren(unit, 'SUB_DIVISION'),
        departments: countChildren(unit, 'DEPARTMENT'),
    } : { divisions: 0, subDivisions: 0, departments: 0 };

    const unitLabel = TYPE_LABELS[type] || 'Unit';

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-xl p-0 overflow-hidden bg-background border-none shadow-2xl flex flex-col h-full">
                <SheetHeader className="px-8 py-6 border-b border-border flex flex-row items-center justify-between shrink-0">
                    <SheetTitle className="text-2xl font-bold text-foreground">
                        {unitLabel} details
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 p-8 space-y-8 bg-muted/20 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-10 text-primary animate-spin" />
                            <p className="text-sm font-medium text-muted-foreground">Loading {unitLabel.toLowerCase()} details...</p>
                        </div>
                    ) : !unit ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                            <p className="text-sm font-medium text-destructive">Failed to load {unitLabel.toLowerCase()} details.</p>
                            <button onClick={onClose} className="text-xs text-primary hover:underline">Close</button>
                        </div>
                    ) : (
                        <>
                            {/* Unit Info Section */}
                            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                                <div className="px-6 py-4 border-b border-border bg-card">
                                    <h3 className="text-sm font-semibold text-foreground">{unitLabel} info</h3>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoCard label={`${unitLabel} name`} value={unit.name} />
                                        {profile && (
                                            <>
                                                <InfoCard label="Legal company name" value={profile.legalName} />
                                                <InfoCard label="Tax identification number (TIN)" value={profile.taxId} />
                                                <InfoCard label="Business registration number" value={profile.registrationNumber} />
                                                <InfoCard label="Trade License number" value={profile.tradeLicenseNumber} />
                                                <InfoCard label="DUNS number" value={profile.dunsNumber} />
                                                <InfoCard label="Currency" value={profile.currency} />
                                                <InfoCard label="Timezone" value={profile.timezone} />
                                                <InfoCard label="Industry" value={profile.industry} />
                                                <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
                                                    <p className="text-xs text-muted-foreground font-medium">Theme</p>
                                                    <div 
                                                        className="w-full h-10 rounded-lg" 
                                                        style={{ backgroundColor: profile.themeColor || '#4F46E5' }} 
                                                    />
                                                </div>
                                                <div className="md:col-span-2 p-4 rounded-xl border border-border bg-background/50 space-y-1">
                                                    <p className="text-xs text-muted-foreground font-medium">Address</p>
                                                    <p className="text-[15px] font-medium text-foreground">{profile.address || '—'}</p>
                                                </div>
                                            </>
                                        )}
                                        {!profile && (
                                            <div className="md:col-span-2 p-4 rounded-xl border border-border bg-background/50 space-y-1">
                                                <p className="text-xs text-muted-foreground font-medium">Status</p>
                                                <p className="text-[15px] font-medium text-foreground capitalize">{unit.status.toLowerCase()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Unit Children Section */}
                            {(stats.divisions > 0 || stats.subDivisions > 0 || stats.departments > 0) && (
                                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                                    <div className="px-6 py-4 border-b border-border bg-card">
                                        <h3 className="text-sm font-semibold text-foreground">Unit children</h3>
                                    </div>
                                    <div className="divide-y divide-border">
                                        {type === 'COMPANY' && <StatRow label="Devision" value={stats.divisions} />}
                                        {(type === 'COMPANY' || type === 'DIVISION') && <StatRow label="Sub division" value={stats.subDivisions} />}
                                        {(type === 'COMPANY' || type === 'DIVISION' || type === 'SUB_DIVISION') && <StatRow label="Department" value={stats.departments} />}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="p-4 rounded-xl border border-border bg-background/50 space-y-1">
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            <p className="text-[15px] font-medium text-foreground truncate">{value || '—'}</p>
        </div>
    );
}

function StatRow({ label, value }: { label: string; value: number }) {
    return (
        <div className="px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    );
}
