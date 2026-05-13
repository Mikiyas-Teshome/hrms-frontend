import { gqlRequest, GraphQLService } from './graphql-client';

/**
 * Legacy wrapper for GraphQL requests to the AUTH service.
 * Now uses the centralized gqlRequest utility.
 */
export async function authGqlRequest<T, V extends object = object>(
    document: string,
    variables?: V,
): Promise<T> {
    return gqlRequest<T, V>(GraphQLService.AUTH, document, variables);
}
