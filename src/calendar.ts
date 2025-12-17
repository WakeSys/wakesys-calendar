/**
 * Main WakeSys Calendar Class
 */

import type {
  WakeSysCalendarOptions,
  ResolvedConfig,
  Translations,
  CalendarEvent,
  CalendarEventExtendedProps,
  FetchInfo,
  EventContentArg,
  EventClickArg,
  FullCalendarInstance,
  ApiEvent,
  ApiSlot,
  ApiOpeningTimesResponse,
  ApiTransportation,
  ColorMap,
  EventVisibilityMap,
} from './types';
import { WakeSysApiClient, taggedRequest, type TaggedResponse, type ApiRequestType } from './api';
import {
  formatDate,
  formatTime,
  parseDateTime,
  subtractHours,
  addDays,
  isSameDay,
  isBeforeOrEqual,
  generateColor,
  createElement,
  toggleLoadingOverlay,
  showGeneratedArrayModal,
} from './utils';

// ============================================================================
// Default Configuration
// ============================================================================

const DEFAULT_TRANSLATIONS: Translations = {
  public_opening_hours: 'Public Hours',
  slot: 'Slot',
  bookable: 'Available',
  booked_out: 'Booked Out',
  not_available: 'Not Available',
  currency: '€',
  full_booked: 'Fully Booked',
  slotPrice: 'from €20',
  loading: 'Loading',
};

const DEFAULT_OPTIONS: Omit<Required<WakeSysCalendarOptions>, 'parkSubdomain'> = {
  firstDayOfWeek: 1,
  locale: 'en-gb',
  minOpeningHours: '08:00:00',
  maxOpeningHours: '20:00:00',
  timeAmPm: false,
  textColor: '#000',
  calendarHeight: '800px',
  hideEventsIfNotBookable: false,
  headerToolbarLeft: 'dayGridMonth,timeGridWeek,timeGridDay',
  translations: DEFAULT_TRANSLATIONS,
  colors: {},
  eventsToShow: {},
  debug: false,
};

// ============================================================================
// WakeSys Calendar Class
// ============================================================================

export class WakeSysCalendar {
  private config: ResolvedConfig;
  private calendarEl: HTMLElement;
  private calendar: FullCalendarInstance | null = null;
  private apiClient: WakeSysApiClient;

  constructor(
    selector: string | HTMLElement,
    options: WakeSysCalendarOptions
  ) {
    // Resolve element
    if (typeof selector === 'string') {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) {
        throw new Error(`Cannot find element: ${selector}`);
      }
      this.calendarEl = el;
    } else {
      this.calendarEl = selector;
    }

    // Merge options with defaults
    this.config = this.resolveConfig(options);

    // Initialize API client
    this.apiClient = new WakeSysApiClient(this.config.parkSubdomain);

    this.log('WakeSysCalendar initialized with config:', this.config);
  }

  /**
   * Resolve configuration by merging with defaults
   */
  private resolveConfig(options: WakeSysCalendarOptions): ResolvedConfig {
    const translations = {
      ...DEFAULT_TRANSLATIONS,
      ...options.translations,
    };

    return {
      ...DEFAULT_OPTIONS,
      ...options,
      translations,
      endpoint: `https://${options.parkSubdomain}.wakesys.com`,
    };
  }

  /**
   * Log debug messages if debug mode is enabled
   */
  private log(...args: unknown[]): void {
    if (this.config.debug) {
      console.log('[WakeSysCalendar]', ...args);
    }
  }

  /**
   * Render the calendar
   */
  render(): void {
    // Check if configuration needs to be generated
    const colorsEmpty =
      !this.config.colors || Object.keys(this.config.colors).length === 0;
    const eventsEmpty =
      !this.config.eventsToShow ||
      Object.keys(this.config.eventsToShow).length === 0;

    if (colorsEmpty || eventsEmpty) {
      this.generateConfiguration();
    }

    // Show loading overlay
    toggleLoadingOverlay(this.calendarEl, true, this.config.translations);

    // Check for FullCalendar
    if (!window.FullCalendar) {
      console.error(
        'FullCalendar is not loaded. Please include FullCalendar before WakeSysCalendar.'
      );
      return;
    }

    // Create FullCalendar instance
    this.calendar = new window.FullCalendar.Calendar(this.calendarEl, {
      timeZone: 'local',
      height: this.config.calendarHeight,
      slotEventOverlap: 0,
      initialView: window.innerWidth < 765 ? 'timeGridDay' : 'timeGridWeek',
      firstDay: this.config.firstDayOfWeek,
      locale: this.config.locale,
      headerToolbar: {
        right: 'prev,next today',
        center: 'title',
        left: this.config.headerToolbarLeft,
      },
      slotMinTime: this.config.minOpeningHours,
      slotMaxTime: this.config.maxOpeningHours,
      slotLabelInterval: { hours: 1 },
      slotLabelFormat: { hour: 'numeric', hour12: this.config.timeAmPm },
      events: this.fetchCalendarEvents.bind(this),
      loading: (isLoading: boolean) => {
        toggleLoadingOverlay(
          this.calendarEl,
          isLoading,
          this.config.translations
        );
      },
      datesSet: () => {
        this.calendar?.refetchEvents();
      },
      eventContent: this.renderEventContent.bind(this),
      eventClick: this.handleEventClick.bind(this),
      displayEventTime: false,
      displayEventEnd: false,
      defaultAllDay: false,
    });

    this.calendar.render();
  }

  /**
   * Destroy the calendar instance
   */
  destroy(): void {
    this.calendar?.destroy();
    this.calendar = null;
  }

  /**
   * Fetch calendar events (called by FullCalendar)
   */
  private async fetchCalendarEvents(
    fetchInfo: FetchInfo,
    successCallback: (events: CalendarEvent[]) => void,
    failureCallback: (error: Error) => void
  ): Promise<void> {
    try {
      const startDate = formatDate(fetchInfo.start);
      const events: CalendarEvent[] = [];

      // Fetch events from the events API
      const eventsPromise = taggedRequest(
        this.apiClient.fetchEvents(startDate),
        'eventsAPI'
      );

      // Fetch transportations first
      const transportations = await this.apiClient.fetchTransportations();
      this.log('Transportations loaded:', transportations);

      // Build additional requests based on transportations
      const additionalRequests: Promise<TaggedResponse<unknown>>[] = [
        eventsPromise,
      ];

      for (const transportation of transportations) {
        if (
          transportation.col_option_heatmap === 'yes' &&
          transportation.col_session_view !== '5mast'
        ) {
          // Fetch slots for this transportation
          additionalRequests.push(
            taggedRequest(
              this.apiClient.fetchSlots(
                startDate,
                transportation.Fcol_boat_cable_name
              ),
              'slotsAPI'
            )
          );
        } else if (transportation.col_session_view !== 'events_only') {
          // Fetch opening times for this transportation
          additionalRequests.push(
            taggedRequest(
              this.apiClient.fetchOpeningTimes(
                startDate,
                transportation.Fcol_boat_cable_name
              ),
              'OpeningTimesAPI'
            )
          );
        }
      }

      // Execute all requests in parallel
      const responses = await Promise.all(additionalRequests);

      // Process responses
      for (const response of responses) {
        this.log(`Processing ${response.type} response:`, response.data);

        switch (response.type) {
          case 'eventsAPI':
            this.processEventsApiResponse(
              response.data as ApiEvent[] | 0,
              events
            );
            break;
          case 'slotsAPI':
            this.processSlotsApiResponse(
              response.data as ApiSlot[] | 0,
              events
            );
            break;
          case 'OpeningTimesAPI':
            this.processOpeningTimesApiResponse(
              response.data as ApiOpeningTimesResponse,
              events
            );
            break;
        }
      }

      successCallback(events);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      failureCallback(error as Error);
    }
  }

  /**
   * Process events API response
   */
  private processEventsApiResponse(
    data: ApiEvent[] | 0,
    events: CalendarEvent[]
  ): void {
    this.log('Processing events API response:', data);

    if (data === 0) {
      this.log('No events found');
      return;
    }

    if (!Array.isArray(data)) {
      console.error('Expected array for events response, got:', data);
      return;
    }

    const currentTime = new Date();

    for (const event of data) {
      // Check if this event type should be shown
      if (this.config.eventsToShow[event.FID_event_type] === false) {
        continue;
      }

      const start = parseDateTime(event.col_start);
      const end = parseDateTime(event.col_end);
      const allDay = !isSameDay(start, end);

      // Adjust end date for all-day events
      const adjustedEnd = allDay ? addDays(end, 1) : end;

      // Determine background color
      let backgroundColor = '#EEEEEE'; // Default (not bookable)
      const hoursInAdvance = parseInt(event.col_hours_in_advance, 10) || 0;
      const bookingCutoff = subtractHours(start, hoursInAdvance);

      if (isBeforeOrEqual(bookingCutoff, currentTime)) {
        // Past booking cutoff
        backgroundColor = '#EEEEEE';
      } else if (event.col_is_bookable === 'yes') {
        backgroundColor =
          this.config.colors[event.FID_event_type] || backgroundColor;
      } else if (this.config.hideEventsIfNotBookable) {
        continue; // Skip non-bookable events
      }

      const calendarEvent: CalendarEvent = {
        title: event.col_name,
        classNames: `FID_event_type_${event.FID_event_type}`,
        start,
        end: adjustedEnd,
        backgroundColor,
        textColor: this.config.textColor,
        allDay,
        extendedProps: {
          cableName: event.Fcol_boat_cable_name,
          description: event.col_description,
          seats: parseInt(event.col_seats, 10) || null,
          price: `${this.config.translations.currency}${event.col_price}`,
          hoursInAdvance,
          isBookable: event.col_is_bookable === 'yes',
          checkinTime: event.col_checkin_time,
          bookedSeats: parseInt(event.col_booked_seats, 10) || null,
          col_hours_in_advance: hoursInAdvance,
        },
      };

      // Add URL only if bookable and not past cutoff
      if (
        event.col_is_bookable === 'yes' &&
        !isBeforeOrEqual(bookingCutoff, currentTime)
      ) {
        calendarEvent.url = event.col_link;
      }

      this.log('Adding event:', calendarEvent);
      events.push(calendarEvent);
    }
  }

  /**
   * Process slots API response
   */
  private processSlotsApiResponse(
    data: ApiSlot[] | 0,
    events: CalendarEvent[]
  ): void {
    this.log('Processing slots API response:', data);

    if (data === 0) {
      this.log('No slots found');
      return;
    }

    if (!Array.isArray(data)) {
      console.error('Expected array for slots response, got:', data);
      return;
    }

    // Check if slots should be shown
    if (this.config.eventsToShow['Slot'] === false) {
      return;
    }

    const currentTime = new Date();

    for (const slot of data) {
      const start = parseDateTime(slot.slot_time_start);
      const end = parseDateTime(slot.slot_time_end);

      // Determine background color
      let backgroundColor = '#EEEEEE';
      const colorConfig = this.config.colors['Slot'];

      if (isBeforeOrEqual(start, currentTime)) {
        backgroundColor = '#EEEEEE';
      } else if (colorConfig) {
        backgroundColor = colorConfig;
      } else {
        backgroundColor = generateColor('Slot');
      }

      const calendarEvent: CalendarEvent = {
        title: this.config.translations.slot,
        classNames: 'slot',
        start,
        end,
        backgroundColor,
        textColor: this.config.textColor,
        allDay: false,
        extendedProps: {
          cableName: slot.Fcol_boat_cable_name,
          description: '',
          seats: parseInt(slot.col_number_of_bookings, 10) || null,
          price: this.config.translations.slotPrice,
          hoursInAdvance: 0,
          isBookable: true,
          checkinTime: '30',
          bookedSeats: parseInt(slot.total, 10) || null,
          col_hours_in_advance: 0,
        },
      };

      // Add URL only if not past
      if (!isBeforeOrEqual(start, currentTime)) {
        calendarEvent.url = `${this.config.endpoint}/`;
      }

      this.log('Adding slot:', calendarEvent);
      events.push(calendarEvent);
    }
  }

  /**
   * Process opening times API response
   */
  private processOpeningTimesApiResponse(
    data: ApiOpeningTimesResponse,
    events: CalendarEvent[]
  ): void {
    this.log('Processing opening times API response:', data);

    // Check if slots should be shown
    if (this.config.eventsToShow['Slot'] === false) {
      return;
    }

    const currentTime = new Date();

    for (const [date, dayData] of Object.entries(data)) {
      if (dayData.opening_times === 'closed') {
        continue;
      }

      const [startTime, endTime] = dayData.opening_times.split(' - ');
      const start = parseDateTime(`${date}T${startTime}`);
      const end = parseDateTime(`${date}T${endTime}`);

      // Determine background color
      let backgroundColor = '#EEEEEE';
      const colorConfig = this.config.colors['Slot'];

      if (isBeforeOrEqual(end, currentTime)) {
        backgroundColor = '#EEEEEE';
      } else if (colorConfig) {
        backgroundColor = colorConfig;
      } else {
        backgroundColor = generateColor('Slot');
      }

      const calendarEvent: CalendarEvent = {
        title: this.config.translations.public_opening_hours,
        classNames: 'opening_hours',
        start,
        end,
        backgroundColor,
        textColor: this.config.textColor,
        allDay: false,
        extendedProps: {
          cableName: dayData.transportation_name,
          description: '',
          seats: null,
          price: this.config.translations.slotPrice,
          hoursInAdvance: 0,
          isBookable: true,
          checkinTime: '30',
          bookedSeats: null,
          col_hours_in_advance: 0,
        },
      };

      // Add URL only if not past
      if (!isBeforeOrEqual(end, currentTime)) {
        calendarEvent.url = `${this.config.endpoint}/`;
      }

      this.log('Adding opening time:', calendarEvent);
      events.push(calendarEvent);
    }
  }

  /**
   * Render custom event content
   */
  private renderEventContent(info: EventContentArg): { domNodes: HTMLElement[] } {
    const { event } = info;
    const props = event.extendedProps;
    const currentTime = new Date();

    const hoursInAdvance = props.col_hours_in_advance || 0;
    const startTime = event.start ? formatTime(event.start) : '';
    const endTime = event.end ? formatTime(event.end) : '';
    const bookingCutoffTime = event.start
      ? subtractHours(event.start, hoursInAdvance)
      : new Date(0);

    const bookedSeats = props.bookedSeats;
    const totalSeats = props.seats;

    // Time element
    const timeEl = createElement('div', 'fc-event-time');
    if (!event.allDay && startTime && endTime) {
      timeEl.innerHTML = `${startTime} - ${endTime}`;
    }

    // Title element
    const titleEl = createElement('div', 'fc-event-title', event.title);

    // Cable element
    const cableEl = createElement('div', 'fc-event-cable', props.cableName);

    // Capacity element
    const capacityEl = createElement('div', 'fc-event-capacity');
    if (
      bookedSeats !== null &&
      totalSeats !== null &&
      bookedSeats < totalSeats
    ) {
      capacityEl.innerHTML = `${bookedSeats}/${totalSeats}`;
    } else if (
      bookedSeats !== null &&
      totalSeats !== null &&
      bookedSeats >= totalSeats
    ) {
      capacityEl.innerHTML = this.config.translations.full_booked;
    }

    // Price element
    const priceEl = createElement('div', 'fc-event-price');
    priceEl.innerHTML = props.price || 'No price available';

    // Bookable element
    const bookableEl = createElement('div', 'fc-event-bookable');
    if (
      bookedSeats !== null &&
      totalSeats !== null &&
      bookedSeats < totalSeats &&
      props.isBookable &&
      isBeforeOrEqual(currentTime, bookingCutoffTime)
    ) {
      bookableEl.innerHTML = `<span class="bookable">${this.config.translations.bookable}</span>`;
    } else if (
      bookedSeats !== null &&
      totalSeats !== null &&
      bookedSeats >= totalSeats &&
      props.isBookable &&
      isBeforeOrEqual(currentTime, bookingCutoffTime)
    ) {
      bookableEl.innerHTML = `<span class="booked_out">${this.config.translations.booked_out}</span>`;
    } else if (
      bookedSeats !== null &&
      totalSeats !== null &&
      bookedSeats < totalSeats &&
      !props.isBookable
    ) {
      bookableEl.innerHTML = `<span class="booked_out">${this.config.translations.not_available}</span>`;
    }

    return {
      domNodes: [timeEl, titleEl, cableEl, capacityEl, priceEl, bookableEl],
    };
  }

  /**
   * Handle event click
   */
  private handleEventClick(info: EventClickArg): void {
    info.jsEvent.preventDefault();
    if (info.event.url) {
      window.open(info.event.url, '_blank');
    }
  }

  /**
   * Generate configuration for colors and events
   */
  private async generateConfiguration(): Promise<void> {
    try {
      const eventTypes = await this.apiClient.fetchEventTypes();

      const colors: ColorMap = {
        Slot: '#88e645',
      };

      const eventsToShow: EventVisibilityMap = {
        Slot: true,
      };

      for (const event of eventTypes) {
        if (event && event.col_name) {
          const colorCode = generateColor(event.col_name);
          colors[event.ID_event] = colorCode;
          eventsToShow[event.ID_event] = true;
        }
      }

      // Build configuration string
      let configString = 'colors: {\n';
      configString += `  'Slot': '${colors['Slot']}',  // Regular Opening Hours\n`;

      for (const event of eventTypes) {
        if (event && event.col_name) {
          configString += `  '${event.ID_event}': '${colors[event.ID_event]}',  // ${event.col_name}\n`;
        }
      }
      configString += '},\n\neventsToShow: {\n';
      configString += `  'Slot': true,  // Regular Opening Hours\n`;

      for (const event of eventTypes) {
        if (event && event.col_name) {
          configString += `  '${event.ID_event}': true,  // ${event.col_name}\n`;
        }
      }
      configString += '}';

      showGeneratedArrayModal(configString);
    } catch (error) {
      console.error('Error generating configuration:', error);
    }
  }

  /**
   * Get the FullCalendar instance
   */
  getCalendarInstance(): FullCalendarInstance | null {
    return this.calendar;
  }

  /**
   * Get the API client
   */
  getApiClient(): WakeSysApiClient {
    return this.apiClient;
  }

  /**
   * Refresh events
   */
  refetchEvents(): void {
    this.calendar?.refetchEvents();
  }
}
