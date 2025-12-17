/**
 * Main WakeSys Calendar Class
 */
import type { WakeSysCalendarOptions, FullCalendarInstance } from './types';
import { WakeSysApiClient } from './api';
export declare class WakeSysCalendar {
    private config;
    private calendarEl;
    private calendar;
    private apiClient;
    constructor(selector: string | HTMLElement, options: WakeSysCalendarOptions);
    /**
     * Resolve configuration by merging with defaults
     */
    private resolveConfig;
    /**
     * Log debug messages if debug mode is enabled
     */
    private log;
    /**
     * Render the calendar
     */
    render(): void;
    /**
     * Destroy the calendar instance
     */
    destroy(): void;
    /**
     * Fetch calendar events (called by FullCalendar)
     */
    private fetchCalendarEvents;
    /**
     * Process events API response
     */
    private processEventsApiResponse;
    /**
     * Process slots API response
     */
    private processSlotsApiResponse;
    /**
     * Process opening times API response
     */
    private processOpeningTimesApiResponse;
    /**
     * Render custom event content
     */
    private renderEventContent;
    /**
     * Handle event click
     */
    private handleEventClick;
    /**
     * Generate configuration for colors and events
     */
    private generateConfiguration;
    /**
     * Get the FullCalendar instance
     */
    getCalendarInstance(): FullCalendarInstance | null;
    /**
     * Get the API client
     */
    getApiClient(): WakeSysApiClient;
    /**
     * Refresh events
     */
    refetchEvents(): void;
}
//# sourceMappingURL=calendar.d.ts.map