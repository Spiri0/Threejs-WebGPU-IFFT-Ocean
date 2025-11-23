
# Complete Weather System 

Project Context
---------------

You are working on a **Next.js 15 + React Three Fiber v9 WebGPU ocean simulation project** with the following architecture:

### Current Project Structure

    Threejs-WebGPU-IFFT-Ocean/
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx               # Root layout
    │   ├── page.tsx                 # Home page
    │   ├── globals.css              # Global styles
    │   └── three-setup.ts          # Three.js WebGPU setup
    ├── components/                   # React Three Fiber components
    │   ├── Ocean.tsx                # Main canvas wrapper
    │   ├── OceanScene.tsx           # Scene orchestrator
    │   ├── OceanChunks.tsx          # CDLOD chunk manager (imports src/ocean/ocean.js)
    │   ├── WaveGenerator.tsx        # IFFT cascade system (imports src/waves/wave-generator.js)
    │   ├── Sky.tsx                  # Sky dome (imports src/ocean/sky.js)
    │   ├── OceanControls.tsx         # GUI controls wrapper
    │   ├── OceanControlsInternal.tsx # Leva GUI (imports src/waves/wave-constants.js)
    │   └── PlayerController.tsx      # Camera controls
    ├── src/                          # Core ocean simulation engine (vanilla JS)
    │   ├── ocean/                    # Ocean geometry & materials
    │   │   ├── ocean.js             # OceanChunkManager
    │   │   └── sky.js               # Skybox implementation
    │   └── waves/                   # IFFT wave generation
    │       ├── wave-generator.js    # WaveGenerator component
    │       └── wave-constants.js    # Wave parameters with uniform() values
    ├── resources/                    # Shaders and assets
    │   └── shader/                  # WGSL compute & render shaders
    ├── next.config.js               # Next.js webpack config for WebGPU
    └── package.json                 # Next.js 15.1.1, React 19, R3F 9.0.0

### Key Technical Details

*   **Framework**: Next.js 15.1.1 with App Router (NOT Vite, NOT vanilla JS)
*   **React**: React 19.0.0 with React Three Fiber 9.0.0
*   **Three.js WebGPU**: Uses `three/webgpu` and `three/tsl` (TSL = Three Shading Language)
*   **Build System**: Next.js webpack with custom aliases for Three.js WebGPU builds
*   **Core Engine**: Vanilla JavaScript in `src/` directory, imported by React components
*   **GUI**: Leva library for controls (not lil-gui)
*   **Wave System**: Uses TSL `uniform()` for reactive parameters
*   **Component Pattern**: React functional components with hooks, wrapping vanilla JS modules
*   **Import Pattern**: React components import from `../src/` using `@ts-ignore` for JS modules

* * *

Task: Implement Immersive Weather System
----------------------------------------

Create a comprehensive weather system that integrates real-world meteorological data from YR.no API with the ocean simulation.

### Core Requirements

#### 1\. Weather Presets System

Create **6 built-in presets** that define complete ocean and atmospheric states:

**Preset Definitions** (in `src/weather/weather-presets.js`):

*   **calm**: Peaceful waters, clear skies
    *   Wind: 2 m/s, Wave height scale: 0.3, Fetch: 50000
    *   Sky turbidity: 2, Elevation: 15°
    *   Fog: none, Rain: none
*   **moderate**: Typical ocean conditions
    *   Wind: 7 m/s, Wave height scale: 0.7, Fetch: 150000
    *   Sky turbidity: 5, Elevation: 30°
    *   Fog: light (0.00005), Rain: none
*   **rough**: Choppy seas, strong winds
    *   Wind: 15 m/s, Wave height scale: 1.5, Fetch: 300000
    *   Sky turbidity: 12, Elevation: 25°
    *   Fog: moderate (0.0002), Rain: light (0.3)
*   **storm**: Extreme conditions
    *   Wind: 25 m/s, Wave height scale: 2.5, Fetch: 500000
    *   Sky turbidity: 20, Elevation: 10°
    *   Fog: heavy (0.0005), Rain: heavy (0.8)
*   **tropical**: Warm tropical waters
    *   Wind: 5 m/s, Wave height scale: 0.5, Fetch: 80000
    *   Sky turbidity: 3, Elevation: 60°
    *   Fog: minimal (0.00002), Rain: none
*   **arctic**: Cold northern waters
    *   Wind: 10 m/s, Wave height scale: 1.0, Fetch: 200000
    *   Sky turbidity: 8, Elevation: 5°
    *   Fog: variable (0.0001), Rain: none

Each preset must include:

    {
      name: String,
      description: String,
      wave1: {
        depth, scaleHeight, windSpeed, windDirection,
        fetch, spreadBlend, swell, peakEnhancement,
        shortWaveFade, fadeLimit
      },
      wave2: {
        d_depth, d_scaleHeight, d_windSpeed, d_windDirection,
        d_fetch, d_spreadBlend, d_swell, d_peakEnhancement,
        d_shortWaveFade, d_fadeLimit
      },
      foam: { strength, threshold },
      sky: {
        turbidity, elevation, azimuth, rayleigh,
        mieCoefficient, mieDirectionalG, exposure
      },
      atmosphere: {
        fogDensity, fogColor: {r, g, b}, rainIntensity
      },
      ocean: { lodScale }
    }
    

#### 2\. YR.no Weather API Integration

**Create `src/weather/weather-service.js`**:

**API Details**:

*   Endpoint: `https://api.met.no/weatherapi/locationforecast/2.0/compact`
*   Required header: `User-Agent: Threejs-WebGPU-Ocean/1.0 github.com/ztffn/Threejs-WebGPU-IFFT-Ocean`
*   Parameters: `lat`, `lon`, `altitude` (optional)
*   Response: JSON with timeseries weather data

**Required Features**:

*   `fetchWeather(lat, lon, altitude)`: Fetch weather for coordinates
*   `fetchCurrentLocationWeather()`: Use browser Geolocation API
*   `fetchNamedLocation(name)`: Fetch from predefined locations
*   **Caching**: 15-minute cache using Map
*   **Rate limiting**: Min 1 second between requests
*   `getCurrentConditions(data)`: Extract current weather from response
*   `getForecast(data, hours)`: Get future forecast entries

**Named Locations** (include these):

    {
      'North Atlantic': { lat: 51.5, lon: -30.0 },
      'Caribbean Sea': { lat: 18.0, lon: -75.0 },
      'Pacific Ocean': { lat: 20.0, lon: -155.0 },
      'Mediterranean Sea': { lat: 38.0, lon: 15.0 },
      'Arctic Ocean': { lat: 75.0, lon: 0.0 },
      'Southern Ocean': { lat: -60.0, lon: 0.0 },
      'Oslo, Norway': { lat: 59.91, lon: 10.75 },
      'San Francisco, CA': { lat: 37.77, lon: -122.42 },
      'Sydney, Australia': { lat: -33.87, lon: 151.21 },
      'Tokyo, Japan': { lat: 35.68, lon: 139.76 },
    }
    

**Weather Symbol Mapping** (in weather-presets.js):

    weatherSymbolToPreset = {
      'clearsky_*': 'calm',
      'fair_*', 'partlycloudy_*': 'moderate',
      'cloudy', 'fog', 'lightrain', 'rain': 'rough',
      'heavyrain', 'sleet', 'snow', '*thunder': 'storm'
    }
    

**Weather Data Mapping Function**:

    mapWeatherToOceanParams(weatherData) {
      // Extract: wind_speed, wind_from_direction, cloud_area_fraction,
      //          fog_area_fraction, precipitation_amount, symbol_code
      // Calculate:
      // - Wind scale factor: windSpeed / 10
      // - Turbidity: 2 + (cloudFraction / 100) * 18
      // - Fog density: (fogFraction / 100) * 0.001
      // - Rain intensity: min(precipitation / 5, 1.0)
      // Return modified preset based on symbol_code
    }
    

#### 3\. Atmospheric Effects

**Create `src/weather/atmospheric-effects.js`**:

**Fog System**:

*   Use `THREE.Fog` attached to scene
*   Method: `setFog(density, color)`
*   Dynamic near/far based on density
*   Formula: `far = min(5000 + (1 - density) * 95000, 100000)`

**Rain Particle System**:

*   10,000 particles using `THREE.Points`
*   `THREE.PointsNodeMaterial` with TSL
*   Particle attributes: position, velocity
*   Update particles each frame:
    *   Move based on velocity and deltaTime
    *   Reset when below camera
    *   Keep particles near camera (within 1000 units)
*   Visibility controlled by rain intensity
*   Opacity: `0.3 + intensity * 0.5`

**Class Structure**:

    class AtmosphericEffects {
      constructor({ scene, camera, renderer })
      initFog()
      initRain()
      updateRain(deltaTime)
      setFog(density, color)
      setRain(intensity)
      applyAtmosphericSettings(settings)
      update(deltaTime)
      dispose()
    }
    

#### 4\. Weather Controller with GUI

**Create `src/weather/weather-controller.js`**:

**Class**: `WeatherController extends entity.Component`

**Properties**:

*   `currentPreset`: Current preset name
*   `currentWeatherData`: Live weather data
*   `isLiveWeather`: Boolean flag
*   `autoUpdate`: Boolean for auto-refresh
*   `customPresets`: Object storing custom presets
*   `atmosphericEffects`: AtmosphericEffects instance
*   `weatherInfo`: Display object for GUI

**Methods**:

1.  **Init(params)**: Initialize controller
    
    *   Params: `{ scene, camera, renderer, waveGenerator, oceanManager, gui, guiParams }`
    *   Create atmospheric effects
    *   Create GUI
    *   Apply default preset ('moderate')
2.  **createGUI()**: Build lil-gui interface
    
        Weather System/
        ├── Preset (dropdown: calm/moderate/rough/storm/tropical/arctic)
        ├── Location Weather/
        │   ├── Named Location (dropdown)
        │   ├── Latitude (slider: -90 to 90)
        │   ├── Longitude (slider: -180 to 180)
        │   ├── 🌦️ Fetch Weather (button)
        │   ├── 📍 Use My Location (button)
        │   ├── Auto Update (checkbox)
        │   └── Current Conditions/
        │       ├── Temperature (display)
        │       ├── Wind Speed (display)
        │       ├── Wind Dir (display)
        │       └── Conditions (display)
        └── Custom Presets/
            ├── Preset Name (text input)
            ├── 💾 Save Current Settings (button)
            ├── 📤 Export Settings (button)
            └── 📥 Import Settings (button)
        
    
3.  **applyPreset(name)**: Apply weather preset
    
    *   Get preset data
    *   Apply wave settings to FIRST\_WAVE\_DATASET
    *   Apply wave settings to SECOND\_WAVE\_DATASET
    *   Update foam strength/threshold
    *   Update sky parameters
    *   Apply atmospheric effects
    *   Update wave generator cascades
4.  **applyWaveSettings(waveSettings, dataset)**: Update wave constants
    
    *   Import wave-constants module dynamically
    *   Map preset values to uniform().value properties
    *   Handle 'FIRST' and 'SECOND' dataset keys
5.  **fetchAndApplyWeather()**: Fetch and apply live weather
    
    *   Call weatherService.fetchWeather()
    *   Call mapWeatherToOceanParams()
    *   Update weatherInfo display
    *   Apply to wave/sky/atmosphere systems
6.  **useCurrentLocation()**: Use GPS location
    
    *   Call weatherService.fetchCurrentLocationWeather()
    *   Apply weather data
7.  **setAutoUpdate(enabled)**: Toggle auto-refresh
    
    *   Set 15-minute interval
    *   Clear interval when disabled
8.  **saveCustomPreset()**: Save current settings
    
    *   Call getCurrentSettings()
    *   Validate name (no override of built-ins)
    *   Store in customPresets object
    *   Save to localStorage
9.  **getCurrentSettings()**: Read all current values
    
    *   Import wave-constants dynamically
    *   Read all uniform().value properties
    *   Read sky params from guiParams
    *   Read atmosphere settings
    *   Return preset structure
10.  **exportCurrentSettings()**: Export as JSON
    
    *   Create blob with JSON
    *   Trigger download
11.  **showImportDialog()**: Import preset from file
    
    *   Create file input
    *   Parse JSON
    *   Validate structure
    *   Add to customPresets
    *   Apply preset
12.  **loadCustomPresets()**: Load from localStorage
    
    *   Parse 'ocean-custom-presets' key
    *   Populate customPresets object
13.  **Update\_(deltaTime)**: Called each frame
    
    *   Update atmospheric effects

#### 5\. Integration with Main System

**Modify `src/main.js`**:

1.  Add import:

    import {WeatherController} from './weather/weather-controller.js';
    

2.  In `LoadControllers()`, after ocean initialization:

    //----------------------------Weather System----------------------------------------
    
    const weather = new entity.Entity();
    this.weatherController = new WeatherController();
    await this.weatherController.Init({
      ...basicParams,
      gui: this.gui,
      guiParams: this.guiParams,
      waveGenerator: waves.components_.WaveGenerator,
      oceanManager: this.oceanGeometry,
    });
    weather.AddComponent(this.weatherController);
    this.entityManager.Add(weather, 'weather');
    
    //----------------------------------------------------------------------------------
    

#### 6\. Documentation Files

**Create `.docs/oceanPresets.md`**:

*   Document all 6 presets in detail
*   Parameter reference tables
*   Usage examples
*   Weather-to-ocean mapping table
*   Advanced wave parameter explanations

**Create `docs/weather.md`**:

*   Architecture overview
*   YR.no API integration details
*   Weather-to-ocean mapping logic
*   Location selection methods
*   Time-of-day simulation
*   Error handling
*   API usage guidelines (attribution, rate limits)

**Create `.docs/WEATHER_SYSTEM.md`**:

*   Quick start guide
*   Feature documentation
*   Module structure
*   API reference
*   Parameter reference
*   Troubleshooting section
*   Advanced usage examples

**Update `README.md`**: Add section after header:

    ## ⛈️ New: Immersive Weather System
    
    - 🌊 Weather Presets: Six built-in presets
    - 🌍 Real-Time Weather: YR.no integration
    - 📍 Location Support: GPS/named/custom
    - 💾 Custom Presets: Save and share
    - 🌧️ Atmospheric Effects: Fog and rain
    - 🔄 Auto-Update: 15-min intervals
    

**Update `CHANGELOG.md`**: Add entry for 2025-11-23 with all features

#### 7\. Module Exports

**Create `src/weather/index.js`**:

    export { WeatherController } from './weather-controller.js';
    export { weatherPresets, getPresetNames, getPreset, mapWeatherToOceanParams } from './weather-presets.js';
    export { weatherService, namedLocations } from './weather-service.js';
    export { AtmosphericEffects } from './atmospheric-effects.js';
    

* * *

Technical Requirements
----------------------

### Import Pattern

All files must use:

    import { THREE } from '../three-defs.js';
    import { entity } from '../entity.js';
    

### Wave Constants Access

Access wave parameters via dynamic import:

    import('../waves/wave-constants.js').then(module => {
      const waveConsts = module.wave_constants;
      waveConsts.FIRST_WAVE_DATASET.windSpeed.value = newValue;
    });
    

### TSL Uniforms

Parameters use Three.js TSL uniform() wrapper:

    import { uniform } from "three/tsl";
    const myParam = uniform(10); // Access: myParam.value
    

### Sky Update Pattern

Update sky by finding it in scene and modifying material.colorNode.parameters:

    const sky = scene.children.find(child => child.constructor.name === 'Sky');
    sky.material.colorNode.parameters.turbidity.value = newValue;
    

### Entity Component Pattern

    class MyController extends entity.Component {
      async Init(params) { /* setup */ }
      Update_(deltaTime) { /* per-frame */ }
      Destroy() { /* cleanup */ }
    }
    

* * *

File Structure Output
---------------------

    src/weather/
    ├── index.js                    # Exports
    ├── weather-controller.js       # Main controller (500+ lines)
    ├── weather-presets.js          # Presets + mapping (600+ lines)
    ├── weather-service.js          # API service (200+ lines)
    └── atmospheric-effects.js      # Fog + rain (150+ lines)
    
    .docs/
    ├── oceanPresets.md            # Preset docs (400+ lines)
    ├── weather.md                 # Weather system guide (in docs/)
    └── WEATHER_SYSTEM.md          # Implementation guide (500+ lines)
    

* * *

Testing Checklist
-----------------

After implementation, verify:

*    Preset dropdown works and applies settings
*    Live weather fetch works with coordinates
*    GPS location works (requires HTTPS)
*    Auto-update toggles correctly
*    Custom preset save/load works
*    Export downloads JSON file
*    Import loads preset correctly
*    Fog appears with rough/storm presets
*    Rain particles visible in storm preset
*    Wave heights change with presets
*    Sky turbidity updates correctly
*    Weather info display shows data

* * *

Success Criteria
----------------

The implementation is complete when:

1.  All 6 presets apply correctly and distinctly
2.  YR.no API returns data and maps to ocean params
3.  Custom presets persist in localStorage
4.  Atmospheric effects render correctly
5.  GUI is fully functional and intuitive
6.  Documentation is comprehensive
7.  No console errors in browser
8.  Code follows existing project patterns

* * *

This prompt should produce a complete, production-ready weather system integrated with the existing vanilla JavaScript Three.js WebGPU ocean simulation.