const apiKey = '56cc8773d84f312c66cf68f01cfe031b';

$(function () {
    function kelvinToFahrenheit(kelvin) {
        let fahrenheit = 1.8 * (kelvin - 273) + 32;
        return fahrenheit;
    }

    function buildForecast(forecast) {
        for (let i = 0; i < forecast.list.length; i++) {
            console.log(forecast.list[i]);
            $('#five-day').append(`<h1>${forecast.list[i].dt_txt}</h1>`);
            $('#five-day').append(`<h2>${kelvinToFahrenheit(forecast.list[i].main.temp).toFixed(2)}</h2>`);
            $('#five-day').append(`<h1>${forecast.list[i].weather[0].main}</h1>`);
        }
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

    function callWeatherFor(e) {
        e.preventDefault();
        let city = $('#city').val();
        let state = $('#state').val();
        let apiURL = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&limit=1&appid=${apiKey}`;
        console.log(apiURL);
        if (city !== '' && state !== '')
        {
            fetch(apiURL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
            .then(response => response.json())
            .then(response => callLatLong(response[0].lat, response[0].lon))
        }
    }
    $('#submit').on('click', callWeatherFor);
});
