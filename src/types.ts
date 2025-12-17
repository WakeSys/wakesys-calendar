/**
 * WakeSys Calendar Type Definitions
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Translation strings for the calendar UI
 */
export interface Translations {
  /** Public riding hours label */
  public_opening_hours: string;
  /** Slot label */
  slot: string;
  /** Bookable status text */
  bookable: string;
  /** Booked out status text */
  booked_out: string;
  /** Not available status text */
  not_available: string;
  /** Currency symbol */
  currency: string;
  /** Fully booked text */
  full_booked: string;
  /** Slot price text */
  slotPrice: string;
  /** Loading text */
  loading: string;
}

/**
 * Color mapping for event types
 * Keys are event type IDs or 'Slot' for regular slots
 */
export type ColorMap = Record<string, string>;

/**
 * Visibility settings for event types
 * Keys are event type IDs or 'Slot' for regular slots
 */
export type EventVisibilityMap = Record<string, boolean>;

/**
 * Main configuration options for WakeSysCalendar
 */
export interface WakeSysCalendarOptions {
  /** Your WakeSys park subdomain */
  parkSubdomain: string;
  /** First day of week (0 = Sunday, 1 = Monday) */
  firstDayOfWeek?: number;
  /** Calendar locale (de, fr, it, es, en-gb) */
  locale?: string;
  /** Earliest opening time (HH:mm:ss) */
  minOpeningHours?: string;
  /** Latest closing time (HH:mm:ss) */
  maxOpeningHours?: string;
  /** Use AM/PM time format */
  timeAmPm?: boolean;
  /** Event text color */
  textColor?: string;
  /** Calendar height (e.g., '800px' or 'auto') */
  calendarHeight?: string;
  /** Hide events that are not bookable */
  hideEventsIfNotBookable?: boolean;
  /** Header toolbar buttons */
  headerToolbarLeft?: string;
  /** Translation strings */
  translations?: Translations;
  /** Color mapping for event types */
  colors?: ColorMap;
  /** Visibility settings for event types */
  eventsToShow?: EventVisibilityMap;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Internal resolved configuration with defaults applied
 */
export interface ResolvedConfig extends Required<WakeSysCalendarOptions> {
  endpoint: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Event data from the events API
 */
export interface ApiEvent {
  ID_event: string;
  FID_event_type: string;
  col_name: string;
  col_start: string;
  col_end: string;
  col_description: string;
  col_seats: string;
  col_price: string;
  col_hours_in_advance: string;
  col_is_bookable: 'yes' | 'no';
  col_checkin_time: string;
  col_booked_seats: string;
  col_link: string;
  Fcol_boat_cable_name: string;
}

/**
 * Slot data from the heatmap API
 */
export interface ApiSlot {
  slot_time_start: string;
  slot_time_end: string;
  Fcol_boat_cable_name: string;
  col_number_of_bookings: string;
  total: string;
}

/**
 * Opening times data from the opening_times API
 */
export interface ApiOpeningTime {
  opening_times: string | 'closed';
  transportation_name: string;
}

/**
 * Opening times API response (keyed by date)
 */
export type ApiOpeningTimesResponse = Record<string, ApiOpeningTime>;

/**
 * Transportation data from the list_transportations API
 */
export interface ApiTransportation {
  ID_transportation: string;
  Fcol_boat_cable_name: string;
  col_option_heatmap: 'yes' | 'no';
  col_session_view: string;
}

/**
 * Event type from the list_events API
 */
export interface ApiEventType {
  ID_event: string;
  col_name: string;
}

// ============================================================================
// Internal Event Types (for FullCalendar)
// ============================================================================

/**
 * Extended properties for calendar events
 */
export interface CalendarEventExtendedProps {
  cableName: string;
  description: string;
  seats: number | null;
  price: string;
  hoursInAdvance: number;
  isBookable: boolean;
  checkinTime: string;
  bookedSeats: number | null;
  col_hours_in_advance?: number;
}

/**
 * Calendar event object for FullCalendar
 */
export interface CalendarEvent {
  title: string;
  classNames: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  textColor: string;
  url?: string;
  allDay: boolean;
  extendedProps: CalendarEventExtendedProps;
}

// ============================================================================
// FullCalendar Types (minimal declarations for external library)
// ============================================================================

/**
 * FullCalendar fetch info
 */
export interface FetchInfo {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  timeZone: string;
}

/**
 * FullCalendar event info for event content callback
 */
export interface EventContentArg {
  event: {
    title: string;
    start: Date | null;
    end: Date | null;
    allDay: boolean;
    url: string;
    extendedProps: CalendarEventExtendedProps;
  };
}

/**
 * FullCalendar event click info
 */
export interface EventClickArg {
  event: {
    url: string;
  };
  jsEvent: MouseEvent;
}

/**
 * FullCalendar Calendar class interface
 */
export interface FullCalendarInstance {
  render(): void;
  refetchEvents(): void;
  destroy(): void;
}

/**
 * FullCalendar options
 */
export interface FullCalendarOptions {
  timeZone: string;
  height: string;
  slotEventOverlap: number;
  initialView: string;
  firstDay: number;
  locale: string;
  headerToolbar: {
    right: string;
    center: string;
    left: string;
  };
  slotMinTime: string;
  slotMaxTime: string;
  slotLabelInterval: { hours: number };
  slotLabelFormat: { hour: string; hour12: boolean };
  events: (
    fetchInfo: FetchInfo,
    successCallback: (events: CalendarEvent[]) => void,
    failureCallback: (error: Error) => void
  ) => void;
  loading: (isLoading: boolean) => void;
  datesSet: (info: { start: Date; end: Date }) => void;
  eventContent: (info: EventContentArg) => { domNodes: HTMLElement[] };
  eventClick: (info: EventClickArg) => void;
  displayEventTime: boolean;
  displayEventEnd: boolean;
  defaultAllDay: boolean;
}

// ============================================================================
// Legacy Support Types
// ============================================================================

/**
 * Legacy global configuration (for backward compatibility)
 */
export interface LegacyGlobals {
  park_subdomain: string;
  park_first_day_of_week: number;
  locale: string;
  park_min_opening_hours: string;
  park_max_opening_hours: string;
  park_time_am_or_pm: boolean;
  textColor: string;
  calendarHeight: string;
  hideEventsIfNotBookable: boolean;
  headerToolbarLeft: string;
  translations: Translations;
  colors: ColorMap;
  eventsToShow: EventVisibilityMap;
  forceEventsConfigurationGenerator?: boolean;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * JSONP request parameters
 */
export type JsonpParams = Record<string, string>;

/**
 * Tagged API request result
 */
export interface TaggedApiResult<T> {
  data: T;
  type: 'eventsAPI' | 'slotsAPI' | 'OpeningTimesAPI';
}

// Declare FullCalendar on window for TypeScript
declare global {
  interface Window {
    FullCalendar: {
      Calendar: new (
        el: HTMLElement,
        options: FullCalendarOptions
      ) => FullCalendarInstance;
    };
    WakeSysCalendar: typeof import('./calendar').WakeSysCalendar;
    initWakeSysCalendarLegacy: typeof import('./index').initWakeSysCalendarLegacy;
  }
}
