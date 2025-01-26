    function makeTaggedRequest(ajaxOptions, type) {
    // console.log(`Initiating ${type} API call with options:`, ajaxOptions);
    return $.ajax(ajaxOptions).then(function(data, textStatus, jqXHR) {
        // console.log(`${type} API call successful with response:`, data);
        return [data, textStatus, jqXHR, type]; // Append the type to the response
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error(`${type} API call failed with status: ${textStatus}, error: ${errorThrown}`);
    });
}

function formatDate(date) {
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2);
    var day = ('0' + date.getDate()).slice(-2);
    return year + '-' + month + '-' + day;
}

function generateColor(eventName) {
    // Define base hue value
    var baseHue = 0;

    // Calculate hue based on event name's hash code
    var hash = 0;
    for (var i = 0; i < eventName.length; i++) {
        hash = eventName.charCodeAt(i) + ((hash << 5) - hash);
    }
    var hue = (baseHue + (hash % 360) + 360) % 360; // Ensure hue is within [0, 360] range

    // Convert hue to RGB color
    var rgbColor = hsvToRgb(hue / 360, 0.7, 0.9); // Saturation: 70%, Value: 90%

    // Convert RGB to hexadecimal color code
    var color = '#' + rgbToHex(rgbColor[0]) + rgbToHex(rgbColor[1]) + rgbToHex(rgbColor[2]);

    return color;
}

// Convert HSV to RGB color
function hsvToRgb(h, s, v) {
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// Convert RGB to hexadecimal color code
function rgbToHex(rgb) {
    var hex = rgb.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Function to close the modal
function closeModal() {
    document.getElementById("overlay").style.display = "none";
}

// Define a function to ensure the overlay exists and toggle its visibility
function toggleLoadingOverlay(show) {
    let overlay = document.getElementById('loadingOverlay');
    if (!overlay) {
        // Create overlay if it doesn't exist
        overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.style.position = 'absolute';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.display = 'none'; // Initially hidden
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';

        const loadingIndicator = document.createElement('div');
        loadingIndicator.innerText = translations['loading']+'...';
        // Adjust the font size and color here
        loadingIndicator.style.fontSize = '1em'; 
        loadingIndicator.style.color = 'white'; 
        loadingIndicator.style.padding = '20px';
        loadingIndicator.style.borderRadius = '5px';
        loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'; // Optional: Add background color to the text for better visibility
        overlay.appendChild(loadingIndicator);

        // Append the overlay to the calendar element or its parent for relative positioning
        const calendarEl = document.getElementById('wakesys_calendar');
        calendarEl.style.position = 'relative';
        calendarEl.appendChild(overlay);
    }
    // Toggle visibility based on 'show' parameter
    overlay.style.display = show ? 'flex' : 'none';
}