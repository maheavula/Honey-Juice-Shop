/**
 * Formats an integer value in paise into a clean Indian Rupee string (e.g. 24900 -> ₹249.00)
 */
export function formatCurrency(paise: number | undefined | null): string {
  if (paise === undefined || paise === null || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(rupees);
}

export function paiseToRupees(paise: number): number {
  return (paise || 0) / 100;
}

export function rupeesToPaise(rupees: number): number {
  return Math.round((rupees || 0) * 100);
}

export function formatDate(isoString: string | undefined): string {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

export function isValidHttpUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}
