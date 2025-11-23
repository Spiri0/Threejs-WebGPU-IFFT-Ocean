# Ocean Weather Presets

This document describes the available ocean and weather presets for the immersive weather system.

## Preset Structure

Each preset contains:
- **Ocean Parameters**: Wave height, wind speed/direction, fetch, swell characteristics
- **Sky/Atmosphere**: Sun position, turbidity, atmospheric scattering, fog
- **Visual Effects**: Foam, lighting, color grading

## Available Presets

### Calm - "Peaceful Waters"
Perfect conditions with minimal waves and clear skies.

**Ocean:**
- Wind Speed: 2 m/s
- Wave Height Scale: 0.3
- Fetch: 50000
- Swell: 0.1
- Peak Enhancement: 2.0

**Sky:**
- Turbidity: 2
- Elevation: 15°
- Rayleigh: 2.5
- Fog: None

**Use Case:** Sunrise/sunset scenes, tranquil environments

---

### Moderate - "Fresh Breeze"
Typical ocean conditions with moderate waves.

**Ocean:**
- Wind Speed: 7 m/s
- Wave Height Scale: 0.7
- Fetch: 150000
- Swell: 0.3
- Peak Enhancement: 3.0

**Sky:**
- Turbidity: 5
- Elevation: 30°
- Rayleigh: 3.0
- Fog: Light

**Use Case:** Normal sailing conditions, general ocean scenes

---

### Rough - "Choppy Seas"
Rough weather with high waves and strong winds.

**Ocean:**
- Wind Speed: 15 m/s
- Wave Height Scale: 1.5
- Fetch: 300000
- Swell: 0.5
- Peak Enhancement: 3.5

**Sky:**
- Turbidity: 12
- Elevation: 45°
- Rayleigh: 3.5
- Fog: Moderate

**Use Case:** Stormy weather, challenging conditions

---

### Storm - "Raging Ocean"
Extreme conditions with massive waves and severe weather.

**Ocean:**
- Wind Speed: 25 m/s
- Wave Height Scale: 2.5
- Fetch: 500000
- Swell: 0.8
- Peak Enhancement: 4.5

**Sky:**
- Turbidity: 20
- Elevation: 10°
- Rayleigh: 4.0
- Fog: Heavy

**Use Case:** Dramatic scenes, extreme weather visualization

---

### Tropical - "Caribbean Paradise"
Warm tropical waters with gentle trade winds.

**Ocean:**
- Wind Speed: 5 m/s
- Wave Height Scale: 0.5
- Fetch: 80000
- Swell: 0.25
- Peak Enhancement: 2.5

**Sky:**
- Turbidity: 3
- Elevation: 60°
- Rayleigh: 2.8
- Fog: Minimal

**Use Case:** Tropical environments, vacation scenes

---

### Arctic - "Icy Waters"
Cold northern waters with variable conditions.

**Ocean:**
- Wind Speed: 10 m/s
- Wave Height Scale: 1.0
- Fetch: 200000
- Swell: 0.4
- Peak Enhancement: 3.2

**Sky:**
- Turbidity: 8
- Elevation: 5°
- Rayleigh: 3.8
- Fog: Variable

**Use Case:** Polar regions, cold climate scenes

---

## Custom Presets

Users can create and save custom presets by:
1. Selecting a base preset
2. Adjusting parameters via the GUI
3. Clicking "Save Custom Preset"
4. Naming the preset

Custom presets are stored in browser localStorage and can be exported/imported as JSON files.

## Parameter Mapping from Weather Data

When using location-based weather from YR.no:

| Weather Condition | Wind Speed | Wave Scale | Swell | Turbidity |
|-------------------|------------|------------|-------|-----------|
| Clear sky         | API value  | 0.3-0.5    | 0.1   | 2-4       |
| Partly cloudy     | API value  | 0.5-0.8    | 0.2   | 5-8       |
| Cloudy            | API value  | 0.7-1.0    | 0.3   | 8-12      |
| Rain              | API value  | 1.0-1.5    | 0.4   | 12-16     |
| Heavy rain        | API value  | 1.5-2.0    | 0.6   | 16-20     |
| Thunderstorm      | API value  | 2.0-2.5    | 0.8   | 18-22     |

## Advanced Wave Parameters

### First Wave Spectrum
Controls primary wave characteristics:
- **depth**: Water depth (affects shallow water waves)
- **scaleHeight**: Overall wave height multiplier
- **windSpeed**: Primary wind speed
- **windDirection**: Primary wind direction (radians)
- **fetch**: Distance over which wind blows (affects wave development)
- **spreadBlend**: Directional spread of waves
- **swell**: Long-period swell component
- **peakEnhancement**: Phillips spectrum peak enhancement
- **shortWaveFade**: Fade out factor for small waves

### Second Wave Spectrum
Controls secondary/crossing waves:
- Same parameters as first spectrum with `d_` prefix
- Allows simulation of complex multi-directional seas

### Foam Parameters
- **foamStrength**: Intensity of foam/whitecaps
- **foamThreshold**: Wave steepness threshold for foam generation

### Ocean Rendering
- **lodScale**: Level-of-detail scaling factor
- **wireframe**: Toggle wireframe rendering
