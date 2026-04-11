/**
 * Weather Widget - OpenWeatherMap Integration
 * Displays current weather and 5-day forecast for Raukeeyang Integrated Farm
 * Location: Ota, Ogun State, Nigeria (6.7°N, 3.57°E)
 *
 * This feature fetches real-time weather data from the OpenWeatherMap API to provide
 * visitors with current weather conditions and a 5-day forecast for the farm's location.
 * It enhances user experience by showing relevant environmental information for planning
 * farm visits or understanding local conditions affecting fresh produce availability.
 *
 * API Key: Uses a free tier OpenWeatherMap API key (replace with your own for production)
 * Data includes: temperature, humidity, wind speed, cloud coverage, and weather icons
 * Error handling: Displays user-friendly messages if API calls fail
 */

// Configuration
const WEATHER_CONFIG = {
    apiKey: '18f4323cc9f4fa3ffc93e97b8382210a',
    latitude: 6.7,
    longitude: 3.57,
    units: 'metric',
    endpoints: {
        current: 'https://api.openweathermap.org/data/2.5/weather',
        forecast: 'https://api.openweathermap.org/data/2.5/forecast'
    }
};

const DOM_SELECTORS = {
    currentWeather: '#currentWeather',
    forecastContainer: '#forecastContainer'
};

const FORECAST_LIMIT = 5;
const ICON_BASE_URL = 'https://openweathermap.org/img/wn/';

/**
 * Build query parameters for API requests
 * @returns {string} Query string
 */
function buildQueryString() {
    return `?lat=${WEATHER_CONFIG.latitude}&lon=${WEATHER_CONFIG.longitude}&appid=${WEATHER_CONFIG.apiKey}&units=${WEATHER_CONFIG.units}`;
}

/**
 * Fetch current weather from OpenWeatherMap API
 */
function fetchCurrentWeather() {
    const url = WEATHER_CONFIG.endpoints.current + buildQueryString();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => displayCurrentWeather(data))
        .catch(error => {
            console.error('Weather fetch error:', error);
            showWeatherError(DOM_SELECTORS.currentWeather, `Unable to load weather: ${error.message}`);
        });
}

/**
 * Display current weather data in DOM
 * @param {Object} data - Weather data from API
 */
function displayCurrentWeather(data) {
    if (!data?.main || !data?.weather?.[0]) {
        showWeatherError(DOM_SELECTORS.currentWeather, 'Invalid weather data received');
        return;
    }

    const { main, weather, wind, clouds } = data;
    const { temp, feels_like, humidity } = main;
    const { main: condition, icon, description } = weather[0];
    const { speed } = wind;
    const { all: cloudCoverage } = clouds;

    const iconUrl = `${ICON_BASE_URL}${icon}@2x.png`;

    const html = `
        <div class="weather-card">
            <img src="${iconUrl}" alt="${description}" class="weather-icon" loading="lazy">
            <div class="weather-info">
                <p class="temperature">${Math.round(temp)}°C</p>
                <p class="description">${condition}</p>
                <p class="details">Feels like: ${Math.round(feels_like)}°C</p>
                <p class="details">Humidity: ${humidity}%</p>
                <p class="details">Wind Speed: ${Math.round(speed)} m/s</p>
                <p class="details">Cloud Coverage: ${cloudCoverage}%</p>
            </div>
        </div>
    `;

    const element = document.querySelector(DOM_SELECTORS.currentWeather);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Fetch 5-day forecast from OpenWeatherMap API
 */
function fetchForecast() {
    const url = WEATHER_CONFIG.endpoints.forecast + buildQueryString();

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => displayForecast(data))
        .catch(error => {
            console.error('Forecast fetch error:', error);
            showWeatherError(DOM_SELECTORS.forecastContainer, `Unable to load forecast: ${error.message}`);
        });
}

/**
 * Group forecast data by day and extract noon entries
 * @param {Array} forecastList - List of forecast items from API
 * @returns {Object} Daily forecasts keyed by day
 */
function groupForecastsByDay(forecastList) {
    const dailyForecasts = {};

    forecastList.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayKey = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const hour = date.getHours();

        // Prefer noon (12:00) forecast, fallback to any available
        if (hour === 12 || !dailyForecasts[dayKey]) {
            dailyForecasts[dayKey] = item;
        }
    });

    return dailyForecasts;
}

/**
 * Display 5-day forecast in DOM
 * @param {Object} data - Forecast data from API
 */
function displayForecast(data) {
    if (!data?.list || !Array.isArray(data.list)) {
        showWeatherError(DOM_SELECTORS.forecastContainer, 'Invalid forecast data received');
        return;
    }

    const dailyForecasts = groupForecastsByDay(data.list);
    const days = Object.keys(dailyForecasts).slice(0, FORECAST_LIMIT);

    const forecastCards = days.map(day => {
        const forecast = dailyForecasts[day];
        const { main, weather, wind } = forecast;
        const { temp, humidity } = main;
        const { icon, main: condition } = weather[0];
        const { speed } = wind;
        const iconUrl = `${ICON_BASE_URL}${icon}.png`;

        return `
            <div class="forecast-card">
                <h4>${day}</h4>
                <img src="${iconUrl}" alt="${condition}" class="forecast-icon" loading="lazy">
                <p class="forecast-temp">${Math.round(temp)}°C</p>
                <p class="forecast-condition">${condition}</p>
                <p class="forecast-detail">Humidity: ${humidity}%</p>
                <p class="forecast-detail">Wind: ${Math.round(speed)} m/s</p>
            </div>
        `;
    }).join('');

    const element = document.querySelector(DOM_SELECTORS.forecastContainer);
    if (element) {
        element.innerHTML = forecastCards;
    }
}

/**
 * Display error message in weather section
 * @param {string} selector - DOM selector for target element
 * @param {string} message - Error message to display
 */
function showWeatherError(selector, message) {
    const element = document.querySelector(selector);
    if (element) {
        element.innerHTML = `<p style="color: #d32f2f; padding: 1rem; text-align: center;">${message}</p>`;
    }
}

/**
 * Validate required DOM elements exist
 * @returns {boolean} True if all required elements are present
 */
function validateDOM() {
    return !!(
        document.querySelector(DOM_SELECTORS.currentWeather) &&
        document.querySelector(DOM_SELECTORS.forecastContainer)
    );
}

/**
 * Initialize weather widget
 */
function initWeather() {
    if (!validateDOM()) {
        console.warn('Weather widget: Required DOM elements not found');
        return;
    }

    fetchCurrentWeather();
    fetchForecast();
}

/**
 * Initialize on DOM ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWeather);
} else {
    initWeather();
}
