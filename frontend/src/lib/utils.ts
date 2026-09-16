export { cn } from 'cn';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function calculateSI(principal: number, tenureDays: number, rate: number = 12): number {
  return (principal * rate * tenureDays) / (365 * 100);
}

export function calculateTotal(principal: number, tenureDays: number, rate: number = 12): number {
  return principal + calculateSI(principal, tenureDays, rate);
}
