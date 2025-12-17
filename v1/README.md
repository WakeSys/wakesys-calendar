# WakeSys Calendar v1.x (Legacy)

This folder contains the legacy v1.x version of WakeSys Calendar which requires jQuery and moment.js.

## Dependencies

- jQuery 3.7.1
- FullCalendar 6.1.10
- Moment.js 2.29.1

## Usage

```html
<!-- Required Dependencies -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.10/index.global.min.js'></script>
<script src='https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.10/locales-all.global.min.js'></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

<!-- WakeSys Calendar v1 Files -->
<script src="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/helpfunctions.js"></script>
<script src="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/wakesyscalendar.js"></script>
<link href="https://cdn.jsdelivr.net/gh/wakesys/wakesys-calendar@1.0.2/wakesyscalendar.css" rel="stylesheet">
```

## Migration to v2.x

Consider migrating to v2.x for:
- No jQuery dependency
- No moment.js dependency
- TypeScript support
- Smaller bundle size
- Modern class-based API

See the main [README.md](../README.md) for v2.x documentation.

