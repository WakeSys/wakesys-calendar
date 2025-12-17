/**
 * Utility functions for WakeSys Calendar
 */
import type { Translations } from './types';
/**
 * Format a Date to YYYY-MM-DD string
 */
export declare function formatDate(date: Date): string;
/**
 * Format a Date to HH:mm string
 */
export declare function formatTime(date: Date, hour12?: boolean): string;
/**
 * Parse a datetime string (YYYY-MM-DD HH:mm:ss) to Date
 */
export declare function parseDateTime(str: string): Date;
/**
 * Subtract hours from a Date, returning a new Date
 */
export declare function subtractHours(date: Date, hours: number): Date;
/**
 * Add days to a Date, returning a new Date
 */
export declare function addDays(date: Date, days: number): Date;
/**
 * Check if two dates are on the same day
 */
export declare function isSameDay(date1: Date, date2: Date): boolean;
/**
 * Check if date1 is before or equal to date2
 */
export declare function isBeforeOrEqual(date1: Date, date2: Date): boolean;
/**
 * Darken a hex color by a percentage
 */
export declare function darkenColor(hex: string, percent: number): string;
/**
 * Generate a color based on a string (for automatic event coloring)
 */
export declare function generateColor(eventName: string): string;
/**
 * Create an HTML element with optional class and content
 */
export declare function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, innerHTML?: string): HTMLElementTagNameMap[K];
/**
 * Toggle loading overlay visibility
 */
export declare function toggleLoadingOverlay(calendarEl: HTMLElement, show: boolean, translations: Translations): void;
/**
 * Show the generated configuration modal
 */
export declare function showGeneratedArrayModal(arrayString: string): void;
/**
 * Close the generated configuration modal
 */
export declare function closeModal(): void;
//# sourceMappingURL=utils.d.ts.map