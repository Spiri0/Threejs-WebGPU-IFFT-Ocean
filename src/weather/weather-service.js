// Weather service for fetching data from YR.no API

const API_BASE_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
const USER_AGENT = 'Threejs-WebGPU-Ocean/1.0 github.com/ztffn/Threejs-WebGPU-IFFT-Ocean';

// Named locations for quick access
export const namedLocations = {
  'North Atlantic': { lat: 51.5, lon: -30.0, altitude: 0 },
  'Caribbean Sea': { lat: 18.0, lon: -75.0, altitude: 0 },
  'Pacific Ocean': { lat: 20.0, lon: -155.0, altitude: 0 },
  'Mediterranean Sea': { lat: 38.0, lon: 15.0, altitude: 0 },
  'Arctic Ocean': { lat: 75.0, lon: 0.0, altitude: 0 },
  'Southern Ocean': { lat: -60.0, lon: 0.0, altitude: 0 },
  'Oslo, Norway': { lat: 59.91, lon: 10.75, altitude: 0 },
  'San Francisco, CA': { lat: 37.77, lon: -122.42, altitude: 0 },
  'Sydney, Australia': { lat: -33.87, lon: 151.21, altitude: 0 },
  'Tokyo, Japan': { lat: 35.68, lon: 139.76, altitude: 0 },
  'Mumbai, India': { lat: 19.07, lon: 72.88, altitude: 0 },
  'Rio de Janeiro, Brazil': { lat: -22.91, lon: -43.17, altitude: 0 },
};

export class WeatherService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 15 * 60 * 1000; // 15 minutes
    this.lastRequest = 0;
    this.minRequestInterval = 1000; // 1 second between requests
  }

  /**
   * Fetch weather data for given coordinates
   * @param {number} lat - Latitude in decimal degrees
   * @param {number} lon - Longitude in decimal degrees
   * @param {number} altitude - Altitude in meters (optional)
   * @returns {Promise<Object>} Weather data
   */
  async fetchWeather(lat, lon, altitude = 0) {
    // Validate coordinates
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Check cache
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('Using cached weather data');
      return cached.data;
    }

    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise(resolve =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    // Build URL
    const url = new URL(API_BASE_URL);
    url.searchParams.set('lat', lat.toFixed(4));
    url.searchParams.set('lon', lon.toFixed(4));
    if (altitude) {
      url.searchParams.set('altitude', altitude.toFixed(0));
    }

    try {
      this.lastRequest = Date.now();

      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Return cached data if available, even if expired
      if (cached) {
        console.log('Using expired cached data due to error');
        return cached.data;
      }
      throw error;
    }
  }

  /**
   * Get current location using Geolocation API
   * @returns {Promise<Object>} Location object with lat, lon
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            altitude: position.coords.altitude || 0,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Fetch weather for current location
   * @returns {Promise<Object>} Weather data
   */
  async fetchCurrentLocationWeather() {
    const location = await this.getCurrentLocation();
    return this.fetchWeather(location.lat, location.lon, location.altitude);
  }

  /**
   * Fetch weather for a named location
   * @param {string} locationName - Name of the location
   * @returns {Promise<Object>} Weather data
   */
  async fetchNamedLocation(locationName) {
    const location = namedLocations[locationName];
    if (!location) {
      throw new Error(`Unknown location: ${locationName}`);
    }
    return this.fetchWeather(location.lat, location.lon, location.altitude);
  }

  /**
   * Extract current weather conditions from API response
   * @param {Object} weatherData - Weather data from API
   * @returns {Object} Current conditions
   */
  getCurrentConditions(weatherData) {
    if (!weatherData || !weatherData.properties || !weatherData.properties.timeseries) {
      throw new Error('Invalid weather data format');
    }

    // Get the first (current) time entry
    const current = weatherData.properties.timeseries[0];

    return {
      time: current.time,
      instant: current.data.instant.details,
      next1Hours: current.data.next_1_hours,
      next6Hours: current.data.next_6_hours,
    };
  }

  /**
   * Get forecast for next N hours
   * @param {Object} weatherData - Weather data from API
   * @param {number} hours - Number of hours to forecast
   * @returns {Array<Object>} Forecast entries
   */
  getForecast(weatherData, hours = 24) {
    if (!weatherData || !weatherData.properties || !weatherData.properties.timeseries) {
      throw new Error('Invalid weather data format');
    }

    const forecast = [];
    const maxTime = Date.now() + hours * 60 * 60 * 1000;

    for (const entry of weatherData.properties.timeseries) {
      const entryTime = new Date(entry.time).getTime();
      if (entryTime <= maxTime) {
        forecast.push({
          time: entry.time,
          instant: entry.data.instant.details,
          next1Hours: entry.data.next_1_hours,
          next6Hours: entry.data.next_6_hours,
        });
      } else {
        break;
      }
    }

    return forecast;
  }

  /**
   * Clear the weather cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      entries: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Create singleton instance
export const weatherService = new WeatherService();
