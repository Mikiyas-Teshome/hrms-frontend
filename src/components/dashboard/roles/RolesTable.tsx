/* eslint-disable @typescript-eslint/no-explicit-any */
import { Role } from '@/features/roles/roles.types';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UniversalDataTable, ColumnConfig } from '@/components/ui/universal-data-table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/components/dashboard/shared/ConfirmationModal';
import { removeRole } from '@/features/roles/roles.actions';

interface RolesTableProps {
    roles: Role[];
    isLoading?: boolean;
    onRefresh?: () => void;
    onEdit?: (role: Role) => void;
}

const RolesTable: React.FC<RolesTableProps> = ({ roles, isLoading, onRefresh, onEdit }) => {
    const { t } = useTranslation('roles');
    const { toast } = useToast();
    const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = React.useState(10);
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState({ role: 'all', status: 'all' });
    const [pendingFilters, setPendingFilters] = useState({ role: 'all', status: 'all' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const activeCount = Object.values(activeFilters).filter((v) => v !== 'all').length;

    const filteredRoles = React.useMemo(() => {
        return roles.filter((role) => {
            // Search filter
            const matchesSearch =
                role.name.toLowerCase().includes(searchValue.toLowerCase()) ||
                (role.description?.toLowerCase() || '').includes(searchValue.toLowerCase());

            // Role type filter
            const matchesRole =
                activeFilters.role === 'all' ||
                role.name.toLowerCase().includes(activeFilters.role.toLowerCase());

            // Level/Status filter (Mapping 'Active'/'Inactive' to level for demonstration if no status exists,
            // or just filtering by level if we change the filter to Level)
            const matchesStatus = activeFilters.status === 'all' || true;

            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [roles, searchValue, activeFilters]);

    const handleDeleteClick = (role: Role) => {
        setRoleToDelete(role);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (roleToDelete) {
            if (!roleToDelete.id) return;
            setIsDeleting(true);
            try {
                const result = await removeRole(roleToDelete.id);
                if (!result.success) throw new Error(result.error);
                onRefresh?.();
                setIsDeleteModalOpen(false);
                setRoleToDelete(null);
                toast({
                    title: t('deleteSuccess'),
                    description: t('deleteSuccessDesc'),
                    variant: 'success',
                });
            } catch (error: any) {
                toast({
                    title: t('deleteError'),
                    description: error.message || t('deleteErrorDesc'),
                    variant: 'destructive',
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleApply = () => {
        setActiveFilters(pendingFilters);
        setShowFilters(false);
    };

    const handleReset = () => {
        const defaultFilters = { role: 'all', status: 'all' };
        setPendingFilters(defaultFilters);
        setActiveFilters(defaultFilters);
    };

    const columns: ColumnConfig<Role>[] = [
        {
            key: 'name',
            label: t('tableName'),
            sortable: true,
            className: 'font-medium',
        },
        {
            key: 'level',
            label: t('tableRoleType'),
            sortable: true,
            render: (item) => (
                <span className="capitalize">
                    {t('level')} {item.level}
                </span>
            ),
        },
        {
            key: 'description',
            label: t('tableDescription'),
            render: (item) => (
                <span
                    className="truncate max-w-100 block text-muted-foreground"
                    title={item.description || ''}
                >
                    {item.description}
                </span>
            ),
        },
        {
            key: 'permissions',
            label: t('tablePermissions'),
            render: (item) => (
                <span>
                    {item.permissions?.length || 0} {t('permissions')}
                </span>
            ),
        },
    ];

    const handleRowClick = (item: Role) => {};

    const renderRowActions = (item: Role) => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit?.(item)} className="cursor-pointer">
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => handleDeleteClick(item)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('delete')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="space-y-4">
            <UniversalDataTable
                data={filteredRoles}
                columns={columns}
                isLoading={isLoading}
                enableSelection={true}
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                searchPlaceholder={t('searchPlaceholder')}
                showImport
                showExport
                importText={t('importBtn')}
                exportText={t('exportBtn')}
                currentPage={currentPage}
                totalPages={1}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                totalItems={filteredRoles.length}
                renderRowActions={renderRowActions}
                onRowClick={handleRowClick}
            />

            <ConfirmationModal
                open={isDeleteModalOpen}
                onOpenChange={setIsDeleteModalOpen}
                title={t('deleteConfirmTitle')}
                message={t('deleteConfirmMessage', { name: roleToDelete?.name || '' })}
                onConfirm={handleConfirmDelete}
                confirmLabel={t('delete')}
                cancelLabel={t('cancel')}
                isLoading={isDeleting}
                variant="danger"
            />
        </div>
    );
};

export default RolesTable;
