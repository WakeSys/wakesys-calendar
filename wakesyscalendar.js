document.addEventListener('DOMContentLoaded', function () {
    if($("#wakesys_calendar").length == 0) {
        console.log('Cannot find <div id=\'wakesys_calendar\'></div>');
        return;
    }
    var calendarEl = document.getElementById('wakesys_calendar');
    toggleLoadingOverlay(true);
    var endpoint = 'https://' + park_subdomain + '.wakesys.com';
    // var endpoint = 'https://wake.dev';
    var renderedEvents = []; 
    var transportationsArray = [];
    var debugging = false; 

    if (!colors || Object.keys(colors).length === 0 || !eventsToShow || Object.keys(eventsToShow).length === 0) {
        fetchEventsFromApi();
    } 

    var calendar = new FullCalendar.Calendar(calendarEl, {
        timeZone: 'local',
        height: calendarHeight,
        slotEventOverlap: 0, 
        initialView: $(window).width() < 765 ? 'timeGridDay' : 'timeGridWeek',
        firstDay: park_first_day_of_week, 
        locale: locale,
        headerToolbar: {
            right: 'prev,next today', 
            center: 'title', 
            left: headerToolbarLeft
        },
        slotMinTime: park_min_opening_hours, 
        slotMaxTime: park_max_opening_hours, 
        slotLabelInterval: { hours: 1 }, 
        slotLabelFormat: { hour: 'numeric', hour12: park_time_am_or_pm }, 
        events: fetchCalendarEvents,
        loading: function(isLoading) {
            toggleLoadingOverlay(isLoading);
        },
        datesSet: function (info) {
            calendar.refetchEvents();
        },
        eventContent: function(info) {
            // Format start and end times using moment.js
            var currentTime = moment(); // Get the current time
            var hoursInAdvance = info.event.extendedProps.col_hours_in_advance;
            var startTime = moment(info.event.start).format("HH:mm");
            var eventStartTime = moment(info.event.start);
            var endTime = info.event.end ? moment(info.event.end).format("HH:mm") : "";
            var bookingCutoffTime = eventStartTime.subtract(hoursInAdvance, 'hours');

            var bookedSeats = parseInt(info.event.extendedProps.bookedSeats, 10);
            var totalSeats = parseInt(info.event.extendedProps.seats, 10);

            // Create the event title element with the time range
            var timeEl = document.createElement('div');
            timeEl.classList.add('fc-event-time'); // Add a class for styling
            if(!info.event.allDay) {
                timeEl.innerHTML = startTime + " - " + endTime; // Combining time range with the event time
            }

            // Create the event title element with the time range
            var titleEl = document.createElement('div');
            titleEl.classList.add('fc-event-title'); // Add a class for styling
            titleEl.innerHTML = info.event.title; // Combining time range with the event title

            // Create the event title element with the time range
            var cableEl = document.createElement('div');
            cableEl.classList.add('fc-event-cable'); // Add a class for styling
            cableEl.innerHTML = info.event.extendedProps.cableName; // Combining time range with the event cable

            // Create the capacity element, ensuring to access custom properties correctly
            var capacityEl = document.createElement('div');
            capacityEl.classList.add('fc-event-capacity'); // Add a class for styling
            if(
                (bookedSeats < totalSeats)
                && (bookedSeats !== null)
                && (totalSeats !== null)
            ) { // Check if enough capacity exists
                capacityEl.innerHTML = bookedSeats + '/' + totalSeats; // Display the capacity
            } else if(
                (bookedSeats >= totalSeats)
                && (bookedSeats !== null)
                && (totalSeats !== null)
            ) {
                capacityEl.innerHTML = translations['full_booked'];
            } else if(
                (bookedSeats !== null)
                && (totalSeats !== null)
            ) {
                capacityEl.innerHTML = '';
            }

            // Create the price element, ensuring to access custom properties correctly
            var priceEl = document.createElement('div');
            priceEl.classList.add('fc-event-price'); // Add a class for styling
            if(info.event.extendedProps.price) { // Check if the price property exists
                priceEl.innerHTML = info.event.extendedProps.price; // Display the price
            } else {
                priceEl.innerHTML = "No price available"; // Fallback text
            }

            // Create the capacity element, ensuring to access custom properties correctly
            var bookableEl = document.createElement('div');
            bookableEl.classList.add('fc-event-bookable'); // Add a class for styling
            if (
                bookedSeats < totalSeats
                && info.event.extendedProps.isBookable
                && currentTime <= bookingCutoffTime  // Check if current time is before the booking cutoff time
            ) { // Check if the enough capacity exists
                bookableEl.innerHTML = '<span class="bookable">'+translations['bookable']+'</span>'; // Display bookable
            } else if(
                bookedSeats >= totalSeats
                && info.event.extendedProps.isBookable 
                && currentTime <= bookingCutoffTime
            ) {
                bookableEl.innerHTML = '<span class="booked_out">'+translations['booked_out']+'</span>'; // Fallback text
            } else if(
                bookedSeats < totalSeats
                && !info.event.extendedProps.isBookable
            ) {
                bookableEl.innerHTML = '<span class="booked_out">'+translations['not_available']+'</span>'; // Fallback text
            }

            // Append elements to an array to be displayed in the event
            var arrayOfDomNodes = [timeEl, titleEl, cableEl, capacityEl, priceEl, bookableEl]; // No durationEl in this case

            return { domNodes: arrayOfDomNodes };
        },

        eventClick: function (info) {
            info.jsEvent.preventDefault();
            if (info.event.url) {
                window.open(info.event.url, '_blank');
            }
        },
        displayEventTime: false,
        displayEventEnd: false,
        defaultAllDay: false
    });

    calendar.render();

    function fetchCalendarEvents(fetchInfo, successCallback, failureCallback) {
        var eventsAPIBase = endpoint + '/api/events.php'; // Adjusted to use wake.dev for the example
        var slotsAPI = endpoint + '/api/heatmap.php';
        var OpeningTimesAPI = endpoint + '/api/opening_times.php';
        var requestsArray = []; // Array to hold all AJAX requests

        var eventsAPIRequest = makeTaggedRequest({
            url: eventsAPIBase,
            dataType: 'jsonp',
            data: {
                start: formatDate(fetchInfo.start)
            }
        }, 'eventsAPI');
        requestsArray.push(eventsAPIRequest);

        // First, fetch transportation data
        fetchTransportationsFromApi(function(transportationsArray) {
            // console.log("TransportationsArray length:", transportationsArray.length);

            // After transportationsArray is populated, proceed with other requests
            transportationsArray.forEach(function(transportation) {
                

                if (transportation.col_option_heatmap == 'yes' && transportation.col_session_view != '5mast') {
                    var slotsAPIRequest = makeTaggedRequest({
                        url: slotsAPI,
                        dataType: 'jsonp',
                        data: { 
                            start: formatDate(fetchInfo.start),
                            transportation_name: transportation.Fcol_boat_cable_name 
                        }
                    }, 'slotsAPI');
                    requestsArray.push(slotsAPIRequest);
                } else if (transportation.col_session_view != 'events_only') {
                    var OpeningTimesAPIRequest = makeTaggedRequest({
                        url: OpeningTimesAPI,
                        dataType: 'jsonp',
                        data: { 
                            start: formatDate(fetchInfo.start),
                            transportation_name: transportation.Fcol_boat_cable_name 
                        }
                    }, 'OpeningTimesAPI');
                    requestsArray.push(OpeningTimesAPIRequest);
                }
            });

            // Once all requests are prepared, execute them together
            $.when.apply($, requestsArray).then(function() {
                // Convert arguments object to array
                var responses = Array.prototype.slice.call(arguments);
                var events = [];

                // Process each response based on its tagged type
                responses.forEach(function(responseData) {
                    var response = responseData[0]; // Actual response data
                    var type = responseData[3]; // Tagged type
                    
                    if(debugging) console.log("API Response from " + type + ":", response);

                    // Process the response based on its type
                    if (type === 'eventsAPI') {
                        processEventsApiResponse(response, events);
                    } else if (type === 'slotsAPI') {
                        processSlotsApiResponse(response, events);
                    } else if (type === 'OpeningTimesAPI') {
                        processOpeningTimesApiResponse(response, events);
                    }
                });

                successCallback(events);
            }, failureCallback).fail(failureCallback);
        });
    }



    function processEventsApiResponse(data, events) {
        if (debugging) console.log("Processing events API response:", data);

        // Get current time
        var currentTime = moment();

        // Debugging the error by checking if data is an array
        if (data === 0) {
            // console.log("No events found for the Events API.");
        } else if (Array.isArray(data)) {
            data.forEach(function(event) {
                // Check if the event type is set to true in eventsToShow
                if (eventsToShow[event.FID_event_type] !== false) {
                    var start = moment(event.col_start, "YYYY-MM-DD HH:mm:ss").toDate();
                    var end = moment(event.col_end, "YYYY-MM-DD HH:mm:ss").toDate();
                    var allDay = !moment(start).isSame(end, 'day');
                    if(allDay) {
                        // end = moment(end).add(1, 'days');
                        end = moment(end, 'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD HH:mm:SS')
                    }

                    var backgroundColor = "#EEEEEE"; // Default background color

                    // Check if the event can still be booked based on hours in advance
                    if (event.col_hours_in_advance && moment(start).subtract(event.col_hours_in_advance, 'hours') <= currentTime) {
                        backgroundColor = "#EEEEEE"; // Set background color to #EEEEEE
                    } else if (event.col_is_bookable === "yes") {
                        backgroundColor = colors[event.FID_event_type] || backgroundColor; // Set colorConfig or default to #EEEEEE
                    } else if (hideEventsIfNotBookable) {
                        return; // Skip rendering if event is not bookable and hideEventsIfNotBookable is true
                    }

                    var eventObj = {
                        title: event.col_name,
                        classNames: 'FID_event_type_' + event.FID_event_type,
                        start: start,
                        end: end,
                        backgroundColor: backgroundColor,
                        cableName: event.Fcol_boat_cable_name,
                        description: event.col_description,
                        textColor: textColor,
                        seats: event.col_seats,
                        price: translations['currency']+event.col_price,
                        hoursInAdvance: event.col_hours_in_advance,
                        isBookable: event.col_is_bookable === "yes",
                        checkinTime: event.col_checkin_time,
                        bookedSeats: event.col_booked_seats,
                        url: event.col_link,
                        allDay: allDay,
                    };

                    // Remove URL if the event is not bookable or starts within hours in advance
                    if (!event.col_is_bookable || moment(start).subtract(event.col_hours_in_advance, 'hours') <= currentTime) {
                        delete eventObj.url;
                    }

                    if (debugging) console.log('Adding event:', eventObj);
                    events.push(eventObj);
                }
            });
        } else {
            console.error("Expected an array for first Events response, got:", data);
        }
    }

    function processSlotsApiResponse(data, events) {
        if(debugging) console.log("Processing Slots API response:", data);

        // Get current time
        var currentTime = moment();

        // Check for the slots API response
        if (data === 0) {
            console.log("No events found for the Slots API.");
        } else if (Array.isArray(data)) {
            if(debugging) console.log(data);
            data.forEach(function(slot) {
                // Check if the event type is set to true in eventsToShow
                if (eventsToShow['Slot'] !== false) {
                    if(debugging) console.log(slot);
                    if(debugging) console.log('slot.slot_time_start: ' + slot.slot_time_start);
                    if(debugging) console.log('slot.slot_time_end: ' + slot.slot_time_end);
                    var start = moment(slot.slot_time_start, "YYYY-MM-DD HH:mm:ss").toDate();
                    var end = moment(slot.slot_time_end, "YYYY-MM-DD HH:mm:ss").toDate();
                    var allDay = !moment(start).isSame(end, 'day');

                    var colorConfig = colors['Slot'];
                    if (debugging) console.log('colorConfig: ' + colorConfig);
                    

                    var backgroundColor = "#EEEEEE"; // Default background color

                    // Check if the event can still be booked based on hours in advance
                    if (moment(start) <= currentTime) {
                        backgroundColor = "#EEEEEE"; // Set background color to #EEEEEE
                    } else {
                        if (typeof colorConfig !== 'undefined') {
                            backgroundColor = colorConfig;
                        }
                        else backgroundColor = generateColor('Slot');
                    }

                    var eventObj = {
                        title: translations['slot'],
                        classNames: 'slot',
                        start: start,
                        end: end,
                        backgroundColor: backgroundColor,
                        cableName: slot.Fcol_boat_cable_name,
                        description: '',
                        textColor: textColor,
                        seats: slot.col_number_of_bookings,
                        price: translations['slotPrice'],
                        hoursInAdvance: 0,
                        isBookable: "yes",
                        checkinTime: "30",
                        bookedSeats: slot.total,
                        url: endpoint + '/',
                        allDay: 0,
                        // timeZone: 'America/New_York'
                    };

                    // Remove URL if the event is not bookable or starts within hours in advance
                    if (moment(start) <= currentTime) {
                        delete eventObj.url;
                    }
                    if(debugging) console.log('Adding slot:', eventObj);
                    events.push(eventObj);
                }
            });
        } else {
            console.error("Unexpected data format for Slots API response, got:", data);
        }
    }

    // Function to process the opening times API response
    function processOpeningTimesApiResponse(data, events) {
        // Get current time
        var currentTime = moment();

        // Iterate over the response object and process each day's opening hours
        for (var date in data) {
            var dayData = data[date]; 
            if (dayData.opening_times !== "closed") { // Check if not "closed"
                // Split the opening hours into start and end times
                var transportationName = dayData.transportation_name;
                var [startTime, endTime] = dayData.opening_times.split(' - ');

                var start = moment(date + 'T' + startTime, "YYYY-MM-DD HH:mm:ss").toDate();
                var end = moment(date + 'T' + endTime, "YYYY-MM-DD HH:mm:ss").toDate();

                var colorConfig = colors['Slot'];
                if (debugging) console.log('colorConfig: ' + colorConfig);
                

                var backgroundColor = "#EEEEEE"; // Default background color

                // Check if the event can still be booked based on hours in advance
                if (moment(end) <= currentTime) {
                    backgroundColor = "#EEEEEE"; // Set background color to #EEEEEE
                } else {
                    if (typeof colorConfig !== 'undefined') {
                        backgroundColor = colorConfig;
                    }
                    else backgroundColor = generateColor('Slot');
                }

                // Create the event object with the required properties
                var eventObj = {
                    title: translations['public_opening_hours'],
                    classNames: 'opening_hours',
                    start: start,
                    end: end,
                    backgroundColor: backgroundColor, // Use the defined backgroundColor
                    cableName: transportationName,
                    description: '',
                    textColor: textColor, // Use the defined textColor
                    seats: null,
                    price: translations['slotPrice'],
                    hoursInAdvance: 0,
                    isBookable: "yes",
                    checkinTime: "30",
                    bookedSeats: null,
                    url: 'https://' + park_subdomain + '.wakesys.com/',
                    allDay: false // Consider using false instead of 0 for clarity
                };
                // console.log('Adding openingTimes:', eventObj);

                // Remove URL if the event is not bookable or starts within hours in advance
                if (moment(end) <= currentTime) {
                    delete eventObj.url;
                }

                events.push(eventObj);
            } else {
                // console.log('Closed on:', date); // Log or handle closed days as needed
            }
        }
    }



    function fetchEventsFromApi() {
        var apiURL = endpoint + '/api/list_events.php';

        var colors = [
            {'Slot': '#88e645'}, // Slot / Regular Opening Hours
        ];

        var eventsToShow = [
            {'Slot': 'true'}, // Slot / Regular Opening Hours
        ];

        $.ajax({
            url: apiURL,
            dataType: 'jsonp',
            success: function (data) {
                if (Array.isArray(data)) {
                    data.forEach(function (event) {
                        console.log(event); // Log the entire event object
                        if (event && event.col_name !== undefined) {
                            var colorCode = generateColor(event.col_name);
                            var colorObj = {};
                            colorObj[event.ID_event] = colorCode;
                            colors.push(colorObj);
                            eventsToShow[event.ID_event] = true;
                        } else {
                            console.error("Event object or 'col_name' property undefined:", event);
                        }
                    });

                    var generatedColorsArrray = "var colors = {\n";
                    colors.forEach(function (color, index) {
                        var eventId = Object.keys(color)[0];
                        var colorCode = color[eventId];
                        var eventName;
                        if (eventId === 'Slot') {
                            eventName = 'Slot' // Regular Opening Hours';
                        } else {
                            var foundEvent = data.find(function (event) {
                                return event.ID_event === eventId;
                            });
                            if (foundEvent) {
                                eventName = foundEvent.col_name;
                            } else {
                                console.error("Event with ID_event " + eventId + " not found.");
                                eventName = "Unknown Event";
                            }
                        }
                        generatedColorsArrray += `    '${eventId}': '${colorCode}',   //${eventName}\n`;
                    });
                    generatedColorsArrray += "};";

                    var generatedShowEventsArray = "var eventsToShow = {\n";
                    colors.forEach(function (color, index) {
                        var eventId = Object.keys(color)[0];
                        var eventName;
                        if (eventId === 'Slot') {
                            eventName = 'Slot' // Regular Opening Hours';
                        } else {
                            var foundEvent = data.find(function (event) {
                                return event.ID_event === eventId;
                            });
                            if (foundEvent) {
                                eventName = foundEvent.col_name;
                            } else {
                                console.error("Event with ID_event " + eventId + " not found.");
                                eventName = "Unknown Event";
                            }
                        }
                        generatedShowEventsArray += `    '${eventId}': true,   //${eventName}\n`;
                    });
                    generatedShowEventsArray += "};";

                    showGeneratedArray(generatedColorsArrray + "\n\n" + generatedShowEventsArray);
                    // showGeneratedArray(generatedShowEventsArray);
                } else {
                    console.error("Unexpected data format from API:", data);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data from API:", error);
            }
        });
    }

    function showGeneratedArray(arrayString) {
        // HTML structure for the modal
        var modalHTML = `
            <div class="overlay" id="overlay">
                
                <div class="modal" id="modal">
                <div class="instructions">Please copy paste these settings inbetween the /* EVENTS CONFIGURATION START*/ AND /* EVENTS CONFIGURATION END*/ and overwrite the settings that are in there. Then change the color for each event as necessary in the colors Array, and then change the events to FALSE that you don't want to show in the calendar, in the eventsToShow Array.</div>
                    <span class="close" onclick="closeModal()">&times;</span>
                    <textarea id="generatedArrayTextarea" readonly>${arrayString}</textarea>
                </div>
            </div>
        `;

        // CSS styles for the modal
        var modalCSS = `
            .overlay {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5); /* semi-transparent black */
                z-index: 9999; /* make sure it's on top of everything */
            }
            .modal {
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
                z-index: 10000; /* make sure it's on top of the overlay */
            }
            .instructions {
                color: red;
                font-weight: bold;
                padding-bottom: 20px;
            }
            .close {
                position: absolute;
                top: 10px;
                right: 10px;
                cursor: pointer;
            }
            #generatedArrayTextarea {
                width: 100%;
                height: 100%;
            }
        `;

        // Inject CSS styles into the document
        var style = document.createElement('style');
        style.innerHTML = modalCSS;
        document.head.appendChild(style);

        // Inject HTML structure into the document
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Display the modal
        document.getElementById("overlay").style.display = "block";
    }

    function fetchTransportationsFromApi(callback) {
        // Check if transportationsArray is already populated
        if (transportationsArray.length > 0) {
            // If not empty, immediately call the callback with the existing data
            if (callback && typeof callback === 'function') {
                callback(transportationsArray);
            }
            return; // Exit the function to avoid making an API call
        }
        
        $.ajax({
            url: endpoint + '/api/list_transportations.php', // API endpoint
            dataType: 'jsonp', // Using JSONP for cross-domain requests
            success: function(data) {
                if (Array.isArray(data)) {
                    transportationsArray.length = 0; // Clear the array
                    data.forEach(function(item) {
                        transportationsArray.push(item);
                    });
                    // console.log("Transportations loaded:", transportationsArray);
                    if (callback && typeof callback === 'function') {
                        callback(transportationsArray); // Call the callback function with the populated array
                    }
                } else {
                    console.error("Unexpected data format from API:", data);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error fetching data from API:", error);
                if (callback && typeof callback === 'function') {
                    callback(null, error); // Call the callback with null data and an error
                }
            }
        });
    }
    
});