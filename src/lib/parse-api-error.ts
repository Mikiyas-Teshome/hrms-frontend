const INFRASTRUCTURE_PATTERN =
  /(ENOTFOUND|ECONNREFUSED|getaddrinfo|ETIMEDOUT|EHOSTUNREACH|127\.0\.0\.1:\d+|localhost:\d+)/i;

const CODE_MESSAGES: Record<string, string> = {
  EXPIRY_DATE_REQUIRED: 'Please enter an expiry date for this document category.',
  ACTIVE_EMPLOYEE_CONTRACT_EXISTS:
    'This employee already has an active contract. Update the existing contract instead of assigning a new one.',
  EMPLOYEE_CONTRACT_NOT_DRAFT: 'Only draft contracts can be edited. Renew or assign a new contract instead.',
  EMPLOYEE_CONTRACT_NOT_ACTIVE: 'This action requires an active employee contract.',
  STORAGE_UNAVAILABLE: 'Upload failed. Check storage configuration or try again later.',
  STORAGE_CONFIG_ERROR: 'Upload failed. Check storage configuration or contact support.',
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  EMAIL_NOT_CONFIGURED: 'Email is not configured for this organization.',
};

export class ApiError extends Error {
  readonly code?: string;
  readonly statusCode?: number;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function parseJsonMessage(text: string): { message?: string; code?: string } | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) {
    return null;
  }
  try {
    const body = JSON.parse(trimmed) as {
      message?: string;
      code?: string;
      error?: string;
    };
    const message =
      typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : undefined;
    const code = typeof body.code === 'string' ? body.code : undefined;
    return message || code ? { message, code } : null;
  } catch {
    return null;
  }
}

function messageFromCode(code: string, fallback?: string): string {
  return CODE_MESSAGES[code] ?? fallback ?? code.replace(/_/g, ' ').toLowerCase();
}

function sanitizeInfrastructureMessage(message: string): string {
  if (INFRASTRUCTURE_PATTERN.test(message)) {
    return CODE_MESSAGES.STORAGE_UNAVAILABLE;
  }
  return message;
}

function extractGraphQlMessage(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const record = error as {
    message?: string;
    graphQLErrors?: Array<{ message?: string; extensions?: { code?: string } }>;
    response?: { errors?: Array<{ message?: string; extensions?: { code?: string } }> };
  };
  const gqlError = record.graphQLErrors?.[0] ?? record.response?.errors?.[0];
  if (gqlError?.extensions?.code) {
    return messageFromCode(gqlError.extensions.code, gqlError.message);
  }
  if (typeof gqlError?.message === 'string') {
    return gqlError.message;
  }
  if (typeof record.message === 'string' && record.message !== 'GraphQL Error') {
    return record.message;
  }
  return undefined;
}

export function getUserFacingErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    return error.code
      ? messageFromCode(error.code, error.message)
      : sanitizeInfrastructureMessage(error.message);
  }

  if (error instanceof Error) {
    const parsed = parseJsonMessage(error.message);
    if (parsed?.code) {
      return messageFromCode(parsed.code, parsed.message);
    }
    if (parsed?.message) {
      return sanitizeInfrastructureMessage(parsed.message);
    }
    const gql = extractGraphQlMessage(error);
    if (gql) {
      return sanitizeInfrastructureMessage(gql);
    }
    if (INFRASTRUCTURE_PATTERN.test(error.message)) {
      return CODE_MESSAGES.STORAGE_UNAVAILABLE;
    }
    if (error.message && !error.message.startsWith('{')) {
      return error.message;
    }
  }

  if (typeof error === 'string') {
    const parsed = parseJsonMessage(error);
    if (parsed?.code) {
      return messageFromCode(parsed.code, parsed.message);
    }
    if (parsed?.message) {
      return sanitizeInfrastructureMessage(parsed.message);
    }
    return sanitizeInfrastructureMessage(error);
  }

  return fallback;
}
