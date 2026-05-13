import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export function generateTransactionId(): string {
  return `TXN${Date.now()}${Math.random().toString(36).substring(2, 10)}`.toUpperCase();
}

export function generateInvoiceCode(): string {
  return `INV${Date.now()}${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'bg-green-500/20 text-green-400',
    pending: 'bg-yellow-500/20 text-yellow-400',
    holding: 'bg-blue-500/20 text-blue-400',
    released: 'bg-purple-500/20 text-purple-400',
    failed: 'bg-red-500/20 text-red-400',
    expired: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400';
}

export function getStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    success: '✅ Success',
    pending: '⏳ Pending',
    holding: '🕐 Holding',
    released: '✨ Released',
    failed: '❌ Failed',
    expired: '⌛ Expired',
  };
  return badges[status] || status;
}

export function truncate(str: string, length: number = 20): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
