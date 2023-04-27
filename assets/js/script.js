
// API Keys, would include in a .env file but then the application wouldn't deploy.
const apiKey = '56cc8773d84f312c66cf68f01cfe031b';

// Setting some variables to refer to some of the elements on the page.
let zuluTime = $('zulu-time');
let locationOptions = $('#location-options');
let locationPrevious = $('#location-previous');
let locations;

// Set global variable to keep track of latitude, longitude, name, and forecast.
let thisLatitude;
let thisLongitude;
let thisName;
let forecast; 

// Only display 5 of the 8 days that the API returns.
const ForecastDays = 5;

// Check to see if locations are stored in localstorage, if they are load them, if not create a new empty list.
try
{
    locations = JSON.parse(localStorage.getItem('locations'));
    if (locations == null) {
        locations = [];
    }
} catch (error) {
    console.log(error);
}

// Code to remove locations from the page and localstorage list.
function removeLocation(name) {
    for (let i = 0; i < locations.length; i++) {
        if (locations[i].name == name) {
            locations.splice(i, 1);
        }
    }
    localStorage.setItem('locations', JSON.stringify(locations));
    $('#today').html(`<div class="col p-5 d-flex align-items-start">
                            <div class="icon-square rounded text-body-emphasis d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3" style="background-color: #565e64" >
                            </div>
                            <div>
                            <h5 class="fs-2">${name} Removed</h5>
                            <hr/>
                            <p>Use the search to display weather for a different area.</p>
                            </div>
                        </div>`);
    $('#five-day').html('');
    updateLocations();
}

// Stores the data into localstorage.
function storeData(name, forecast, data) {
    
    let newLocation = {
        name: name,
        forecast: forecast,
        data: data
    }
    /* Prevent duplicates. */
    let hasDuplicates = false;
    for (let i = 0; i < locations.length; i++) {
        if (locations[i].name === name) {
            hasDuplicates = true;
        }
    }
    if (hasDuplicates === false) {
        locations.push(newLocation);
        localStorage.setItem('locations', JSON.stringify(locations));
        updateLocations();  
    }
}

// Updates the locations when it is called, or every 10 minutes.
function updateLocations() {
    locationPrevious.html('');
    let locations = JSON.parse(localStorage.getItem('locations'));
    let locationOptions = '';
    try {
        for (let i = 0; i < locations.length; i++) {
            locationOptions += `<li><a class=" dropdown-item" onclick="getToday('${locations[i].name}',${locations[i].forecast.coord.lat},${locations[i].forecast.coord.lon}); return false;" class="saved-weather m-2 w-100">${locations[i].name}</a></li>`;
        }
    } catch (error) {
        // console.log(error);
    }
    let addS = '';
    if (locations.length == 1) {
        addS = '';
    } else {
        addS = 's';
    }
    let locationButtons = `<div class="m-2 w-100 text-center fade-in">
        <h6>Previous Searches</h6>
        <div class="dropdown">
            <button class="w-100 btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${locations.length} Previous Option${addS}
            </button>
            <ul class="w-100 dropdown-menu">
                ${locationOptions}
            </ul>
        </div>
    </div>`;
    locationPrevious.html(locationButtons);
    
}

// Function to convert Kelvin to Fahrenheit.
function kelvinToFahrenheit(kelvin) {
    let fahrenheit = 1.8 * (kelvin - 273) + 32;
    return fahrenheit;
}

// Get the weather for today.
function getToday(text, latitude, longitude) {
    thisName = text;
    thisLatitude = latitude;
    thisLongitude = longitude;
    let apiURL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&exclude=hourly&appid=${apiKey}`;
    fetch(apiURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
            forecast = response;
            buildForecast(text, response);
            getFiveDay(text, latitude, longitude);
            $('#location').val('');
    })
}

// Get the 8 day forecast, but only process 5 days (those were the instructions).
function getFiveDay(text, latitude, longitude)  {
    let apiURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&exclude=hourly&appid=${apiKey}`;
    fetch(apiURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
            buildFiveDayForecast(text, response);
    })
}

// Get the average of an array of numbers.
function getAverage(elements) {
    let sum = 0;
    for (let i = 0; i < elements.length; i++) {
        sum = sum + elements[i];
    }
    return sum/elements.length;
}

// Build up the five day forecast.
function buildFiveDayForecast(text, forecast) {
    $('#five-day').html(`<h2 class="text-center">Five Day Forecast</h2>`)
    let fiveDayHTML = '';
    let dailyValues = [];
    let newLow = 400;

    let newHigh = 0;
    let dayCount = 0;

    let timeAtHighest;
    let timeAtLowest;

    for (let i = 0; i < forecast.list.length; i++) {

        let thisDay = dayjs(forecast.list[i].dt_txt).format('YYYY-MM-DD');


        if (dailyValues[thisDay]) {
            // FInd min/max.
            if (forecast.list[i].main.temp <= dailyValues[thisDay].low)
            {
                newLow = forecast.list[i].main.temp;
                timeAtLowest = forecast.list[i].dt_txt;
            } else if (forecast.list[i].main.temp >= dailyValues[thisDay].high) {
                newHigh = forecast.list[i].main.temp;
                timeAtHighest = forecast.list[i].dt_txt;
                
            }

            dailyValues[thisDay] = {
                average: forecast.list[i].main.temp + dailyValues[thisDay].average,
                low: newLow, 
                high: newHigh,
                timeHigh: timeAtHighest,
                timeLow: timeAtLowest,                
                count: dailyValues[thisDay].count + 1,
                icon: forecast.list[i].weather[0].icon,
                wind: forecast.list[i].wind.speed + dailyValues[thisDay].wind,
                humidity: forecast.list[i].main.humidity + dailyValues[thisDay].humidity
            }

        } else {
            dailyValues[thisDay] = {
                average: forecast.list[i].main.temp,
                low: forecast.list[i].main.temp,
                high: forecast.list[i].main.temp,
                timeLow: timeAtLowest,
                timeHigh: timeAtHighest,
                count: 1, 
                icon: forecast.list[i].weather[0].icon,
                wind: forecast.list[i].wind.speed,
                humidity: forecast.list[i].main.humidity
            };
        }

    }
    
    // Go through each day and build the foreast.
    for (const dayValues in dailyValues) {
        if (dayCount < ForecastDays) {      
            console.log(forecast);     
            console.log(dailyValues[dayValues].timeLow);
            timeAtHighest = dayjs(dailyValues[dayValues].timeLow, 'YYYY-MM-DD HH:mm:ss').utcOffset(forecast.city.timezone/60).format('HH:mm');
            timeAtLowest = dayjs(dailyValues[dayValues].timeHigh, 'YYYY-MM-DD HH:mm:ss').utcOffset(forecast.city.timezone/60).format('HH:mm');
            console.log(timeAtHighest);
            console.log(timeAtLowest);

            fiveDayHTML += `<div class="col-5 col-md-2 text-center p-0 five-day-forecast rounded fade-in">
                ${dayValues}<br/>${dayjs(dayValues).format('dddd')}<br/>
                <img class="day-icon icon-square rounded text-body-emphasis d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3" style="background-color: #ddd" src="https://openweathermap.org/img/wn/${dailyValues[dayValues].icon}@2x.png"><br/>  
                High: ${kelvinToFahrenheit(dailyValues[dayValues].high).toFixed(2)}° F<br/>at ${timeAtHighest}<br/>
                Low: ${kelvinToFahrenheit(dailyValues[dayValues].low).toFixed(2)}° F<br/>at ${timeAtLowest}<br/>
                Wind: ${(dailyValues[dayValues].wind/dailyValues[dayValues].count).toFixed(2)} MPH<br/>
                Hum: ${(dailyValues[dayValues].humidity/dailyValues[dayValues].count).toFixed(2)}%
            </div>`;
        }
        dayCount++;
    }

    $('#five-day').append(fiveDayHTML);
}

// Build the forecast for the day.
function buildForecast(text, forecast) {
    locationOptions.html('');
    let outputHTML = `<div class="col d-flex align-items-start fade-in">
                        <div class="icon-square rounded text-body-emphasis bg-body-tertiary d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3" style="background-color: white" >
                            <img class="day-icon icon-square rounded text-body-emphasis d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3" style="background-color: #ddd" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png"><br/>
                            
                        </div>
                        <div id="weather">
                            <h5 class="align-self-middle m-2 fs-2">${text}<a class="m-2 btn btn-danger mt-0 fade-in" onclick="removeLocation('${text}');" return false;>X</a></h5>
                            <p class="m-2"><span id="location-time">XXXXXXXXX, XXXXXXXX XX, XXXX XX:XX:XXXXX:00</span></p>
                            <p class="m-2">${forecast.coord.lat}, ${forecast.coord.lon}</p>
                            <hr/>
                            <p>${kelvinToFahrenheit(forecast.main.temp).toFixed(2)}° F, ${forecast.weather[0].description.toUpperCase()}</p>
                            <p>High: ${kelvinToFahrenheit(forecast.main.temp_max).toFixed(2)}° F,  Low: ${kelvinToFahrenheit(forecast.main.temp_min).toFixed(2)}° F</p>
                            <p>Humidity: ${forecast.main.humidity}%</p>
                            <p>Wind: ${forecast.wind.speed} MPH, ${forecast.wind.deg} Degrees</p>
                        </div>
                    </div>`;
    $('#today').html(outputHTML).fadeIn();
    storeData(text, forecast, outputHTML);
}

// Display options in the dropdown menu on the left side.
function displayOptions(options) {
    console.log(options.length);
    let responseHTML = '';
    for (let i = 0; i < options.length; i++) {
        let displayName = '';
        if (typeof options[i].name !== 'undefined') {
            displayName += options[i].name;
        }
        if (typeof options[i].state !== 'undefined') {
            displayName += ", " + options[i].state;
        }
        if (typeof options[i].country !== 'undefined') {
            displayName += ", " + options[i].country;
        }
        responseHTML += `<li><a class="dropdown-item" onclick="getToday('${displayName}',${options[i].lat},${options[i].lon}); return false;">${displayName}</a></li>`;
    }
    let addS = '';
    if (options.length == 1) {
        addS = '';
    } else {
        addS = 's';
    }
    locationOptions.html(`
    <div class="m-2 text-center fade-in">
        <p>There were a few results for "${options[0].name}".</p>
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${options.length} Option${addS}
            </button>
            <ul class="dropdown-menu">
                ${responseHTML}
            </ul>
        </div>
    </div>`);
}

function displayNoOptions() {
    locationOptions.html("No locations found for that search.");
}

// Calls the weather for the location specified in the location text input.
function callWeatherFor(event) {
    event.preventDefault();
    let location = $('#location').val();
    let apiURL = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;
    if (location !== '')
    {
        fetch(apiURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => {
            console.log(response);
            if (response.length > 0) {
                displayOptions(response);
                
            } else {
                displayNoOptions();
            }
        })
    }
}

// Set a timer every second to update the times, and if a locatoin is loaded, the time of that location.
window.setInterval(function() {
    $("#local-time").html(dayjs().format('dddd, MMMM DD, YYYY HH:mm:ssZ'));
    $("#zulu-time").html(dayjs().utc().format('dddd, MMMM DD, YYYY HH:mm:ssZ'));
    try { 
        $("#location-time").html(dayjs().utcOffset(forecast.timezone/60).format('dddd, MMMM DD, YYYY HH:mm:ssZ'));
    } catch {
    }
}, 1000)

// Weather condition updates every 10 minutes.
window.setInterval(function() {
    try {
        getToday(thisName, thisLatitude, thisLongitude);
        getFiveDay(thisName, thisLatitude, thisLongitude)
    } catch (error) {
        console.log(error);
        console.log("No location loaded.");
    }
    console.log("Update.");
}, 600000)

// On load, create a listener to call the weather for the location listed in the location text input.
$(function () {
    $('#submit').on('click', callWeatherFor);
    try
    {
        updateLocations();;
    } catch (error) {
            console.log(error);
    }
});
