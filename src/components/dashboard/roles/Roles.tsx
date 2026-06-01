'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import RolesTable from './RolesTable';
import CreateRoleSheet from './CreateRoleSheet';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { fetchRoles } from '@/features/roles/roles.actions';
import { Role } from '@/features/roles/roles.types';
import { useEffect } from 'react';
import { usePermissions } from '@/features/auth/hooks/usePermissions';

const RolesPage = () => {
    const { t } = useTranslation('roles');
    useAuth();
    const { hasPermission } = usePermissions();
    const canCreateRole = hasPermission('roles:create');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

    useEffect(() => {
        const loadRoles = async () => {
            setIsLoading(true);
            const fetchedRoles = await fetchRoles();
            setRoles(fetchedRoles);
            setIsLoading(false);
        };
        loadRoles();
    }, []);

    const handleAddRolesClick = () => {
        if (!canCreateRole) return;
        setRoleToEdit(null);
        setIsSheetOpen(true);
    };

    const canUpdateRole = hasPermission('roles:update');

    const handleEditRoleClick = (role: Role) => {
        if (!canUpdateRole) return;
        setRoleToEdit(role);
        setIsSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl text-foreground font-bold leading-8">{t('title')}</h2>
                {canCreateRole && (
                    <Button
                        onClick={handleAddRolesClick}
                        className="flex items-center gap-2 w-fit px-4 py-2 h-9 rounded-[8px] cursor-pointer bg-primary hover:bg-primary/90 text-white border-0 shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>{t('addRoles')}</span>
                    </Button>
                )}
            </div>
            <RolesTable 
                roles={roles} 
                isLoading={isLoading} 
                onRefresh={() => {
                    fetchRoles().then(setRoles);
                }} 
                onEdit={handleEditRoleClick}
            />
            
            <CreateRoleSheet 
                open={isSheetOpen} 
                onOpenChange={setIsSheetOpen} 
                role={roleToEdit}
                onSuccess={() => {
                    fetchRoles().then(setRoles);
                }}
            />
        </div>
    );
};

export default RolesPage;
