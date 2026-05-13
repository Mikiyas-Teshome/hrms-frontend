import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    assignUserToOU,
    unassignUserFromOU,
    createOrganizationUnit,
    deactivateOrganizationUnit,
    getOrganizationHierarchy,
    getOrganizationNomenclature,
    getOrganizationUnit,
    updateOrganizationNomenclature,
    updateOrganizationUnit
} from '../organization.actions';
import {
    AssignUserOuInput,
    CreateOrganizationUnitInput,
    NomenclatureInput,
    UpdateOrganizationUnitInput
} from '../organization.types';

export const useAssignUserToOU = () => {
    return useMutation({
        mutationFn: async (input: AssignUserOuInput) => {
            const result = await assignUserToOU(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useUnassignUserFromOU = () => {
    return useMutation({
        mutationFn: async ({ ouId, userId }: { ouId: string; userId: string }) => {
            const result = await unassignUserFromOU(ouId, userId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
    });
};

export const useCreateOrganizationUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: CreateOrganizationUnitInput) => {
            const result = await createOrganizationUnit(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization', 'hierarchy'] });
        }
    });
};

export const useDeactivateOrganizationUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const result = await deactivateOrganizationUnit(id);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization', 'hierarchy'] });
        }
    });
};

export const useUpdateOrganizationUnit = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: UpdateOrganizationUnitInput) => {
            const result = await updateOrganizationUnit(input);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['organization', 'hierarchy'] });
            queryClient.invalidateQueries({ queryKey: ['organization', 'unit', variables.id] });
        }
    });
};

export const useUpdateOrganizationNomenclature = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ inputs, language }: { inputs: NomenclatureInput[]; language?: string }) => {
            const result = await updateOrganizationNomenclature(inputs, language);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organization', 'hierarchy'] });
            queryClient.invalidateQueries({ queryKey: ['organization', 'nomenclature'] });
        }
    });
};

// Query Hooks

export const useOrganizationHierarchy = () => {
    return useQuery({
        queryKey: ['organization', 'hierarchy'],
        queryFn: async () => {
            const response = await getOrganizationHierarchy();
            return response;
        },
        staleTime: 0,
        refetchOnMount: 'always',
    });
};

export const useCompanyOptions = () => {
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();
    
    const companies = useMemo(() => {
        if (!hierarchy?.[0]?.children) return [];
        return hierarchy[0].children;
    }, [hierarchy]);

    return {
        companies,
        isLoading
    };
};

export const useSelectedCompany = (companyId?: string) => {
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();
    
    const company = useMemo(() => {
        if (!hierarchy || !companyId) return null;

        const findCompany = (units: any[]): any => {
            for (const unit of units) {
                if (unit.id === companyId) return unit;
                if (unit.children) {
                    const found = findCompany(unit.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return findCompany(hierarchy);
    }, [hierarchy, companyId]);

    return {
        company,
        isLoading
    };
};

export const useOrganizationNomenclature = (language: string = 'en') => {
    return useQuery({
        queryKey: ['organization', 'nomenclature', language],
        queryFn: () => getOrganizationNomenclature(language),
    });
};

export const useOrganizationUnit = (id: string) => {
    return useQuery({
        queryKey: ['organization', 'unit', id],
        queryFn: () => getOrganizationUnit(id),
        enabled: !!id,
    });
};

export const useOrganizationLeafOptions = () => {
    const { data: hierarchy, isLoading } = useOrganizationHierarchy();

    const leafOptions = useMemo(() => {
        if (!hierarchy) return [];

        const getLeafUnits = (units: any[]): { id: string; name: string }[] => {
            let leaves: { id: string; name: string }[] = [];
            units.forEach((unit) => {
                if (!unit.children || unit.children.length === 0) {
                    leaves.push({ id: unit.id, name: unit.name });
                } else {
                    leaves = leaves.concat(getLeafUnits(unit.children));
                }
            });
            return leaves;
        };

        return getLeafUnits(hierarchy);
    }, [hierarchy]);

    return {
        leafOptions,
        isLoading
    };
};
