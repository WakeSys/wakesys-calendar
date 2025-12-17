/**
 * API client for WakeSys Calendar
 * Uses JSONP for cross-domain requests
 */

import type {
  ApiEvent,
  ApiSlot,
  ApiOpeningTimesResponse,
  ApiTransportation,
  ApiEventType,
  JsonpParams,
} from './types';

// ============================================================================
// JSONP Implementation
// ============================================================================

let jsonpCounter = 0;

/**
 * Make a JSONP request
 */
export function jsonp<T>(url: string, params: JsonpParams = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    const callbackName = `wakesys_jsonp_${Date.now()}_${jsonpCounter++}`;
    const script = document.createElement('script');
    let timeoutId: ReturnType<typeof setTimeout>;

    // Cleanup function
    const cleanup = () => {
      clearTimeout(timeoutId);
      delete (window as unknown as Record<string, unknown>)[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };

    // Set up callback
    (window as unknown as Record<string, unknown>)[callbackName] = (data: T) => {
      resolve(data);
      cleanup();
    };

    // Build URL with params
    const queryParams = new URLSearchParams({
      ...params,
      callback: callbackName,
    });
    script.src = `${url}?${queryParams.toString()}`;

    // Handle errors
    script.onerror = () => {
      reject(new Error(`JSONP request failed: ${url}`));
      cleanup();
    };

    // Timeout after 30 seconds
    timeoutId = setTimeout(() => {
      reject(new Error(`JSONP request timed out: ${url}`));
      cleanup();
    }, 30000);

    // Execute request
    document.head.appendChild(script);
  });
}

// ============================================================================
// API Client Class
// ============================================================================

export class WakeSysApiClient {
  private endpoint: string;
  private transportationsCache: ApiTransportation[] | null = null;

  constructor(parkSubdomain: string) {
    this.endpoint = `https://${parkSubdomain}.wakesys.com`;
  }

  /**
   * Get the base endpoint URL
   */
  getEndpoint(): string {
    return this.endpoint;
  }

  /**
   * Fetch events from the events API
   */
  async fetchEvents(startDate: string): Promise<ApiEvent[] | 0> {
    const url = `${this.endpoint}/api/events.php`;
    return jsonp<ApiEvent[] | 0>(url, { start: startDate });
  }

  /**
   * Fetch slots from the heatmap API
   */
  async fetchSlots(
    startDate: string,
    transportationName: string
  ): Promise<ApiSlot[] | 0> {
    const url = `${this.endpoint}/api/heatmap.php`;
    return jsonp<ApiSlot[] | 0>(url, {
      start: startDate,
      transportation_name: transportationName,
    });
  }

  /**
   * Fetch opening times from the opening_times API
   */
  async fetchOpeningTimes(
    startDate: string,
    transportationName: string
  ): Promise<ApiOpeningTimesResponse> {
    const url = `${this.endpoint}/api/opening_times.php`;
    return jsonp<ApiOpeningTimesResponse>(url, {
      start: startDate,
      transportation_name: transportationName,
    });
  }

  /**
   * Fetch transportations from the list_transportations API
   */
  async fetchTransportations(): Promise<ApiTransportation[]> {
    // Return cached data if available
    if (this.transportationsCache !== null) {
      return this.transportationsCache;
    }

    const url = `${this.endpoint}/api/list_transportations.php`;
    const data = await jsonp<ApiTransportation[]>(url);

    if (Array.isArray(data)) {
      this.transportationsCache = data;
      return data;
    }

    console.error('Unexpected data format from transportations API:', data);
    return [];
  }

  /**
   * Fetch event types from the list_events API
   */
  async fetchEventTypes(): Promise<ApiEventType[]> {
    const url = `${this.endpoint}/api/list_events.php`;
    const data = await jsonp<ApiEventType[]>(url);

    if (Array.isArray(data)) {
      return data;
    }

    console.error('Unexpected data format from event types API:', data);
    return [];
  }

  /**
   * Clear the transportations cache
   */
  clearCache(): void {
    this.transportationsCache = null;
  }
}

// ============================================================================
// Tagged Request Helpers
// ============================================================================

export type ApiRequestType = 'eventsAPI' | 'slotsAPI' | 'OpeningTimesAPI';

export interface TaggedResponse<T> {
  data: T;
  type: ApiRequestType;
}

/**
 * Create a tagged API request that includes the request type in the result
 */
export async function taggedRequest<T>(
  promise: Promise<T>,
  type: ApiRequestType
): Promise<TaggedResponse<T>> {
  const data = await promise;
  return { data, type };
}
