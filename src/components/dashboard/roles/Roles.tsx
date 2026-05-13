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

const RolesPage = () => {
    const { t } = useTranslation('roles');
    const { user } = useAuth();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);

    useEffect(() => {
        const loadRoles = async () => {
            if (user?.companyId) {
                setIsLoading(true);
                const fetchedRoles = await fetchRoles(user.companyId);
                setRoles(fetchedRoles);
                setIsLoading(false);
            }
        };
        loadRoles();
    }, [user?.companyId]);

    const handleAddRolesClick = () => {
        setRoleToEdit(null);
        setIsSheetOpen(true);
    };

    const handleEditRoleClick = (role: Role) => {
        setRoleToEdit(role);
        setIsSheetOpen(true);
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl text-foreground font-bold leading-8">{t('title')}</h2>
                <Button
                    onClick={handleAddRolesClick}
                    className="flex items-center gap-2 w-fit px-4 py-2 h-9 rounded-[8px] cursor-pointer bg-primary hover:bg-primary/90 text-white border-0 shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    <span>{t('addRoles')}</span>
                </Button>
            </div>
            <RolesTable 
                roles={roles} 
                isLoading={isLoading} 
                onRefresh={() => {
                    if (user?.companyId) fetchRoles(user.companyId).then(setRoles);
                }} 
                onEdit={handleEditRoleClick}
            />
            
            <CreateRoleSheet 
                open={isSheetOpen} 
                onOpenChange={setIsSheetOpen} 
                role={roleToEdit}
                onSuccess={() => {
                    if (user?.companyId) fetchRoles(user.companyId).then(setRoles);
                }}
            />
        </div>
    );
};

export default RolesPage;
