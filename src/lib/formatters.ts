import { BUSINESS_CURRENCY, BUSINESS_LOCALE, BUSINESS_TIMEZONE } from "@/constants/app";

export function formatCurrency(value: number, options: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}) { return new Intl.NumberFormat(BUSINESS_LOCALE, { style: "currency", currency: BUSINESS_CURRENCY, minimumFractionDigits: options.minimumFractionDigits ?? 2, maximumFractionDigits: options.maximumFractionDigits ?? 2 }).format(value); }
export function formatNumber(value: number, maximumFractionDigits = 2) { return new Intl.NumberFormat(BUSINESS_LOCALE, { maximumFractionDigits }).format(value); }
export function formatQuantity(value: number, unit?: string) { const formatted = formatNumber(value, 3); return unit ? `${formatted} ${unit}` : formatted; }
export function formatPercentage(value: number, maximumFractionDigits = 1) { return new Intl.NumberFormat(BUSINESS_LOCALE, { style: "percent", maximumFractionDigits }).format(value / 100); }
export function formatDate(value: Date | string) { return new Intl.DateTimeFormat(BUSINESS_LOCALE, { day: "numeric", month: "short", year: "numeric", timeZone: BUSINESS_TIMEZONE }).format(new Date(value)); }
export function formatDateTime(value: Date | string) { return new Intl.DateTimeFormat(BUSINESS_LOCALE, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: BUSINESS_TIMEZONE }).format(new Date(value)); }
