# Weather System Implementation Guide

## Overview

The immersive weather system integrates real-world meteorological data from YR.no with the ocean simulation, providing dynamic weather conditions, atmospheric effects, and customizable presets.

## Features

### 1. **Weather Presets**
Six built-in presets that define complete ocean and atmospheric conditions:
- **Calm**: Peaceful waters with clear skies
- **Moderate**: Typical ocean conditions
- **Rough**: Choppy seas with strong winds
- **Storm**: Extreme conditions with massive waves
- **Tropical**: Warm tropical waters
- **Arctic**: Cold northern waters

### 2. **Location-Based Weather**
Fetch real-time weather data from YR.no for any location:
- Use current GPS location
- Select from named ocean locations
- Enter custom coordinates (latitude/longitude)
- Automatic updates every 15 minutes (optional)

### 3. **Custom Presets**
Create and save your own weather configurations:
- Adjust all wave, sky, and atmospheric parameters
- Save custom presets with names
- Export/import presets as JSON files
- Stored in browser localStorage

### 4. **Atmospheric Effects**
Dynamic visual effects based on weather:
- **Fog**: Distance fog with adjustable density and color
- **Rain**: Particle system with intensity control
- **Sky**: Dynamic sky with atmospheric scattering

## Quick Start

### Using Presets

1. Open the GUI panel (default: top-right of screen)
2. Expand the "Weather System" folder
3. Select a preset from the "Preset" dropdown
4. The ocean and atmosphere will update immediately

### Using Location-Based Weather

1. Open "Weather System" → "Location Weather"
2. Choose a method:
   - **Named Location**: Select from dropdown (e.g., "North Atlantic")
   - **Custom Coordinates**: Enter latitude/longitude manually
   - **Current Location**: Click "📍 Use My Location"
3. Click "🌦️ Fetch Weather"
4. The system will apply real-time weather conditions
5. Optionally enable "Auto Update" for continuous updates

### Creating Custom Presets

1. Adjust parameters in the GUI:
   - First/Second Wave Spectrum settings
   - Foam settings
   - Sky settings
   - Ocean rendering options
2. Open "Weather System" → "Custom Presets"
3. Enter a name for your preset
4. Click "💾 Save Current Settings"
5. Your preset is saved to localStorage

### Exporting/Importing Presets

**Export:**
1. Configure your desired settings
2. Click "📤 Export Settings"
3. A JSON file will be downloaded

**Import:**
1. Click "📥 Import Settings"
2. Select a previously exported JSON file
3. The preset will be loaded and applied

## Architecture

### Module Structure

```
src/weather/
├── weather-controller.js      # Main controller with GUI integration
├── weather-presets.js         # Preset definitions and weather mapping
├── weather-service.js         # YR.no API integration
├── atmospheric-effects.js     # Fog and rain particle systems
└── index.js                   # Module exports
```

### Key Classes

#### `WeatherController`
Main component that manages weather state and coordinates all systems.

**Key Methods:**
- `applyPreset(name)`: Apply a named preset
- `fetchAndApplyWeather()`: Fetch and apply real-time weather
- `saveCustomPreset()`: Save current settings as custom preset
- `exportCurrentSettings()`: Export settings to JSON file

#### `weatherService`
Singleton service for YR.no API communication.

**Key Methods:**
- `fetchWeather(lat, lon, altitude)`: Fetch weather for coordinates
- `fetchCurrentLocationWeather()`: Fetch weather for current location
- `getCurrentConditions(data)`: Extract current conditions from API response

#### `AtmosphericEffects`
Manages fog and rain particle systems.

**Key Methods:**
- `setFog(density, color)`: Configure fog
- `setRain(intensity)`: Configure rain
- `update(deltaTime)`: Update particle systems

### Weather Data Flow

```
YR.no API
    ↓
weatherService.fetchWeather()
    ↓
mapWeatherToOceanParams()
    ↓
WeatherController.applyWeatherData()
    ↓
┌─────────────┬──────────────┬─────────────────┐
│   Waves     │     Sky      │   Atmosphere    │
└─────────────┴──────────────┴─────────────────┘
```

## Parameter Reference

### Wave Spectrum Parameters

**First Wave Spectrum:**
- `depth`: Water depth in meters
- `scaleHeight`: Wave height multiplier (0-3)
- `windSpeed`: Wind speed in m/s (0.01-25)
- `windDirection`: Wind direction in radians (0-2π)
- `fetch`: Distance wind blows over water in meters
- `spreadBlend`: Directional spread (0-1)
- `swell`: Long-period swell component (0-1)
- `peakEnhancement`: Phillips spectrum peak (1-5)
- `shortWaveFade`: Small wave fade factor
- `fadeLimit`: Fade cutoff

**Second Wave Spectrum:**
- Same parameters with `d_` prefix
- Allows multi-directional seas

### Sky Parameters

- `turbidity`: Atmospheric turbidity (2-20)
- `elevation`: Sun elevation in degrees (0-90)
- `azimuth`: Sun azimuth in degrees (-180-180)
- `rayleigh`: Rayleigh scattering (0-4)
- `mieCoefficient`: Mie scattering (0.001-0.015)
- `mieDirectionalG`: Mie directional factor (0.5-0.9)
- `exposure`: Exposure adjustment (0.5-1.5)

### Atmospheric Parameters

- `fogDensity`: Fog density (0-0.001)
- `fogColor`: RGB color object {r, g, b}
- `rainIntensity`: Rain particle intensity (0-1)

### Ocean Parameters

- `lodScale`: Level-of-detail scale (0-20)
- `wireframe`: Wireframe rendering (boolean)

## YR.no API Integration

### API Endpoint

```
https://api.met.no/weatherapi/locationforecast/2.0/compact
```

### Parameters

- `lat`: Latitude (decimal degrees, -90 to 90)
- `lon`: Longitude (decimal degrees, -180 to 180)
- `altitude`: Elevation in meters (optional)

### Required Headers

```javascript
{
  'User-Agent': 'YourApp/1.0 contact@example.com'
}
```

### Rate Limiting

- Maximum 20 requests per second
- Built-in caching (15 minutes)
- Automatic request throttling

### Data Caching

Weather data is cached for 15 minutes to minimize API requests and improve performance.

## Weather Symbol Mapping

Weather symbol codes from YR.no are mapped to presets:

| Symbol Code | Preset |
|-------------|--------|
| clearsky_* | calm |
| fair_*, partlycloudy_* | moderate |
| cloudy, fog, lightrain, rain | rough |
| heavyrain, sleet, heavysnow, *thunder | storm |

## Troubleshooting

### Weather Data Not Loading

**Issue**: "Failed to fetch weather data"

**Solutions:**
1. Check internet connection
2. Verify coordinates are valid
3. Check browser console for CORS errors
4. Ensure User-Agent header is properly set

### Location Services Not Working

**Issue**: "Failed to get current location"

**Solutions:**
1. Enable location services in browser
2. Grant location permission when prompted
3. Use HTTPS (location API requires secure context)
4. Use manual coordinates as fallback

### Presets Not Saving

**Issue**: Custom presets don't persist

**Solutions:**
1. Check browser localStorage is enabled
2. Verify browser isn't in private/incognito mode
3. Check available storage quota
4. Try exporting preset as JSON backup

### Performance Issues

**Issue**: Rain particles cause lag

**Solutions:**
1. Reduce rain intensity in atmosphere settings
2. Disable auto-update to reduce API calls
3. Use presets instead of live weather for better performance
4. Check GPU capabilities (rain uses WebGPU)

## Advanced Usage

### Custom Weather Mapping

Modify `weather-presets.js` to customize how weather data maps to ocean parameters:

```javascript
export function mapWeatherToOceanParams(weatherData) {
  // Custom mapping logic here
  const windSpeed = weatherData.data.instant.details.wind_speed;

  // Your custom calculations...

  return customParams;
}
```

### Adding Named Locations

Add locations in `weather-service.js`:

```javascript
export const namedLocations = {
  'My Location': { lat: 40.7128, lon: -74.0060, altitude: 10 },
  // ... more locations
};
```

### Creating Preset Variants

Extend `weather-presets.js` with new presets:

```javascript
export const weatherPresets = {
  // ... existing presets

  hurricane: {
    name: "Hurricane",
    description: "Extreme tropical cyclone conditions",
    wave1: { /* parameters */ },
    wave2: { /* parameters */ },
    foam: { /* parameters */ },
    sky: { /* parameters */ },
    atmosphere: { /* parameters */ },
    ocean: { /* parameters */ },
  },
};
```

## API Reference

See inline JSDoc comments in source files for detailed API documentation.

## Future Enhancements

Potential additions:
- Wave buoy data integration
- Historical weather playback
- Forecast timeline scrubbing
- Ocean current visualization
- Marine weather warnings
- Seasonal variations
- Time-of-day lighting
- Weather transitions/interpolation

## License

This weather system is part of the Threejs-WebGPU-IFFT-Ocean project.

## Attribution

Weather data from the Norwegian Meteorological Institute (YR.no).
