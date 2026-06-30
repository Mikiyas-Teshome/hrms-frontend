import { gqlRequest, GraphQLService, GqlRequestOptions } from './graphql-client';

export async function authGqlRequest<T, V extends object = object>(
    document: string,
    variables?: V,
    options?: GqlRequestOptions,
): Promise<T> {
    return gqlRequest<T, V>(GraphQLService.AUTH, document, variables, options);
}
