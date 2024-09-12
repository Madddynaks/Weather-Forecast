// Open-Meteo API URLs
const API_BASE_URL = 'YOUR_API_KEY';
const API_PARAMS = "daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m&timezone=auto";

document.addEventListener('DOMContentLoaded', () => {
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const currentLocationBtn = document.getElementById('current-location-btn');
    const weatherDataDiv = document.getElementById('weather-data');
    const forecastContainer = document.getElementById('forecast');
    const errorMessage = document.getElementById('error-message');

    // Search by city name
    searchBtn.addEventListener('click', () => {
        const cityName = cityInput.value.trim();
        if (cityName) {
            getCityCoordinates(cityName).then(coords => {
                if (coords) {
                    fetchWeatherData(coords.latitude, coords.longitude, cityName);
                } else {
                    displayError('City not found.');
                }
            });
        }
    });

    // Search by current location
    currentLocationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                fetchWeatherData(latitude, longitude, 'Your Current Location');
            });
        } else {
            displayError('Geolocation is not supported by your browser.');
        }
    });

    // Fetch weather data from Open-Meteo API
    function fetchWeatherData(latitude, longitude, cityName) {
        const url = `${API_BASE_URL}latitude=${latitude}&longitude=${longitude}&${API_PARAMS}`;
        console.log("Fetching data from URL:", url);  // Log to ensure the correct URL is being requested
        
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Weather data could not be retrieved.");
                }
                return response.json();
            })
            .then(data => {
                console.log("Weather Data:", data);  // Log weather data to check
                displayWeatherData(data, cityName);
            })
            .catch(error => {
                console.error('Error fetching weather data:', error);
                displayError('Unable to fetch weather data. Please try again later.');
            });
    }

    // Get city coordinates using OpenCage Geocoding API
    function getCityCoordinates(cityName) {
        const geocodeAPI = `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=YOUR_API_KEY`;

        return fetch(geocodeAPI)
            .then(response => response.json())
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const coords = data.results[0].geometry;
                    console.log("Coordinates:", coords);  // Log coordinates to check if valid
                    return coords;
                } else {
                    return null;
                }
            })
            .catch(error => {
                console.error("Geocoding error:", error);
            });
    }

    // Display weather data in the UI
    function displayWeatherData(data, cityName) {
        const weatherData = data.daily;

        document.getElementById('location').textContent = cityName;
        document.getElementById('temperature').textContent = `Max Temp: ${weatherData.temperature_2m_max[0]}°C, Min Temp: ${weatherData.temperature_2m_min[0]}°C`;
        document.getElementById('wind').textContent = `Wind Speed: ${weatherData.windspeed_10m[0]} m/s`;
        document.getElementById('humidity').textContent = `Precipitation: ${weatherData.precipitation_sum[0]} mm`;

        weatherDataDiv.classList.remove('hidden');
        forecastContainer.innerHTML = ''; // Clear previous forecast

        // Display 5-day forecast
        for (let i = 0; i < 5; i++) {
            const forecastCard = document.createElement('div');
            forecastCard.classList.add('bg-blue-200', 'p-4', 'rounded-lg', 'text-center');
            forecastCard.innerHTML = `
                <p><strong>Day ${i + 1}</strong></p>
                <p>Max Temp: ${weatherData.temperature_2m_max[i]}°C</p>
                <p>Min Temp: ${weatherData.temperature_2m_min[i]}°C</p>
                <p>Wind Speed: ${weatherData.windspeed_10m[i]} m/s</p>
            `;
            forecastContainer.appendChild(forecastCard);
        }
    }

    // Display error message
    function displayError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        weatherDataDiv.classList.add('hidden');
    }
});
