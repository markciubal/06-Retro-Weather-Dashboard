const apiKey = '56cc8773d84f312c66cf68f01cfe031b';
const nasaKey = '1Gmq9IgfdmLpDj35vHxqVvtjlq6u7jbXo0tpA8jg';

let locationOptions = $('#location-options');

$(function () {
    function kelvinToFahrenheit(kelvin) {
        let fahrenheit = 1.8 * (kelvin - 273) + 32;
        return fahrenheit;
    }

    function buildForecast(forecast) {
        console.log(forecast);
        for (let i = 0; i < forecast.list.length; i++) {
            console.log(forecast.list[i]);
            $('#five-day').append(`<h1>${dayjs(forecast.list[i].dt_txt)}</h1>`);
            $('#five-day').append(`<h2>${kelvinToFahrenheit(forecast.list[i].main.temp).toFixed(2)}F</h2>`);
            $('#five-day').append(`<h1>${forecast.list[i].weather[0].main}</h1>`);
        }
    }
    function displayOptions(options) {
        let responseHTML = '';
        for (let i = 0; i < options.length; i++) {
            responseHTML += `<li><a class="dropdown-item" href="#">${options[i].name}, ${options[i].state}, ${options[i].country}</a></li>`;
        }
        locationOptions.html(`
        <p>There were a few results for "${options[0].name}".</p>
        <div class="dropdown">
            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown button
            </button>
            <ul class="dropdown-menu">
                ${responseHTML}
            </ul>
        </div>
        `);
    }
    function callLatLong(latitude, longitude) {
        let apiURL = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&exclude=hourly,daily&appid=${apiKey}`;
        fetch(apiURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        })
        .then(response => response.json())
        .then(response => {
                console.log(response);
                buildForecast(response);
        })
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
                    displayOptions(response);
                }
                console.log(locationOptions.innerHTML);
            })
        }
    }
    $('#submit').on('click', callWeatherFor);
});
