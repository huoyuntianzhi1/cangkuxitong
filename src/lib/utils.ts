import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes safely
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as CNY currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a given date string to an easily readable format for users
 */
import { format, parseISO } from "date-fns";

export function formatDateTime(isoString: string): string {
  if (!isoString) return '';
  return format(parseISO(isoString), 'yyyy-MM-dd HH:mm');
}
