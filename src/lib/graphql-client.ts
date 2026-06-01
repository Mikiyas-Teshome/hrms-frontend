import { ClientError, GraphQLClient } from 'graphql-request';
import { cookies } from 'next/headers';
import { AuthError } from './errors';
import { publicGqlRequest } from './public-graphql-client';
import { REFRESH_TOKEN_MUTATION } from '@/features/auth/auth.queries';
import { AuthResponse } from '@/features/auth/auth.types';

export enum GraphQLService {
    AUTH = 'AUTH',
    CORE_HR = 'CORE_HR',
    PAYROLL = 'PAYROLL',
    LEAVE = 'LEAVE',
    ATTENDANCE = 'ATTENDANCE',
    NOTIFICATION = 'NOTIFICATION',
    AUDIT_LOG = 'AUDIT_LOG',
    DOCUMENT = 'DOCUMENT',
    REPORTING = 'REPORTING',
    GATEWAY = 'GATEWAY',
}

const SERVICE_URL_MAP: Record<GraphQLService, string | undefined> = {
    [GraphQLService.AUTH]: process.env.AUTH_SERVICE_URL,
    [GraphQLService.CORE_HR]: process.env.CORE_HR_SERVICE_URL,
    [GraphQLService.PAYROLL]: process.env.PAYROLL_SERVICE_URL,
    [GraphQLService.LEAVE]: process.env.LEAVE_SERVICE_URL,
    [GraphQLService.ATTENDANCE]: process.env.ATTENDANCE_SERVICE_URL,
    [GraphQLService.NOTIFICATION]: process.env.NOTIFICATION_SERVICE_URL,
    [GraphQLService.AUDIT_LOG]: process.env.AUDIT_LOG_SERVICE_URL,
    [GraphQLService.DOCUMENT]: process.env.DOCUMENT_SERVICE_URL,
    [GraphQLService.REPORTING]: process.env.REPORTING_SERVICE_URL,
    [GraphQLService.GATEWAY]: process.env.API_GATEWAY_URL,
};

const AUTH_ERROR_PATTERNS = [
    'unauthorized',
    'not authenticated',
    'authentication required',
    'invalid token',
    'token expired',
    'jwt expired',
];

const isAuthError = (status: number, message?: string): boolean => {
    if (status === 401 || status === 403) {
        return true;
    }
    if (message) {
        const lowerMessage = message.toLowerCase();
        return AUTH_ERROR_PATTERNS.some((pattern) => lowerMessage.includes(pattern));
    }
    return false;
};

export type GqlRequestOptions = {
    mutableCookies?: boolean;
};

const persistAuthCookies = (
    cookieStore: Awaited<ReturnType<typeof cookies>>,
    result: AuthResponse,
    mutableCookies: boolean,
): void => {
    if (!mutableCookies) {
        return;
    }

    const maxAge = result.expiresIn ?? 60 * 60 * 24 * 7;

    cookieStore.set('hrms.accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge,
    });

    if (result.refreshToken) {
        cookieStore.set('hrms.refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    }
};

const clearAuthCookies = (
    cookieStore: Awaited<ReturnType<typeof cookies>>,
    mutableCookies: boolean,
): void => {
    if (!mutableCookies) {
        return;
    }

    cookieStore.delete('hrms.accessToken');
    cookieStore.delete('hrms.refreshToken');
};

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

/**
 * Attempts to refresh the access token using the stored refresh token cookie.
 */
async function attemptTokenRefresh(mutableCookies = true): Promise<string> {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('hrms.refreshToken')?.value;

    if (!refreshToken) {
        throw new AuthError('Session expired. Please log in again.');
    }

    try {
        const data = await publicGqlRequest<{ refreshToken: AuthResponse }>(
            REFRESH_TOKEN_MUTATION,
            { input: { refreshToken } },
        );

        const result = data.refreshToken;
        persistAuthCookies(cookieStore, result, mutableCookies);

        return result.accessToken;
    } catch {
        clearAuthCookies(await cookies(), mutableCookies);
        throw new AuthError('Session expired. Please log in again.');
    }
}

function buildClient(url: string, token: string): GraphQLClient {
    return new GraphQLClient(url, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function gqlRequest<T, V extends object = object>(
    service: GraphQLService,
    document: string,
    variables?: V,
    options?: GqlRequestOptions,
): Promise<T> {
    const url = SERVICE_URL_MAP[service];
    const mutableCookies = options?.mutableCookies ?? true;

    if (!url) {
        throw new Error(`Service URL for ${service} is not defined in environment variables.`);
    }

    const cookieStore = await cookies();
    let token = cookieStore.get('hrms.accessToken')?.value;

    if (!token) {
        const refreshToken = cookieStore.get('hrms.refreshToken')?.value;
        if (refreshToken) {
            token = await attemptTokenRefresh(mutableCookies);
        } else {
            throw new AuthError('Not authenticated. Please log in.');
        }
    }

    const sanitize = (vars: V | undefined) =>
        vars ? JSON.parse(JSON.stringify(vars, (_, v) => (v === undefined ? null : v))) : undefined;

    try {
        const data = await buildClient(url, token).request<T>(document, sanitize(variables));
        return data;
        } catch (error) {
        if (error instanceof ClientError) {
            const status = error.response.status;
            const errorMessage = extractErrorMessage(error);
            if (isAuthError(status, errorMessage)) {
                // Attempt silent token refresh then retry once
                try {
                    token = await attemptTokenRefresh(mutableCookies);
                    const data = await buildClient(url, token).request<T>(document, sanitize(variables));
                    return data;
                } catch (refreshError) {
                    if (refreshError instanceof AuthError) {
                        throw refreshError;
                    }
                    throw new AuthError('Authentication failed. Please log in again.');
                }
            }

            throw new Error(errorMessage || `Request failed with status ${status}`);
        }

        throw new Error('Failed to connect to the server.');
    }
}
