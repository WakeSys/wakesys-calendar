/**
 * WakeSys Calendar - Main Entry Point
 *
 * Provides both modern class-based API and legacy global variable support.
 */

// Export main class
export { WakeSysCalendar } from './calendar';

// Export API client
export { WakeSysApiClient, jsonp } from './api';

// Export types
export type {
  WakeSysCalendarOptions,
  Translations,
  ColorMap,
  EventVisibilityMap,
  CalendarEvent,
  ApiEvent,
  ApiSlot,
  ApiOpeningTimesResponse,
  ApiTransportation,
  ApiEventType,
} from './types';

// Export utilities
export {
  formatDate,
  formatTime,
  parseDateTime,
  subtractHours,
  addDays,
  isSameDay,
  generateColor,
  createElement,
  toggleLoadingOverlay,
  closeModal,
} from './utils';

// ============================================================================
// Legacy Support
// ============================================================================

import { WakeSysCalendar } from './calendar';
import type { LegacyGlobals, Translations, ColorMap, EventVisibilityMap } from './types';

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
export function initWakeSysCalendarLegacy(
  elementId = 'wakesys_calendar'
): WakeSysCalendar | null {
  // Check for element
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Cannot find <div id='${elementId}'></div>`);
    return null;
  }

  // Read global variables
  const globals = window as unknown as Partial<LegacyGlobals>;

  // Validate required globals
  if (!globals.park_subdomain) {
    console.error(
      'WakeSysCalendar: park_subdomain is required. Please set it before initializing.'
    );
    return null;
  }

  // Build options from globals
  const options = {
    parkSubdomain: globals.park_subdomain,
    firstDayOfWeek: globals.park_first_day_of_week ?? 1,
    locale: globals.locale ?? 'en-gb',
    minOpeningHours: globals.park_min_opening_hours ?? '08:00:00',
    maxOpeningHours: globals.park_max_opening_hours ?? '20:00:00',
    timeAmPm: globals.park_time_am_or_pm ?? false,
    textColor: globals.textColor ?? '#000',
    calendarHeight: globals.calendarHeight ?? '800px',
    hideEventsIfNotBookable: globals.hideEventsIfNotBookable ?? false,
    headerToolbarLeft:
      globals.headerToolbarLeft ?? 'dayGridMonth,timeGridWeek,timeGridDay',
    translations: globals.translations,
    colors: globals.colors,
    eventsToShow: globals.eventsToShow,
  };

  // Create and render calendar
  const calendar = new WakeSysCalendar(`#${elementId}`, options);
  calendar.render();

  return calendar;
}

/**
 * Auto-initialize on DOMContentLoaded if legacy globals are present
 * and #wakesys_calendar element exists.
 *
 * This provides full backward compatibility with v1.x behavior.
 */
function autoInitLegacy(): void {
  const globals = window as unknown as Partial<LegacyGlobals>;

  // Only auto-init if:
  // 1. The wakesys_calendar element exists
  // 2. park_subdomain is defined (indicating legacy setup)
  // 3. FullCalendar is loaded
  const element = document.getElementById('wakesys_calendar');
  if (element && globals.park_subdomain && window.FullCalendar) {
    initWakeSysCalendarLegacy();
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitLegacy);
  } else {
    // DOM already loaded
    autoInitLegacy();
  }
}
