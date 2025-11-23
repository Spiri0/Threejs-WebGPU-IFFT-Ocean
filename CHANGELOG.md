# Changelog


## 2025-11-23

### Added
- **Immersive Weather System** with comprehensive features:
  - Six built-in weather presets (Calm, Moderate, Rough, Storm, Tropical, Arctic)
  - Real-time weather integration using YR.no Meteorological Institute API
  - Location-based weather with GPS support and named ocean locations
  - Custom preset creation, saving, and loading
  - Export/import preset functionality (JSON)
  - Atmospheric effects: distance fog and rain particle systems
  - Auto-update mode for continuous weather synchronization (15-min intervals)
  - Weather-to-ocean parameter mapping for realistic wave conditions
  - Integration with existing wave generator and sky systems

- **Weather System Modules:**
  - `weather-controller.js`: Main weather system controller with GUI
  - `weather-presets.js`: Preset definitions and weather mapping logic
  - `weather-service.js`: YR.no API integration with caching
  - `atmospheric-effects.js`: Fog and rain particle effects
  - Weather info display showing temperature, wind, and conditions

- **Documentation:**
  - `.docs/oceanPresets.md`: Detailed preset documentation
  - `docs/weather.md`: Location-based weather system guide
  - `.docs/WEATHER_SYSTEM.md`: Complete implementation guide

### Changed
- Enhanced GUI with Weather System folder containing all weather controls
- Integrated weather updates into main animation loop
- Added fog support to scene rendering

## 2025-08-01

### Fixed
- I've implemented the workgroup size and dispatch size introduced with threejs r179. The previous implementation wasn't yet active on the threejs side.
