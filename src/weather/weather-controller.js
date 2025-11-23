import { THREE } from '../three-defs.js';
import { entity } from '../entity.js';
import { weatherPresets, getPresetNames, getPreset, mapWeatherToOceanParams } from './weather-presets.js';
import { weatherService, namedLocations } from './weather-service.js';
import { AtmosphericEffects } from './atmospheric-effects.js';

export class WeatherController extends entity.Component {
  constructor() {
    super();
    this.currentPreset = null;
    this.currentWeatherData = null;
    this.isLiveWeather = false;
    this.autoUpdate = false;
    this.updateInterval = null;
    this.customPresets = {};
    this.atmosphericEffects = null;

    // Load custom presets from localStorage
    this.loadCustomPresets();
  }

  async Init(params) {
    this.params = params;
    this.scene = params.scene;
    this.camera = params.camera;
    this.renderer = params.renderer;
    this.waveGenerator = params.waveGenerator;
    this.oceanManager = params.oceanManager;
    this.gui = params.gui;
    this.guiParams = params.guiParams;

    // Initialize atmospheric effects
    this.atmosphericEffects = new AtmosphericEffects({
      scene: this.scene,
      camera: this.camera,
      renderer: this.renderer,
    });

    // Create GUI
    this.createGUI();

    // Apply default preset
    this.applyPreset('moderate');
  }

  createGUI() {
    const weatherFolder = this.gui.addFolder('Weather System');

    // Create GUI state object
    this.weatherGUIState = {
      preset: 'moderate',
      customPresetName: 'My Preset',
      location: 'North Atlantic',
      customLat: 59.91,
      customLon: 10.75,
      autoUpdate: false,
      saveCustom: () => this.saveCustomPreset(),
      loadCustom: 'None',
      exportPreset: () => this.exportCurrentSettings(),
      importPreset: () => this.showImportDialog(),
    };

    // Weather info display
    this.weatherInfo = {
      temperature: '--',
      windSpeed: '--',
      windDirection: '--',
      conditions: '--',
    };

    // Preset selector
    const presetNames = getPresetNames();
    weatherFolder.add(this.weatherGUIState, 'preset', presetNames)
      .name('Preset')
      .onChange((value) => {
        this.applyPreset(value);
      });

    // Location-based weather section
    const locationFolder = weatherFolder.addFolder('Location Weather');

    locationFolder.add(this.weatherGUIState, 'location', Object.keys(namedLocations))
      .name('Named Location')
      .onChange(() => {
        // Update custom lat/lon to match
        const loc = namedLocations[this.weatherGUIState.location];
        if (loc) {
          this.weatherGUIState.customLat = loc.lat;
          this.weatherGUIState.customLon = loc.lon;
        }
      });

    locationFolder.add(this.weatherGUIState, 'customLat', -90, 90)
      .name('Latitude')
      .step(0.01);

    locationFolder.add(this.weatherGUIState, 'customLon', -180, 180)
      .name('Longitude')
      .step(0.01);

    locationFolder.add({
      fetchWeather: () => this.fetchAndApplyWeather()
    }, 'fetchWeather')
      .name('🌦️ Fetch Weather');

    locationFolder.add({
      useCurrentLocation: () => this.useCurrentLocation()
    }, 'useCurrentLocation')
      .name('📍 Use My Location');

    locationFolder.add(this.weatherGUIState, 'autoUpdate')
      .name('Auto Update (15min)')
      .onChange((value) => {
        this.setAutoUpdate(value);
      });

    // Weather info display
    const infoFolder = locationFolder.addFolder('Current Conditions');
    infoFolder.add(this.weatherInfo, 'temperature').name('Temperature').listen().disable();
    infoFolder.add(this.weatherInfo, 'windSpeed').name('Wind Speed').listen().disable();
    infoFolder.add(this.weatherInfo, 'windDirection').name('Wind Dir').listen().disable();
    infoFolder.add(this.weatherInfo, 'conditions').name('Conditions').listen().disable();
    infoFolder.close();

    // Custom preset management
    const customFolder = weatherFolder.addFolder('Custom Presets');

    customFolder.add(this.weatherGUIState, 'customPresetName')
      .name('Preset Name');

    customFolder.add(this.weatherGUIState, 'saveCustom')
      .name('💾 Save Current Settings');

    // Load custom preset dropdown
    this.updateCustomPresetList();

    customFolder.add(this.weatherGUIState, 'exportPreset')
      .name('📤 Export Settings');

    customFolder.add(this.weatherGUIState, 'importPreset')
      .name('📥 Import Settings');

    customFolder.close();
    locationFolder.close();
    weatherFolder.close();
  }

  updateCustomPresetList() {
    const customNames = Object.keys(this.customPresets);
    if (customNames.length > 0 && this.gui) {
      // We'll handle this through the save/load mechanism
      console.log('Custom presets available:', customNames);
    }
  }

  applyPreset(presetName) {
    const preset = this.customPresets[presetName] || getPreset(presetName);
    if (!preset) {
      console.error('Preset not found:', presetName);
      return;
    }

    this.currentPreset = presetName;
    this.isLiveWeather = false;

    console.log(`Applying weather preset: ${preset.name || presetName}`);

    // Apply wave settings to first spectrum
    this.applyWaveSettings(preset.wave1, 'FIRST');

    // Apply wave settings to second spectrum
    this.applyWaveSettings(preset.wave2, 'SECOND');

    // Apply foam settings
    if (preset.foam) {
      this.waveGenerator.foamStrength.value = preset.foam.strength;
      this.waveGenerator.foamThreshold.value = preset.foam.threshold;
    }

    // Apply sky settings
    if (preset.sky && this.guiParams.sky) {
      Object.assign(this.guiParams.sky, preset.sky);
      // Sky uniforms will be updated by the ocean manager's GUI listeners
      this.updateSkyUniforms();
    }

    // Apply atmospheric effects
    if (preset.atmosphere) {
      this.atmosphericEffects.applyAtmosphericSettings(preset.atmosphere);
    }

    // Apply ocean settings
    if (preset.ocean) {
      this.waveGenerator.lodScale.value = preset.ocean.lodScale;
    }

    // Update wave generator
    for (let i in this.waveGenerator.cascades) {
      this.waveGenerator.cascades[i].initialSpectrum.Update();
    }
  }

  applyWaveSettings(waveSettings, dataset) {
    const targetDataset = dataset === 'FIRST' ?
      this.waveGenerator.params_.gui.controllers.find(c => c._name === 'firstWaveSpectrum') :
      this.waveGenerator.params_.gui.controllers.find(c => c._name === 'secondWaveSpectrum');

    const constants = dataset === 'FIRST' ?
      this.waveGenerator.waveSettings :
      this.waveGenerator.waveSettings;

    // Map preset settings to wave constants
    const mapping = dataset === 'FIRST' ? {
      depth: 'depth',
      scaleHeight: 'scaleHeight',
      windSpeed: 'windSpeed',
      windDirection: 'windDirection',
      fetch: 'fetch',
      spreadBlend: 'spreadBlend',
      swell: 'swell',
      peakEnhancement: 'peakEnhancement',
      shortWaveFade: 'shortWaveFade',
      fadeLimit: 'fadeLimit',
    } : {
      d_depth: 'depth',
      d_scaleHeight: 'scaleHeight',
      d_windSpeed: 'windSpeed',
      d_windDirection: 'windDirection',
      d_fetch: 'fetch',
      d_spreadBlend: 'spreadBlend',
      d_swell: 'swell',
      d_peakEnhancement: 'peakEnhancement',
      d_shortWaveFade: 'shortWaveFade',
      d_fadeLimit: 'fadeLimit',
    };

    // Get the wave constants module
    const waveConstants = this.waveGenerator.waveSettings;
    const datasetKey = dataset === 'FIRST' ? 'FIRST_WAVE_DATASET' : 'SECOND_WAVE_DATASET';

    // Import wave_constants to get access to the datasets
    import('../waves/wave-constants.js').then(module => {
      const targetConstants = module.wave_constants[datasetKey];

      for (const [presetKey, constantKey] of Object.entries(mapping)) {
        if (waveSettings[presetKey] !== undefined && targetConstants[constantKey]) {
          targetConstants[constantKey].value = waveSettings[presetKey];
        }
      }
    });
  }

  updateSkyUniforms() {
    // The sky uniforms are updated through the existing GUI change listeners
    // We just need to trigger the changes
    if (this.oceanManager && this.oceanManager.params_ && this.oceanManager.params_.scene) {
      // Find the sky object
      const sky = this.oceanManager.params_.scene.children.find(
        child => child.constructor.name === 'Sky'
      );

      if (sky && sky.material && sky.material.colorNode && this.guiParams.sky) {
        const params = this.guiParams.sky;

        sky.material.colorNode.parameters.turbidity.value = params.turbidity;
        sky.material.colorNode.parameters.mieCoefficient.value = params.mieCoefficient;
        sky.material.colorNode.parameters.mieDirectionalG.value = params.mieDirectionalG;
        sky.material.colorNode.parameters.elevation.value = params.elevation;
        sky.material.colorNode.parameters.rayleigh.value = params.rayleigh;

        const phi = THREE.MathUtils.degToRad(90 - params.elevation);
        const theta = THREE.MathUtils.degToRad(params.azimuth);
        const sun = new THREE.Vector3();
        sun.setFromSphericalCoords(1, phi, theta);
        sky.material.colorNode.parameters.sunPosition.value.copy(sun);
      }
    }
  }

  async fetchAndApplyWeather() {
    try {
      console.log(`Fetching weather for ${this.weatherGUIState.customLat}, ${this.weatherGUIState.customLon}`);

      const weatherData = await weatherService.fetchWeather(
        this.weatherGUIState.customLat,
        this.weatherGUIState.customLon,
        0
      );

      this.applyWeatherData(weatherData);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
      alert('Failed to fetch weather data. Check console for details.');
    }
  }

  async useCurrentLocation() {
    try {
      console.log('Fetching current location weather...');
      const weatherData = await weatherService.fetchCurrentLocationWeather();
      this.applyWeatherData(weatherData);
    } catch (error) {
      console.error('Failed to fetch current location weather:', error);
      alert('Failed to get current location. Please enable location services or use manual coordinates.');
    }
  }

  applyWeatherData(weatherData) {
    this.currentWeatherData = weatherData;
    this.isLiveWeather = true;

    const conditions = weatherService.getCurrentConditions(weatherData);
    const oceanParams = mapWeatherToOceanParams(conditions);

    console.log('Applying live weather data:', oceanParams);

    // Update weather info display
    if (oceanParams.weatherInfo) {
      this.weatherInfo.temperature = `${oceanParams.weatherInfo.temperature?.toFixed(1) || '--'} °C`;
      this.weatherInfo.windSpeed = `${oceanParams.weatherInfo.windSpeed?.toFixed(1) || '--'} m/s`;
      this.weatherInfo.windDirection = `${oceanParams.weatherInfo.windDirection?.toFixed(0) || '--'}°`;
      this.weatherInfo.conditions = oceanParams.weatherInfo.symbolCode || '--';
    }

    // Apply the weather parameters as if it were a preset
    const weatherPreset = {
      name: 'Live Weather',
      wave1: oceanParams.wave1,
      wave2: oceanParams.wave2,
      foam: oceanParams.foam,
      sky: oceanParams.sky,
      atmosphere: oceanParams.atmosphere,
      ocean: oceanParams.ocean,
    };

    // Store current preset name
    const originalPreset = this.currentPreset;

    // Apply the weather preset
    this.applyPreset('moderate'); // Start with moderate as base
    this.currentPreset = 'live-weather';

    // Then override with actual weather data
    this.applyWaveSettings(oceanParams.wave1, 'FIRST');
    this.applyWaveSettings(oceanParams.wave2, 'SECOND');

    if (oceanParams.foam) {
      this.waveGenerator.foamStrength.value = oceanParams.foam.strength;
      this.waveGenerator.foamThreshold.value = oceanParams.foam.threshold;
    }

    if (oceanParams.sky) {
      Object.assign(this.guiParams.sky, oceanParams.sky);
      this.updateSkyUniforms();
    }

    if (oceanParams.atmosphere) {
      this.atmosphericEffects.applyAtmosphericSettings(oceanParams.atmosphere);
    }

    // Update wave generator
    for (let i in this.waveGenerator.cascades) {
      this.waveGenerator.cascades[i].initialSpectrum.Update();
    }
  }

  setAutoUpdate(enabled) {
    this.autoUpdate = enabled;

    if (enabled) {
      // Fetch weather immediately
      this.fetchAndApplyWeather();

      // Set up periodic updates (15 minutes)
      this.updateInterval = setInterval(() => {
        this.fetchAndApplyWeather();
      }, 15 * 60 * 1000);

      console.log('Auto weather update enabled (15 min interval)');
    } else {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      console.log('Auto weather update disabled');
    }
  }

  saveCustomPreset() {
    const name = this.weatherGUIState.customPresetName.trim();

    if (!name) {
      alert('Please enter a preset name');
      return;
    }

    if (getPresetNames().includes(name)) {
      alert('Cannot overwrite built-in presets. Choose a different name.');
      return;
    }

    // Gather current settings
    const currentSettings = this.getCurrentSettings();

    this.customPresets[name] = {
      name: name,
      description: 'Custom preset',
      ...currentSettings,
    };

    // Save to localStorage
    this.saveCustomPresetsToStorage();

    console.log(`Saved custom preset: ${name}`);
    alert(`Preset "${name}" saved successfully!`);

    this.updateCustomPresetList();
  }

  getCurrentSettings() {
    // Import wave constants to read current values
    return import('../waves/wave-constants.js').then(module => {
      const waveConsts = module.wave_constants;

      return {
        wave1: {
          depth: waveConsts.FIRST_WAVE_DATASET.depth.value,
          scaleHeight: waveConsts.FIRST_WAVE_DATASET.scaleHeight.value,
          windSpeed: waveConsts.FIRST_WAVE_DATASET.windSpeed.value,
          windDirection: waveConsts.FIRST_WAVE_DATASET.windDirection.value,
          fetch: waveConsts.FIRST_WAVE_DATASET.fetch.value,
          spreadBlend: waveConsts.FIRST_WAVE_DATASET.spreadBlend.value,
          swell: waveConsts.FIRST_WAVE_DATASET.swell.value,
          peakEnhancement: waveConsts.FIRST_WAVE_DATASET.peakEnhancement.value,
          shortWaveFade: waveConsts.FIRST_WAVE_DATASET.shortWaveFade.value,
          fadeLimit: waveConsts.FIRST_WAVE_DATASET.fadeLimit.value,
        },
        wave2: {
          d_depth: waveConsts.SECOND_WAVE_DATASET.d_depth.value,
          d_scaleHeight: waveConsts.SECOND_WAVE_DATASET.d_scaleHeight.value,
          d_windSpeed: waveConsts.SECOND_WAVE_DATASET.d_windSpeed.value,
          d_windDirection: waveConsts.SECOND_WAVE_DATASET.d_windDirection.value,
          d_fetch: waveConsts.SECOND_WAVE_DATASET.d_fetch.value,
          d_spreadBlend: waveConsts.SECOND_WAVE_DATASET.d_spreadBlend.value,
          d_swell: waveConsts.SECOND_WAVE_DATASET.d_swell.value,
          d_peakEnhancement: waveConsts.SECOND_WAVE_DATASET.d_peakEnhancement.value,
          d_shortWaveFade: waveConsts.SECOND_WAVE_DATASET.d_shortWaveFade.value,
          d_fadeLimit: waveConsts.SECOND_WAVE_DATASET.d_fadeLimit.value,
        },
        foam: {
          strength: waveConsts.FOAM_STRENGTH.value,
          threshold: waveConsts.FOAM_THRESHOLD.value,
        },
        sky: { ...this.guiParams.sky },
        atmosphere: {
          fogDensity: this.atmosphericEffects.currentFogDensity,
          fogColor: this.scene.fog ? {
            r: this.scene.fog.color.r,
            g: this.scene.fog.color.g,
            b: this.scene.fog.color.b,
          } : { r: 0.9, g: 0.93, b: 0.98 },
          rainIntensity: this.atmosphericEffects.currentRainIntensity,
        },
        ocean: {
          lodScale: waveConsts.LOD_SCALE.value,
        },
      };
    });
  }

  loadCustomPresets() {
    try {
      const stored = localStorage.getItem('ocean-custom-presets');
      if (stored) {
        this.customPresets = JSON.parse(stored);
        console.log('Loaded custom presets:', Object.keys(this.customPresets));
      }
    } catch (error) {
      console.error('Failed to load custom presets:', error);
    }
  }

  saveCustomPresetsToStorage() {
    try {
      localStorage.setItem('ocean-custom-presets', JSON.stringify(this.customPresets));
    } catch (error) {
      console.error('Failed to save custom presets:', error);
    }
  }

  exportCurrentSettings() {
    this.getCurrentSettings().then(settings => {
      const preset = {
        name: this.weatherGUIState.customPresetName,
        description: 'Exported preset',
        ...settings,
      };

      const dataStr = JSON.stringify(preset, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `ocean-preset-${preset.name.replace(/\s+/g, '-')}.json`;
      link.click();

      URL.revokeObjectURL(url);

      console.log('Exported preset:', preset.name);
    });
  }

  showImportDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const preset = JSON.parse(event.target.result);

          // Validate preset structure
          if (!preset.wave1 || !preset.wave2) {
            throw new Error('Invalid preset format');
          }

          // Add to custom presets
          const name = preset.name || 'Imported Preset';
          this.customPresets[name] = preset;
          this.saveCustomPresetsToStorage();

          console.log('Imported preset:', name);
          alert(`Preset "${name}" imported successfully!`);

          // Apply the imported preset
          this.applyPreset(name);
          this.weatherGUIState.preset = name;

          this.updateCustomPresetList();
        } catch (error) {
          console.error('Failed to import preset:', error);
          alert('Failed to import preset. Please check the file format.');
        }
      };

      reader.readAsText(file);
    };

    input.click();
  }

  Update_(deltaTime) {
    if (this.atmosphericEffects) {
      this.atmosphericEffects.update(deltaTime);
    }
  }

  Destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.atmosphericEffects) {
      this.atmosphericEffects.dispose();
    }
  }
}
