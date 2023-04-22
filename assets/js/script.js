const apiKey = '56cc8773d84f312c66cf68f01cfe031b';
const nasaKey = '1Gmq9IgfdmLpDj35vHxqVvtjlq6u7jbXo0tpA8jg';
let zuluTime = $('zulu-time');
let locationOptions = $('#location-options');
let locationPrevious = $('#location-previous');
let locations;
try
{
    locations = JSON.parse(localStorage.getItem('locations'));
    if (locations == null) {
        locations = [];
    }
    console.log(locations);
} catch (error) {
    console.log(error);
}

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

function updateLocations() {
    locationPrevious.html('');
    let locations = JSON.parse(localStorage.getItem('locations'));
    let locationButtons = '';
    try {
        for (let i = 0; i < locations.length; i++) {
            locationButtons += `<button onclick="callLatLong('${locations[i].name}',${locations[i].forecast.coord.lat},${locations[i].forecast.coord.lon}); return false;" class="saved-weather m-2 w-100">${locations[i].name}</button>`;
        }
    } catch (error) {
        console.log(error);
    }
    locationPrevious.append(locationButtons);
    
}
function kelvinToFahrenheit(kelvin) {
    let fahrenheit = 1.8 * (kelvin - 273) + 32;
    return fahrenheit;
}

function callLatLong(text, latitude, longitude) {
    let apiURL = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&exclude=hourly&appid=${apiKey}`;
    fetch(apiURL, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
    .then(response => response.json())
    .then(response => {
            buildForecast(text, response);
    })
}

function buildForecast(text, forecast) {
    console.log(forecast);
    let outputHTML = `<div class="col p-5 d-flex align-items-start">
                        <div class="icon-square rounded text-body-emphasis bg-body-secondary d-inline-flex align-items-center justify-content-center fs-4 flex-shrink-0 me-3" style="background-color: white" >
                        <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png"><br/>
  
                        </div>
                        <div>
                        <h5 class="fs-2">${text}</h5>
                        <hr/>
                        <p>${forecast.weather[0].description.toUpperCase()}</p>
                        <p>High: ${kelvinToFahrenheit(forecast.main.temp_max).toFixed(2)}° F | Low: ${kelvinToFahrenheit(forecast.main.temp_min).toFixed(2)}° F</p>
                        <p>Right Now: ${kelvinToFahrenheit(forecast.main.temp).toFixed(2)}° F | Humidity: ${forecast.main.humidity}%</p>
                        <a href="#" class="btn btn-primary">
                            Primary button
                        </a>
                        </div>
                    </div>`;
    $('#five-day').html(outputHTML);
    storeData(text, forecast, outputHTML);
}

function displayOptions(options) {
    let responseHTML = '';
    for (let i = 0; i < options.length; i++) {
        responseHTML += `<li><a class="dropdown-item" onclick="callLatLong('${options[i].name}, ${options[i].state}, ${options[i].country}',${options[i].lat},${options[i].lon}); return false;">${options[i].name}, ${options[i].state}, ${options[i].country}</a></li>`;
    }
    locationOptions.html(`
    <div class="m-2 text-center">
        <p>There were a few results for "${options[0].name}".</p>
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${options.length} Options
            </button>
            <ul class="dropdown-menu">
                ${responseHTML}
            </ul>
        </div>
    </div>`);
}

function callWeatherFor(event) {
    event.preventDefault();
    let location = $('#location').val();
    let apiURL = `http://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=5&appid=${apiKey}`;
    console.log(apiURL);
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
            if (response.length > 1) {
                console.log(response);
                displayOptions(response);
                
            }
            console.log(response);
            console.log(locationOptions.innerHTML);
        })
    }
}
window.setInterval(function() {
    $("#zulu-time").html(dayjs().format('dddd, MMMM DD, YYYY HH:mm:ss '));
}, 1000)

$(function () {
    $('#submit').on('click', callWeatherFor);
    updateLocations();
 
});
