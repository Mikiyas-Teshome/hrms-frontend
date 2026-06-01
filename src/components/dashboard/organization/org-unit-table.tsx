'use client';

import React, { useMemo, useState } from 'react';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import { useOrganizationHierarchy } from '@/features/organization/hooks/useOrganization';
import { OUType, OrganizationUnitType } from '@/features/organization/organization.types';
import { Badge } from '@/components/ui/badge';
import { TableActionMenu } from '@/components/ui/table-action-menu';
import { Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { OrgUnitDetailsSheet } from './org-unit-details-sheet';
import { AssignShiftModal } from './assign-shift-modal';
import { useForm, useWatch } from 'react-hook-form';
import { FormSelect } from '@/components/ui/FormSelect';
import { useTranslation } from 'react-i18next';
import { OrgHierarchyStats } from './org-stats';

interface OrgUnitTableProps {
    type: OUType;
}

import { OrgUnitTableSkeleton } from './OrgUnitTableSkeleton';
// Helper functions moved outside component to handle recursion and avoid re-creation
const countChildren = (unit: OrganizationUnitType, childType: string) => {
    const count = (node: OrganizationUnitType): number => {
        let total = node.type === childType ? 1 : 0;
        if (node.children) {
            total += node.children.reduce((acc, child) => acc + count(child), 0);
        }
        return total;
    };
    return (unit.children || []).reduce((acc, child) => acc + count(child), 0);
};

const getAllUnitsOfType = (targetType: string, nodes: OrganizationUnitType[]): OrganizationUnitType[] => {
    let result: OrganizationUnitType[] = [];
    for (const node of nodes) {
        if (node.type === targetType) result.push(node);
        if (node.children) {
            result = result.concat(getAllUnitsOfType(targetType, node.children));
        }
    }
    return result;
};

const findUnitById = (id: string, nodes: OrganizationUnitType[]): OrganizationUnitType | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findUnitById(id, node.children);
            if (found) return found;
        }
    }
    return null;
};

const isChild = (parent: OrganizationUnitType, childId: string): boolean => {
    return (parent.children || []).some(c => c.id === childId || isChild(c, childId));
};

const findCompanyForUnit = (unitId: string, nodes: OrganizationUnitType[]): OrganizationUnitType | null => {
    for (const node of nodes) {
        if (node.type === 'COMPANY') {
            if (node.id === unitId) return node;
            if (isChild(node, unitId)) return node;
        }
        if (node.children) {
            const found = findCompanyForUnit(unitId, node.children);
            if (found) return found;
        }
    }
    return null;
};

export function OrgUnitTable({ type }: OrgUnitTableProps) {
    const { t } = useTranslation(['dashboard', 'orgStructure']);
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();
    const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isAssignShiftOpen, setIsAssignShiftOpen] = useState(false);
    const [assignShiftUnit, setAssignShiftUnit] = useState<OrganizationUnitType | null>(null);
    const [searchValue, setSearchValue] = useState('');

    const resolvedCompanyId = useMemo(() => {
        if (!assignShiftUnit || !hierarchy) return null;
        const comp = findCompanyForUnit(assignShiftUnit.id, hierarchy);
        return comp ? comp.id : null;
    }, [assignShiftUnit, hierarchy]);

    const handleAssignShift = (unit: OrganizationUnitType) => {
        setAssignShiftUnit(unit);
        setIsAssignShiftOpen(true);
    };
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { control } = useForm<{
        companyId: string;
        divisionId: string;
        subDivisionId: string;
    }>({
        defaultValues: {
            companyId: 'all',
            divisionId: 'all',
            subDivisionId: 'all',
        }
    });

    const selectedCompanyId = useWatch({ control, name: 'companyId' });
    const selectedDivisionId = useWatch({ control, name: 'divisionId' });
    const selectedSubDivisionId = useWatch({ control, name: 'subDivisionId' });


    const filteredHierarchy = useMemo(() => {
        if (!hierarchy) return [];
        
        if (selectedSubDivisionId !== 'all') {
            const subDiv = findUnitById(selectedSubDivisionId, hierarchy);
            return subDiv ? [subDiv] : [];
        } else if (selectedDivisionId !== 'all') {
            const div = findUnitById(selectedDivisionId, hierarchy);
            return div ? [div] : [];
        } else if (selectedCompanyId !== 'all') {
            const comp = findUnitById(selectedCompanyId, hierarchy);
            return comp ? [comp] : [];
        }
        
        return hierarchy;
    }, [hierarchy, selectedCompanyId, selectedDivisionId, selectedSubDivisionId]);

    const units = useMemo(() => {
        if (!hierarchy) return [];
        
        let targetUnits = getAllUnitsOfType(type, hierarchy);

        if (selectedSubDivisionId !== 'all') {
            const subDiv = findUnitById(selectedSubDivisionId, hierarchy);
            if (subDiv) {
                targetUnits = targetUnits.filter(u => isChild(subDiv, u.id));
            }
        } else if (selectedDivisionId !== 'all') {
            const div = findUnitById(selectedDivisionId, hierarchy);
            if (div) {
                targetUnits = targetUnits.filter(u => isChild(div, u.id));
            }
        } else if (selectedCompanyId !== 'all') {
            const comp = findUnitById(selectedCompanyId, hierarchy);
            if (comp) {
                targetUnits = targetUnits.filter(u => isChild(comp, u.id));
            }
        }

        return targetUnits;
    }, [hierarchy, type, selectedCompanyId, selectedDivisionId, selectedSubDivisionId]);

    const filteredUnits = useMemo(() => {
        return units.filter((u) => 
            u.name.toLowerCase().includes(searchValue.toLowerCase())
        );
    }, [units, searchValue]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredUnits.slice(start, start + pageSize);
    }, [filteredUnits, currentPage, pageSize]);

    // Options for filters
    const companyOptions = useMemo(() => {
        const companies = getAllUnitsOfType('COMPANY', hierarchy || []);
        return [{ label: t('orgStructure:hierarchy.levels.level2'), value: 'all' }, ...companies.map(c => ({ label: c.name, value: c.id }))];
    }, [hierarchy, t]);

    const divisionOptions = useMemo(() => {
        let source = hierarchy || [];
        if (selectedCompanyId !== 'all') {
            const comp = findUnitById(selectedCompanyId, source);
            source = comp ? [comp] : [];
        }
        const divisions = getAllUnitsOfType('DIVISION', source);
        return [{ label: t('orgStructure:hierarchy.levels.level3'), value: 'all' }, ...divisions.map(d => ({ label: d.name, value: d.id }))];
    }, [hierarchy, selectedCompanyId, t]);

    const subDivisionOptions = useMemo(() => {
        let source = hierarchy || [];
        if (selectedDivisionId !== 'all') {
            const div = findUnitById(selectedDivisionId, source);
            source = div ? [div] : [];
        } else if (selectedCompanyId !== 'all') {
            const comp = findUnitById(selectedCompanyId, source);
            source = comp ? [comp] : [];
        }
        const subDivisions = getAllUnitsOfType('SUB_DIVISION', source);
        return [{ label: t('orgStructure:hierarchy.levels.level4'), value: 'all' }, ...subDivisions.map(s => ({ label: s.name, value: s.id }))];
    }, [hierarchy, selectedDivisionId, selectedCompanyId, t]);

    const unitLabel = useMemo(() => {
        switch(type) {
            case 'COMPANY': return t('orgStructure:hierarchy.levels.level2');
            case 'DIVISION': return t('orgStructure:hierarchy.levels.level3');
            case 'SUB_DIVISION': return t('orgStructure:hierarchy.levels.level4');
            case 'DEPARTMENT': return t('orgStructure:hierarchy.levels.level5');
            default: return type;
        }
    }, [type, t]);

    const columns: ColumnConfig<OrganizationUnitType>[] = useMemo(() => {
        const cols: ColumnConfig<OrganizationUnitType>[] = [
            {
                key: 'name',
                label: `${unitLabel} name`,
                sortable: true,
                render: (unit) => (
                    <span className="font-medium text-foreground">{unit.name}</span>
                ),
            },
        ];

        if (type === 'COMPANY') {
            cols.push({
                key: 'divisions',
                label: t('orgStructure:hierarchy.levels.level3') + 's',
                render: (unit) => countChildren(unit, 'DIVISION'),
            });
        }

        if (type === 'COMPANY' || type === 'DIVISION') {
            cols.push({
                key: 'subDivisions',
                label: t('orgStructure:hierarchy.levels.level4') + 's',
                render: (unit) => countChildren(unit, 'SUB_DIVISION'),
            });
        }

        if (type !== 'DEPARTMENT') {
            cols.push({
                key: 'departments',
                label: t('orgStructure:hierarchy.levels.level5') + 's',
                render: (unit) => countChildren(unit, 'DEPARTMENT'),
            });
        }

        cols.push({
            key: 'location',
            label: 'Location',
            render: (unit) => unit.companyProfile?.address?.split(',').pop()?.trim() || 'UAE',
        });

        cols.push({
            key: 'status',
            label: 'Status',
            render: (unit) => (
                <Badge 
                    variant={unit.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={`rounded-full px-3 py-1 flex items-center gap-1.5 w-fit ${
                        unit.status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                            : ''
                    }`}
                >
                    <div className={`size-1.5 rounded-full ${unit.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="capitalize">{unit.status.toLowerCase()}</span>
                </Badge>
            ),
        });

        return cols;
    }, [type, unitLabel, t]);

    const handleView = (unit: OrganizationUnitType) => {
        setSelectedUnitId(unit.id);
        setIsDetailsOpen(true);
    };

    if (isLoading) {
        return <OrgUnitTableSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Page Header with Parallel Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-foreground">{unitLabel}</h1>
                
                <div className="flex flex-wrap items-center gap-3">
                    {type !== 'COMPANY' && (
                        <FormSelect
                            id="filter-company"
                            control={control}
                            name="companyId"
                            options={companyOptions}
                            t={t}
                            placeholder={t('orgStructure:hierarchy.levels.level2')}
                            containerClassName="w-44"
                        />
                    )}
                    {(type === 'SUB_DIVISION' || type === 'DEPARTMENT') && (
                        <FormSelect
                            id="filter-division"
                            control={control}
                            name="divisionId"
                            options={divisionOptions}
                            t={t}
                            placeholder={t('orgStructure:hierarchy.levels.level3')}
                            containerClassName="w-44"
                        />
                    )}
                    {type === 'DEPARTMENT' && (
                        <FormSelect
                            id="filter-subdivision"
                            control={control}
                            name="subDivisionId"
                            options={subDivisionOptions}
                            t={t}
                            placeholder={t('orgStructure:hierarchy.levels.level4')}
                            containerClassName="w-44"
                        />
                    )}
                </div>
            </div>

            <OrgHierarchyStats data={filteredHierarchy} />

            <UniversalDataTable
                data={paginatedData}
                columns={columns}
                isLoading={isLoading}
                enableSelection={true}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={`Search for ${unitLabel.toLowerCase()}`}
                totalItems={filteredUnits.length}
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUnits.length / pageSize)}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                renderRowActions={(unit) => (
                    <TableActionMenu
                        actions={[
                            {
                                label: 'View',
                                icon: Eye,
                                onClick: () => handleView(unit),
                            },
                            {
                                label: 'Edit',
                                icon: Edit,
                                onClick: () => console.log('Edit', unit.id),
                            },
                            {
                                label: t('orgStructure:assignShift.action', 'Assign shift'),
                                icon: Calendar,
                                onClick: () => handleAssignShift(unit),
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                isDanger: true,
                                onClick: () => console.log('Delete', unit.id),
                            },
                        ]}
                    />
                )}
            />

            <OrgUnitDetailsSheet
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                unitId={selectedUnitId}
                type={type}
            />

            <AssignShiftModal
                isOpen={isAssignShiftOpen}
                onClose={() => {
                    setIsAssignShiftOpen(false);
                    setAssignShiftUnit(null);
                }}
                target={assignShiftUnit ? {
                    id: assignShiftUnit.id,
                    name: assignShiftUnit.name,
                    type: assignShiftUnit.type as 'COMPANY' | 'DIVISION' | 'SUB_DIVISION' | 'DEPARTMENT',
                    companyId: resolvedCompanyId,
                } : null}
            />
        </div>
    );
}
