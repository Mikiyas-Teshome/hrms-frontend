import getSymbolFromCurrency from 'currency-symbol-map'

export function getCurrencySymbol(currencyCode?: string | null): string {
  if (!currencyCode) return "$";
  return getSymbolFromCurrency(currencyCode) ?? currencyCode;
}

export function formatCurrency(value: number, currencyCode?: string | null): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${value.toFixed(2)}`;
}

export function formatIntlCurrency(
  value: number,
  currencyCode?: string | null,
  options?: Intl.NumberFormatOptions,
): string {
  const code = currencyCode || 'USD';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value);
}
