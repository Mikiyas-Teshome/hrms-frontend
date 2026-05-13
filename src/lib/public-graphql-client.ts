import { ClientError, GraphQLClient } from 'graphql-request';

const extractErrorMessage = (error: ClientError): string | undefined => {
    const errors = error.response.errors as
        | Array<{
              message?: string;
              extensions?: { originalError?: { message?: string | string[] } };
          }>
        | undefined;

    if (errors?.[0]) {
        const firstError = errors[0];
        const originalMsg = firstError.extensions?.originalError?.message;

        if (originalMsg) {
            return Array.isArray(originalMsg) ? originalMsg.join('; ') : originalMsg;
        }
        return firstError.message;
    }

    return undefined;
};

    export async function publicGqlRequest<T, V extends object = object>(
        document: string,
        variables?: V,
    ): Promise<T> {
        const url = process.env.AUTH_SERVICE_URL?.trim();

        if (!url) {
            throw new Error(
                'AUTH_SERVICE_URL or GRAPHQL_API_URL is not defined in environment variables.',
            );
        }

        const client = new GraphQLClient(url, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        try {
            const sanitizedVariables = variables
                ? JSON.parse(JSON.stringify(variables, (_, v) => (v === undefined ? null : v)))
                : undefined;

            const data = await client.request<T>(document, sanitizedVariables);
            return data;
        } catch (error) {
            if (error instanceof ClientError) {
                const errorMessage = extractErrorMessage(error);
                throw new Error(
                    errorMessage || `Request failed with status ${error.response.status}`,
                );
            }

            throw new Error('Failed to connect to the server.');
        }
    }
