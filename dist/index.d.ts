/**
 * WakeSys Calendar - Main Entry Point
 *
 * Provides both modern class-based API and legacy global variable support.
 */
export { WakeSysCalendar } from './calendar';
export { WakeSysApiClient, jsonp } from './api';
export type { WakeSysCalendarOptions, Translations, ColorMap, EventVisibilityMap, CalendarEvent, ApiEvent, ApiSlot, ApiOpeningTimesResponse, ApiTransportation, ApiEventType, } from './types';
export { formatDate, formatTime, parseDateTime, subtractHours, addDays, isSameDay, generateColor, darkenColor, createElement, toggleLoadingOverlay, closeModal, } from './utils';
import { WakeSysCalendar } from './calendar';
/**
 * Initialize WakeSysCalendar using legacy global variables.
 *
 * This function provides backward compatibility with the v1.x API where
 * configuration was done via global variables.
 *
 * @param elementId - The ID of the calendar container element (default: 'wakesys_calendar')
 * @returns The WakeSysCalendar instance
 *
 * @example
 * ```html
 * <script>
 *   var park_subdomain = 'test-wasserski-wedau';
 *   var locale = 'de';
 *   var translations = { ... };
 *   var colors = { ... };
 *   var eventsToShow = { ... };
 * </script>
 * <script src="wakesyscalendar.js"></script>
 * <script>
 *   document.addEventListener('DOMContentLoaded', function() {
 *     initWakeSysCalendarLegacy();
 *   });
 * </script>
 * ```
 */
export declare function initWakeSysCalendarLegacy(elementId?: string): WakeSysCalendar | null;
//# sourceMappingURL=index.d.ts.map