export type CurrencyCode = 'INR' | 'USD' | 'EUR';

export function formatCurrency(
  value: number,
  currency: CurrencyCode = 'INR',
  compact: boolean = false
): string {
  if (value === undefined || value === null || isNaN(value)) return '—';

  const symbol = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : '$';

  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `${symbol}${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `${symbol}${(value / 1_000_000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `${symbol}${(value / 1_000).toFixed(1)}K`;
    }
    return `${symbol}${value.toFixed(2)}`;
  }

  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number, includeSign: boolean = true): string {
  if (value === undefined || value === null || isNaN(value)) return '0.00%';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatNumber(value: number, decimals: number = 2): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}
