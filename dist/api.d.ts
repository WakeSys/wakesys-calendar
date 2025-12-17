/**
 * API client for WakeSys Calendar
 * Uses JSONP for cross-domain requests
 */
import type { ApiEvent, ApiSlot, ApiOpeningTimesResponse, ApiTransportation, ApiEventType, JsonpParams } from './types';
/**
 * Make a JSONP request
 */
export declare function jsonp<T>(url: string, params?: JsonpParams): Promise<T>;
export declare class WakeSysApiClient {
    private endpoint;
    private transportationsCache;
    constructor(parkSubdomain: string);
    /**
     * Get the base endpoint URL
     */
    getEndpoint(): string;
    /**
     * Fetch events from the events API
     */
    fetchEvents(startDate: string): Promise<ApiEvent[] | 0>;
    /**
     * Fetch slots from the heatmap API
     */
    fetchSlots(startDate: string, transportationName: string): Promise<ApiSlot[] | 0>;
    /**
     * Fetch opening times from the opening_times API
     */
    fetchOpeningTimes(startDate: string, transportationName: string): Promise<ApiOpeningTimesResponse>;
    /**
     * Fetch transportations from the list_transportations API
     */
    fetchTransportations(): Promise<ApiTransportation[]>;
    /**
     * Fetch event types from the list_events API
     */
    fetchEventTypes(): Promise<ApiEventType[]>;
    /**
     * Clear the transportations cache
     */
    clearCache(): void;
}
export type ApiRequestType = 'eventsAPI' | 'slotsAPI' | 'OpeningTimesAPI';
export interface TaggedResponse<T> {
    data: T;
    type: ApiRequestType;
}
/**
 * Create a tagged API request that includes the request type in the result
 */
export declare function taggedRequest<T>(promise: Promise<T>, type: ApiRequestType): Promise<TaggedResponse<T>>;
//# sourceMappingURL=api.d.ts.map