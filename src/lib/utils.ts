import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-FJ', {
    style: 'currency',
    currency: 'FJD',
  }).format(amount || 0)
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-FJ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date))
}

export const CITY_LABELS: Record<string, string> = {
  suva: 'Suva',
  nausori: 'Nausori',
  nadi: 'Nadi',
  lautoka: 'Lautoka',
  labasa: 'Labasa',
  savusavu: 'Savusavu',
  sigatoka: 'Sigatoka',
  ba: 'Ba',
  tavua: 'Tavua',
  rakiraki: 'Rakiraki',
  korovou: 'Korovou',
  navua: 'Navua',
  levuka: 'Levuka',
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  packed: 'bg-indigo-100 text-indigo-800',
  ready_for_delivery: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
