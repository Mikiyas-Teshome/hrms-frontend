import type { TFunction } from 'i18next';

type TranslateFn = TFunction;

const ERROR_CODE_KEYS: Record<string, string> = {
  LEAVE_BALANCE_NOT_FOUND: 'leaveBalances.errors.notFound',
  INSUFFICIENT_LEAVE_BALANCE: 'leaveBalances.errors.insufficient',
  INVALID_LEAVE_BALANCE_DAYS: 'leaveBalances.errors.invalidDays',
};

export function mapLeaveBalanceErrorMessage(
  raw: string | undefined,
  t: TranslateFn,
): string {
  if (!raw) {
    return t('leaveBalances.errors.generic', { defaultValue: 'Unable to save changes. Please try again.' });
  }

  const upper = raw.toUpperCase();
  for (const [code, key] of Object.entries(ERROR_CODE_KEYS)) {
    if (upper.includes(code)) {
      return t(key, { defaultValue: getDefaultMessage(code) });
    }
  }

  return raw;
}

function getDefaultMessage(code: string): string {
  switch (code) {
    case 'LEAVE_BALANCE_NOT_FOUND':
      return 'This leave balance record could not be found.';
    case 'INSUFFICIENT_LEAVE_BALANCE':
      return 'Used days exceed the available balance.';
    case 'INVALID_LEAVE_BALANCE_DAYS':
      return 'Allocated, used, and carry-forward days must be valid non-negative numbers.';
    default:
      return 'Unable to save changes. Please try again.';
  }
}