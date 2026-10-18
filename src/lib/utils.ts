import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Deterministic date-time formatter that produces identical output
 * on both server and client to prevent SSR hydration mismatches.
 */
export function formatDateHungarian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  
  if (typeof dateInput === 'string') {
    // If string matches YYYY-MM-DDTHH:mm pattern, parse directly to preserve exact timestamp deterministically
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (match) {
      return `${match[1]}. ${match[2]}. ${match[3]}. ${match[4]}:${match[5]}`;
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}. ${month}. ${day}. ${hours}:${minutes}`;
}

/**
 * Deterministic date-only formatter (YYYY. MM. DD.)
 */
export function formatDateOnlyHungarian(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';

  if (typeof dateInput === 'string') {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}. ${match[2]}. ${match[3]}.`;
    }
  }

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return String(dateInput);

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');

  return `${year}. ${month}. ${day}.`;
}

/**
 * Deterministic number formatter with spaces (Hungarian standard: 10 000)
 * avoiding SSR hydration mismatches from locale-dependent toLocaleString()
 */
export function formatNumber(val: number | undefined | null): string {
  if (val == null || isNaN(val)) return '0';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}
