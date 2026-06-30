import type { TFunction } from 'i18next';

const ERROR_CODE_KEYS: Record<string, string> = {
  DOCUMENT_NOT_FOUND: 'errors.documentNotFound',
  DOCUMENT_ACCESS_DENIED: 'errors.documentAccessDenied',
  DOCUMENT_CATEGORY_NOT_FOUND: 'errors.categoryNotFound',
  NO_FILE_UPLOADED: 'errors.noFileUploaded',
  DOCUMENT_FILE_TYPE_NOT_ALLOWED: 'errors.fileTypeNotAllowed',
  DOCUMENT_FILE_SIZE_EXCEEDED: 'errors.fileSizeExceeded',
  STORAGE_UNAVAILABLE: 'errors.storageUnavailable',
  STORAGE_ACCESS_DENIED: 'errors.storageUnavailable',
  STORAGE_CONFIG_ERROR: 'errors.storageUnavailable',
};

export function resolveDocumentError(error: string, t: TFunction): string {
  const trimmed = error?.trim() ?? '';
  if (!trimmed) {
    return t('errors.unexpected', { ns: 'document' });
  }

  const upper = trimmed.toUpperCase();
  for (const [code, key] of Object.entries(ERROR_CODE_KEYS)) {
    if (upper.includes(code)) {
      return t(key, { ns: 'document' });
    }
  }

  const lower = trimmed.toLowerCase();
  if (
    lower.includes('not authenticated') ||
    lower.includes('unauthorized') ||
    lower.includes('authentication')
  ) {
    return t('errors.unauthorized', { ns: 'document' });
  }

  if (
    lower.includes('failed to connect') ||
    lower.includes('econnrefused') ||
    lower.includes('network') ||
    lower.includes('fetch failed')
  ) {
    return t('errors.serviceUnavailable', { ns: 'document' });
  }

  if (lower.includes('expiry date is required')) {
    return t('errors.expiryRequired', { ns: 'document' });
  }

  if (trimmed.length < 120 && !/^[A-Z0-9_]+$/.test(trimmed)) {
    return trimmed;
  }

  return t('errors.unexpected', { ns: 'document' });
}
