/**
 * Utility functions for WakeSys Calendar
 */

import type { Translations } from './types';

// ============================================================================
// Date Utilities
// ============================================================================

/**
 * Format a Date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date to HH:mm string
 */
export function formatTime(date: Date, hour12 = false): string {
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (hour12) {
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${period}`;
  }

  return `${String(hours).padStart(2, '0')}:${minutes}`;
}

/**
 * Parse a datetime string (YYYY-MM-DD HH:mm:ss) to Date
 */
export function parseDateTime(str: string): Date {
  // Handle both "YYYY-MM-DD HH:mm:ss" and ISO formats
  return new Date(str.replace(' ', 'T'));
}

/**
 * Subtract hours from a Date, returning a new Date
 */
export function subtractHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

/**
 * Add days to a Date, returning a new Date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if date1 is before or equal to date2
 */
export function isBeforeOrEqual(date1: Date, date2: Date): boolean {
  return date1.getTime() <= date2.getTime();
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Darken a hex color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse RGB values
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  
  // Darken
  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));
  
  // Convert back to hex
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a color based on a string (for automatic event coloring)
 */
export function generateColor(eventName: string): string {
  // Calculate hash from event name
  let hash = 0;
  for (let i = 0; i < eventName.length; i++) {
    hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to hue (0-360)
  const hue = ((hash % 360) + 360) % 360;

  // Convert HSV to RGB (Saturation: 70%, Value: 90%)
  const rgb = hsvToRgb(hue / 360, 0.7, 0.9);

  // Convert to hex
  return (
    '#' +
    rgb.map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')
  );
}

/**
 * Convert HSV to RGB
 */
function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  let r: number, g: number, b: number;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
    default:
      r = v;
      g = p;
      b = q;
      break;
  }

  return [r * 255, g * 255, b * 255];
}

// ============================================================================
// DOM Utilities
// ============================================================================

/**
 * Create an HTML element with optional class and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  innerHTML?: string
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) {
    el.className = className;
  }
  if (innerHTML !== undefined) {
    el.innerHTML = innerHTML;
  }
  return el;
}

/**
 * Toggle loading overlay visibility
 */
export function toggleLoadingOverlay(
  calendarEl: HTMLElement,
  show: boolean,
  translations: Translations
): void {
  let overlay = document.getElementById('loadingOverlay');

  if (!overlay) {
    // Create overlay if it doesn't exist
    overlay = createElement('div');
    overlay.id = 'loadingOverlay';
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'none',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: '1000',
    });

    const loadingIndicator = createElement('div');
    loadingIndicator.innerText = `${translations.loading}...`;
    Object.assign(loadingIndicator.style, {
      fontSize: '1em',
      color: 'white',
      padding: '20px',
      borderRadius: '5px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
    });
    overlay.appendChild(loadingIndicator);

    // Ensure calendar element has relative positioning
    calendarEl.style.position = 'relative';
    calendarEl.appendChild(overlay);
  }

  // Toggle visibility
  overlay.style.display = show ? 'flex' : 'none';
}

/**
 * Show the generated configuration modal
 */
export function showGeneratedArrayModal(arrayString: string): void {
  // Inject CSS styles if not already present
  if (!document.getElementById('wakesys-modal-styles')) {
    const style = createElement('style');
    style.id = 'wakesys-modal-styles';
    style.innerHTML = `
      .wakesys-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 9999;
      }
      .wakesys-modal {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 80%;
        padding: 20px;
        background-color: white;
        border: 1px solid #ccc;
        overflow: auto;
        z-index: 10000;
      }
      .wakesys-instructions {
        color: red;
        font-weight: bold;
        padding-bottom: 20px;
      }
      .wakesys-close {
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
        font-size: 24px;
      }
      .wakesys-textarea {
        width: 100%;
        height: calc(100% - 80px);
        font-family: monospace;
      }
    `;
    document.head.appendChild(style);
  }

  // Remove existing overlay if present
  const existingOverlay = document.getElementById('wakesys-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // Create overlay
  const overlay = createElement('div');
  overlay.id = 'wakesys-overlay';
  overlay.className = 'wakesys-overlay';

  const modal = createElement('div');
  modal.className = 'wakesys-modal';

  const instructions = createElement('div', 'wakesys-instructions');
  instructions.textContent =
    'Please copy paste these settings into your configuration. Change the color for each event as necessary, and set events to false that you do not want to show in the calendar.';

  const closeBtn = createElement('span', 'wakesys-close');
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => {
    overlay.style.display = 'none';
  };

  const textarea = createElement('textarea', 'wakesys-textarea') as HTMLTextAreaElement;
  textarea.readOnly = true;
  textarea.value = arrayString;

  modal.appendChild(instructions);
  modal.appendChild(closeBtn);
  modal.appendChild(textarea);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Show overlay
  overlay.style.display = 'block';
}

/**
 * Close the generated configuration modal
 */
export function closeModal(): void {
  const overlay = document.getElementById('wakesys-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Make closeModal available globally for onclick handlers
if (typeof window !== 'undefined') {
  (window as Window & { closeModal?: typeof closeModal }).closeModal = closeModal;
}

