# WakeSys Calendar Integration

A customizable calendar integration for WakeSys that displays bookable sessions, events, and opening hours using FullCalendar.js.

**v2.0.0** - Now written in TypeScript with zero jQuery/moment.js dependencies and modern styling!

## Version History

| Version | Release | Features | Dependencies |
|---------|---------|----------|--------------|
| v2.0.1 | Dec 2024 | TypeScript, class-based API, modern UI | FullCalendar only |
| v1.0.2 | Legacy | Global variables API | jQuery, moment.js, FullCalendar |

> **Note**: v1.x files are preserved in the `/v1` folder for backward compatibility.

## Features

- Display of public opening hours, bookable slots, and events
- Real-time availability and booking status
- Responsive design (adapts to mobile and desktop views)
- Multi-language support
- Customizable color schemes for different event types
- Loading overlay for better user experience
- Automatic handling of time zones
- Configurable booking cut-off times
- **TypeScript support** with full type definitions
- **No jQuery or moment.js dependencies** (smaller bundle)
- **Modern UI** with pill-shaped buttons, circular nav arrows, and clean grid styling

## Installation

### Option 1: CDN (Recommended)

**v2.x (Modern - No jQuery/moment.js required)**
```html
<!-- FullCalendar (required dependency) -->
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/locales-all.global.min.js'></script>

<!-- WakeSys Calendar v2 -->
<script src="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@2.0.0/dist/wakesyscalendar.js"></script>
<link href="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@2.0.0/wakesyscalendar.css" rel="stylesheet">
```

**v1.x (Legacy - Requires jQuery/moment.js)**
```html
<!-- Required Dependencies -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/locales-all.global.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

<!-- WakeSys Calendar v1 -->
<script src="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/helpfunctions.js"></script>
<script src="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/wakesyscalendar.js"></script>
<link href="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/wakesyscalendar.css" rel="stylesheet">
```

> **Tip**: Use specific version tags (e.g., `@2.0.0`, `@1.0.2`) to ensure your integration remains stable.

### Option 2: NPM

```bash
npm install wakesys-calendar
```

```javascript
import { WakeSysCalendar } from 'wakesys-calendar';
```

### Option 3: Build from Source

```bash
git clone https://github.com/wakesys/wakesys-calendar.git
cd wakesys-calendar
npm install
npm run build
```

## Quick Start

Add the calendar container to your HTML:

```html
<div id='wakesys_calendar'></div>
```

Initialize the calendar:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const calendar = new WakeSysCalendar('#wakesys_calendar', {
        parkSubdomain: 'your-subdomain',
        locale: 'de',
        translations: {
            public_opening_hours: 'Öffentlicher Betrieb',
            slot: 'Slot',
            bookable: 'buchbar',
            booked_out: 'ausgebucht',
            not_available: 'nicht buchbar',
            currency: '€',
            full_booked: 'ausgebucht',
            slotPrice: 'ab €20',
            loading: 'Lädt',
        },
    });

    calendar.render();
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `parkSubdomain` | `string` | **required** | Your WakeSys park subdomain |
| `firstDayOfWeek` | `number` | `1` | First day of week (0 = Sunday, 1 = Monday) |
| `locale` | `string` | `'en-gb'` | Calendar locale (de, fr, it, es, en-gb) |
| `minOpeningHours` | `string` | `'08:00:00'` | Earliest time shown |
| `maxOpeningHours` | `string` | `'20:00:00'` | Latest time shown |
| `timeAmPm` | `boolean` | `false` | Use AM/PM format (true) or 24h (false) |
| `textColor` | `string` | `'#000'` | Event text color |
| `calendarHeight` | `string` | `'800px'` | Calendar height ('auto' or specific) |
| `hideEventsIfNotBookable` | `boolean` | `false` | Hide non-bookable events |
| `headerToolbarLeft` | `string` | `'dayGridMonth,timeGridWeek,timeGridDay'` | Toolbar buttons |
| `translations` | `object` | See below | UI translation strings |
| `colors` | `object` | `{}` | Event type color mapping |
| `eventsToShow` | `object` | `{}` | Event type visibility |
| `debug` | `boolean` | `false` | Enable debug logging |

### Translations Object

```javascript
translations: {
    public_opening_hours: 'Public Hours',    // Public riding hours text
    slot: 'Slot',                            // Slot text
    bookable: 'Available',                   // Available status text
    booked_out: 'Booked Out',                // Fully booked status text
    not_available: 'Not Available',          // Unavailable status text
    currency: '€',                           // Currency symbol
    full_booked: 'Fully Booked',             // Full booking status text
    slotPrice: 'from €20',                   // Default slot price text
    loading: 'Loading',                      // Loading status text
}
```

## Styling

The calendar comes with modern styling out of the box via `wakesyscalendar.css`:

- **Header toolbar**: Pill-shaped view switcher, circular navigation buttons
- **Grid**: Clean borders, subtle time slot lines
- **Events**: Rounded cards with proper spacing

### Custom Event Colors

Event colors are **not** included in the default CSS - configure them per-park:

```css
/* Add to your page or custom stylesheet */
.FID_event_type_1 { background-color: #b5d7f0 !important; border-color: #8fb8d9 !important; }
.FID_event_type_2 { background-color: #f5a623 !important; border-color: #c4851c !important; }
```

Or use the JavaScript `colors` configuration (recommended):

```javascript
colors: {
    '1': '#b5d7f0',  // Event Type ID 1
    '2': '#f5a623',  // Event Type ID 2
}
```

### Recommended Font

For best results, include the Inter font:

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Event Colors and Visibility

Leave `colors` and `eventsToShow` empty on first load to auto-generate configuration:

```javascript
const calendar = new WakeSysCalendar('#wakesys_calendar', {
    parkSubdomain: 'your-subdomain',
    colors: {},        // Will trigger auto-generation popup
    eventsToShow: {},  // Will trigger auto-generation popup
});
```

A modal will appear with suggested configurations. Copy and customize:

```javascript
colors: {
    'Slot': '#88e645',    // Regular Opening Hours
    '1': '#ff6b6b',       // Event Type 1
    '2': '#4ecdc4',       // Event Type 2
},
eventsToShow: {
    'Slot': true,         // Show Regular Opening Hours
    '1': true,            // Show Event Type 1
    '2': false,           // Hide Event Type 2
}
```

## API Methods

```javascript
const calendar = new WakeSysCalendar('#wakesys_calendar', options);

// Render the calendar
calendar.render();

// Refresh events
calendar.refetchEvents();

// Destroy the calendar
calendar.destroy();

// Access FullCalendar instance
const fcInstance = calendar.getCalendarInstance();

// Access API client
const apiClient = calendar.getApiClient();
```

## Legacy API (v1.x Compatibility)

For backward compatibility with v1.x, you can use global variables:

```html
<script>
var park_subdomain = 'test-wasserski-wedau';
var park_first_day_of_week = 1;
var locale = 'de';
var park_min_opening_hours = '08:00:00';
var park_max_opening_hours = '20:00:00';
var park_time_am_or_pm = false;
var textColor = '#000';
var calendarHeight = '800px';
var hideEventsIfNotBookable = false;
var headerToolbarLeft = 'dayGridMonth,timeGridWeek,timeGridDay';

var translations = {
    'public_opening_hours': 'Öffentlicher Betrieb',
    'slot': 'Slot',
    'bookable': 'buchbar',
    'booked_out': 'ausgebucht',
    'not_available': 'nicht buchbar',
    'currency': '€',
    'full_booked': 'ausgebucht',
    'slotPrice': 'ab €20',
    'loading': 'Lädt',
};

var colors = {};
var eventsToShow = {};
</script>
<script src="dist/wakesyscalendar.js"></script>
<!-- Calendar auto-initializes when DOM is ready -->
```

Or manually initialize:

```javascript
document.addEventListener('DOMContentLoaded', function() {
    initWakeSysCalendarLegacy('wakesys_calendar');
});
```

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import { WakeSysCalendar, WakeSysCalendarOptions, Translations } from 'wakesys-calendar';

const options: WakeSysCalendarOptions = {
    parkSubdomain: 'your-subdomain',
    locale: 'de',
    // ... fully typed options
};

const calendar = new WakeSysCalendar('#wakesys_calendar', options);
calendar.render();
```

## Development

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build
```

## Dependencies

- FullCalendar 6.1.10 (required)
- FullCalendar Locales (optional, for i18n)

**Removed in v2.0:**
- jQuery (no longer required)
- moment.js (no longer required)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- IE11 is **not** supported in v2.0

## Migrating from v1.x

### Breaking Changes

1. **jQuery is no longer required** - Remove jQuery from your page if not used elsewhere
2. **moment.js is no longer required** - Remove moment.js from your page if not used elsewhere
3. **Script loading order changed** - Load FullCalendar before WakeSysCalendar

### Migration Steps

1. Remove jQuery and moment.js script tags (if not used elsewhere)
2. Update script sources to use `dist/wakesyscalendar.js`
3. (Optional) Migrate to new class-based API for better TypeScript support

The legacy global variable API is fully supported for backward compatibility.

## License

GNU GPLv3

Copyright (c) 2025 wakesys s.à.r.l.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You must share any derivative works under the same license terms. All modifications and improvements must be made available publicly under the GNU GPLv3.

Commercial use of this software is allowed, but the source code of any derivative works MUST be made freely available under the terms of the GNU GPLv3.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## Support

For support or questions, please contact your WakeSys representative.
