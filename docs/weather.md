# Location-Based Weather System

This document describes the implementation of real-time weather integration using YR.no meteorological data, inspired by the 3D weather visualization approach from [cartuhok/3d-weather-codrops](https://github.com/cartuhok/3d-weather-codrops).

## Overview

The weather system transforms real-world meteorological data into immersive ocean and atmospheric environments, creating a dynamic connection between actual weather conditions and the 3D visualization.

## Architecture

### 1. Data Source: YR.no API

We use the Norwegian Meteorological Institute's free weather API for accurate, global weather data.

**API Endpoint:**
```
https://api.met.no/weatherapi/locationforecast/2.0/compact
```

**Required Parameters:**
- `lat`: Latitude (decimal degrees)
- `lon`: Longitude (decimal degrees)
- `altitude`: Ground elevation in meters (optional but recommended)

**Required Headers:**
- `User-Agent`: Must identify your application (e.g., "Ocean-Visualizer/1.0 contact@example.com")

### 2. Weather Data Structure

The API returns forecast data with these key properties:

```json
{
  "properties": {
    "timeseries": [
      {
        "time": "2025-11-23T12:00:00Z",
        "data": {
          "instant": {
            "details": {
              "air_temperature": 15.2,
              "wind_speed": 8.5,
              "wind_from_direction": 225,
              "cloud_area_fraction": 75,
              "fog_area_fraction": 0,
              "relative_humidity": 82
            }
          },
          "next_1_hours": {
            "summary": {
              "symbol_code": "cloudy"
            },
            "details": {
              "precipitation_amount": 0.5
            }
          }
        }
      }
    ]
  }
}
```

### 3. Weather-to-Ocean Mapping

The system maps meteorological parameters to ocean simulation values:

#### Wind Parameters
- **wind_speed** (m/s) → Ocean wind speed (direct mapping)
- **wind_from_direction** (degrees) → Wind direction in radians
- Higher wind speeds increase wave height and fetch

#### Wave Characteristics
- **symbol_code** → Determines wave preset base
  - `clearsky_*` → Calm preset
  - `fair_*`, `partlycloudy_*` → Moderate preset
  - `cloudy`, `rain` → Rough preset
  - `heavyrain`, `sleet`, `snow` → Storm preset

#### Atmospheric Parameters
- **cloud_area_fraction** (0-100) → Sky turbidity
  - 0-20%: turbidity 2-5
  - 20-50%: turbidity 5-10
  - 50-80%: turbidity 10-15
  - 80-100%: turbidity 15-20

- **fog_area_fraction** (0-100) → Distance fog density

- **air_temperature** (°C) → Color temperature adjustments
  - Cold (<0°C): Bluish tint
  - Moderate (0-20°C): Neutral
  - Warm (>20°C): Warmer tones

#### Precipitation Effects
- **precipitation_amount** (mm) → Rain particle systems
  - 0-0.5mm: No rain
  - 0.5-2mm: Light rain
  - 2-10mm: Moderate rain
  - >10mm: Heavy rain

### 4. Location Selection

Users can select locations via:

#### Geolocation API
```javascript
navigator.geolocation.getCurrentPosition((position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  fetchWeather(lat, lon);
});
```

#### Named Locations
Predefined coordinates for famous ocean locations:
- North Atlantic
- Caribbean Sea
- Pacific Ocean
- Mediterranean Sea
- Arctic Ocean
- Southern Ocean

#### Custom Coordinates
Manual input of latitude/longitude values.

### 5. Update Frequency

Weather data updates:
- **Automatic**: Every 15 minutes
- **Manual**: User-triggered refresh
- **Caching**: Browser caches API responses per YR.no recommendations

### 6. Visual Effects Integration

#### 3D Particle Systems
Based on precipitation type:
- **Rain**: Streaked particles falling at terminal velocity
- **Snow**: Slow-falling crystalline particles
- **Fog**: Volumetric fog using distance-based density

#### Dynamic Lighting
- Sun position from forecast data
- Cloud shadows via ambient occlusion
- Atmospheric scattering adjusted for conditions

#### Ocean Surface
- Wave spectrum modified by wind data
- Foam distribution based on wind speed
- Swell characteristics from sustained wind direction

### 7. Time-of-Day Simulation

The system can visualize forecast data at specific times:
- Extract sun position from time and location
- Adjust lighting and atmosphere accordingly
- Support time-lapse through forecast periods

## Implementation Details

### Weather Service (`weather/weather-service.js`)
Handles API communication and data parsing.

### Weather Presets (`weather/weather-presets.js`)
Defines mappings between weather conditions and ocean parameters.

### Weather Controller (`weather/weather-controller.js`)
Manages weather state and updates to ocean/sky systems.

### Weather GUI (`weather/weather-gui.js`)
User interface for location selection and weather visualization control.

## Example Usage

```javascript
// Initialize weather system
const weatherSystem = new WeatherController({
  scene: scene,
  ocean: oceanManager,
  sky: skybox,
  gui: guiInstance
});

// Fetch weather for current location
weatherSystem.fetchCurrentLocation();

// Or use specific coordinates
weatherSystem.fetchWeather(59.91, 10.75); // Oslo, Norway

// Apply weather preset manually
weatherSystem.applyPreset('storm');

// Get current weather conditions
const conditions = weatherSystem.getCurrentConditions();
```

## API Usage Guidelines

Per YR.no terms of service:
1. **User-Agent Required**: All requests must include a valid User-Agent
2. **Rate Limiting**: No more than 20 requests per second
3. **Caching**: Cache responses to minimize requests
4. **Attribution**: Display "Weather data from MET Norway" when using the API

## Error Handling

The system gracefully handles:
- Network failures → Falls back to last known weather or default preset
- Invalid coordinates → Prompts user for correction
- API rate limits → Implements exponential backoff
- Missing data → Uses interpolation or defaults

## Future Enhancements

Potential additions:
- **Nowcast API**: More precise short-term forecasts for Nordic regions
- **Ocean Forecast API**: Wave height and period from marine forecasts
- **MetAlerts API**: Weather warnings and alerts
- **Historical Data**: Replay past weather events
- **Forecast Playback**: Animate through upcoming forecast periods
