'use server';

import { gqlRequest, GraphQLService } from '@/lib/graphql-client';
import { ActionResult, safeAction } from '@/lib/safe-action';
import { revalidatePath } from 'next/cache';
import {
    ASSIGN_USER_TO_OU_MUTATION,
    UNASSIGN_USER_FROM_OU_MUTATION,
    CREATE_ORGANIZATION_UNIT_MUTATION,
    DEACTIVATE_ORGANIZATION_UNIT_MUTATION,
    UPDATE_ORGANIZATION_UNIT_MUTATION,
    UPDATE_ORGANIZATION_NOMENCLATURE_MUTATION,
    GET_ORGANIZATION_HIERARCHY_QUERY,
    GET_ORGANIZATION_NOMENCLATURE_QUERY,
    GET_ORGANIZATION_UNIT_QUERY
} from './organization.queries';
import {
    AssignUserOuInput,
    CreateOrganizationUnitInput,
    NomenclatureInput,
    OrganizationLabelType,
    OrganizationUnitType,
    UpdateOrganizationUnitInput
} from './organization.types';

export async function assignUserToOU(input: AssignUserOuInput): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ assignUserToOU: boolean }>(
            GraphQLService.AUTH,
            ASSIGN_USER_TO_OU_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/organization');
        return data.assignUserToOU;
    });
}

export async function unassignUserFromOU(ouId: string, userId: string): Promise<ActionResult<boolean>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ unassignUserFromOU: boolean }>(
            GraphQLService.AUTH,
            UNASSIGN_USER_FROM_OU_MUTATION,
            { ouId, userId }
        );
        revalidatePath('/dashboard/organization');
        return data.unassignUserFromOU;
    });
}

export async function createOrganizationUnit(input: CreateOrganizationUnitInput): Promise<ActionResult<OrganizationUnitType>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ createOrganizationUnit: OrganizationUnitType }>(
            GraphQLService.AUTH,
            CREATE_ORGANIZATION_UNIT_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/organization');
        return data.createOrganizationUnit;
    });
}

export async function deactivateOrganizationUnit(id: string): Promise<ActionResult<OrganizationUnitType>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ deactivateOrganizationUnit: OrganizationUnitType }>(
            GraphQLService.AUTH,
            DEACTIVATE_ORGANIZATION_UNIT_MUTATION,
            { id }
        );
        revalidatePath('/dashboard/organization');
        return data.deactivateOrganizationUnit;
    });
}

export async function updateOrganizationUnit(input: UpdateOrganizationUnitInput): Promise<ActionResult<OrganizationUnitType>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateOrganizationUnit: OrganizationUnitType }>(
            GraphQLService.AUTH,
            UPDATE_ORGANIZATION_UNIT_MUTATION,
            { input }
        );
        revalidatePath('/dashboard/organization');
        return data.updateOrganizationUnit;
    });
}

export async function updateOrganizationNomenclature(inputs: NomenclatureInput[], language: string = 'en'): Promise<ActionResult<OrganizationLabelType[]>> {
    return safeAction(async () => {
        const data = await gqlRequest<{ updateOrganizationNomenclature: OrganizationLabelType[] }>(
            GraphQLService.AUTH,
            UPDATE_ORGANIZATION_NOMENCLATURE_MUTATION,
            { inputs, language }
        );
        revalidatePath('/dashboard/settings');
        return data.updateOrganizationNomenclature;
    });
}

export async function getOrganizationHierarchy(): Promise<OrganizationUnitType[]> {
    const data = await gqlRequest<{ getOrganizationHierarchy: OrganizationUnitType[] }>(
        GraphQLService.AUTH,
        GET_ORGANIZATION_HIERARCHY_QUERY
    );
    return data.getOrganizationHierarchy;
}

export async function getOrganizationNomenclature(language: string = 'en'): Promise<OrganizationLabelType[]> {
    const data = await gqlRequest<{ getOrganizationNomenclature: OrganizationLabelType[] }>(
        GraphQLService.AUTH,
        GET_ORGANIZATION_NOMENCLATURE_QUERY,
        { language }
    );
    return data.getOrganizationNomenclature;
}

export async function getOrganizationUnit(id: string): Promise<OrganizationUnitType> {
    const data = await gqlRequest<{ getOrganizationUnit: OrganizationUnitType }>(
        GraphQLService.AUTH,
        GET_ORGANIZATION_UNIT_QUERY,
        { id }
    );
    return data.getOrganizationUnit;
}
