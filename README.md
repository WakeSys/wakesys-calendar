# WakeSys Calendar Integration

A customizable calendar integration for WakeSys that displays bookable sessions, events, and opening hours using FullCalendar.js.

## Features

- Display of public opening hours, bookable slots, and events
- Real-time availability and booking status
- Responsive design (adapts to mobile and desktop views)
- Multi-language support
- Customizable color schemes for different event types
- Loading overlay for better user experience
- Automatic handling of time zones
- Configurable booking cut-off times

## Installation

1. Include the required files in your HTML:

```html
<!-- Required Dependencies -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/locales-all.global.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
<!-- WakeSys Calendar Files -->
<script src="helpfunctions.js"></script>
<script src="wakesyscalendar.js"></script>
<link href="wakesyscalendar.css" rel="stylesheet">
```

2. Add the calendar container to your HTML:

```html
<div class='innerwrapper'>
    <div id='wakesys_calendar'></div>
</div>
```

## Event Colors and Visibility

Configure event colors and visibility in the following arrays:

```javascript
var colors = {
    'Slot': '#88e645',   // Regular Opening Hours
    // Add more event types and their colors here
};

var eventsToShow = {
    'Slot': true,   // Regular Opening Hours
    // Configure which events to show/hide
};
```


## Features

- **Automatic Color Generation**: For new event types added in WakeSys
- **Responsive Design**: Adapts to different screen sizes
- **Real-time Updates**: Shows current availability and booking status
- **Multiple Views**: Day, Week, and Month views
- **Customizable Styling**: Through wakesyscalendar.css

## Dependencies

- jQuery 3.7.1
- FullCalendar 6.1.10
- Moment.js 2.29.1
- Google Fonts (Sarabun)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

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
