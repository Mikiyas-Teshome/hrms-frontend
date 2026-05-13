import getSymbolFromCurrency from 'currency-symbol-map'

export function getCurrencySymbol(currencyCode?: string | null): string {
  if (!currencyCode) return "$";
  return getSymbolFromCurrency(currencyCode) ?? currencyCode;
}

export function formatCurrency(value: number, currencyCode?: string | null): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol} ${value.toFixed(2)}`;
}
