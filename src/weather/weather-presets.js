import { uniform } from "three/tsl";

export const weatherPresets = {

  calm: {
    name: "Calm - Peaceful Waters",
    description: "Perfect conditions with minimal waves and clear skies",

    // First wave spectrum
    wave1: {
      depth: 20,
      scaleHeight: 0.3,
      windSpeed: 2,
      windDirection: 0,
      fetch: 50000,
      spreadBlend: 0.8,
      swell: 0.1,
      peakEnhancement: 2.0,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    // Second wave spectrum
    wave2: {
      d_depth: 20,
      d_scaleHeight: 0.2,
      d_windSpeed: 1.5,
      d_windDirection: Math.PI / 4,
      d_fetch: 30000,
      d_spreadBlend: 0.7,
      d_swell: 0.05,
      d_peakEnhancement: 2.0,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    // Foam settings
    foam: {
      strength: 0.3,
      threshold: 3.5,
    },

    // Sky settings
    sky: {
      turbidity: 2,
      elevation: 15,
      azimuth: 180,
      rayleigh: 2.5,
      mieCoefficient: 0.003,
      mieDirectionalG: 0.7,
      exposure: 1.0,
    },

    // Atmospheric effects
    atmosphere: {
      fogDensity: 0.0,
      fogColor: { r: 0.95, g: 0.97, b: 1.0 },
      rainIntensity: 0.0,
    },

    // Ocean rendering
    ocean: {
      lodScale: 3.7,
    }
  },

  moderate: {
    name: "Moderate - Fresh Breeze",
    description: "Typical ocean conditions with moderate waves",

    wave1: {
      depth: 20,
      scaleHeight: 0.7,
      windSpeed: 7,
      windDirection: 0,
      fetch: 150000,
      spreadBlend: 1.0,
      swell: 0.3,
      peakEnhancement: 3.0,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    wave2: {
      d_depth: 20,
      d_scaleHeight: 0.5,
      d_windSpeed: 5,
      d_windDirection: Math.PI / 3,
      d_fetch: 100000,
      d_spreadBlend: 0.9,
      d_swell: 0.2,
      d_peakEnhancement: 2.8,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    foam: {
      strength: 0.6,
      threshold: 2.8,
    },

    sky: {
      turbidity: 5,
      elevation: 30,
      azimuth: 180,
      rayleigh: 3.0,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      exposure: 1.0,
    },

    atmosphere: {
      fogDensity: 0.00005,
      fogColor: { r: 0.9, g: 0.93, b: 0.98 },
      rainIntensity: 0.0,
    },

    ocean: {
      lodScale: 4.0,
    }
  },

  rough: {
    name: "Rough - Choppy Seas",
    description: "Rough weather with high waves and strong winds",

    wave1: {
      depth: 20,
      scaleHeight: 1.5,
      windSpeed: 15,
      windDirection: 0,
      fetch: 300000,
      spreadBlend: 1.0,
      swell: 0.5,
      peakEnhancement: 3.5,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    wave2: {
      d_depth: 20,
      d_scaleHeight: 1.2,
      d_windSpeed: 12,
      d_windDirection: Math.PI / 2.5,
      d_fetch: 250000,
      d_spreadBlend: 1.0,
      d_swell: 0.4,
      d_peakEnhancement: 3.3,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    foam: {
      strength: 1.2,
      threshold: 2.2,
    },

    sky: {
      turbidity: 12,
      elevation: 25,
      azimuth: 180,
      rayleigh: 3.5,
      mieCoefficient: 0.008,
      mieDirectionalG: 0.75,
      exposure: 0.9,
    },

    atmosphere: {
      fogDensity: 0.0002,
      fogColor: { r: 0.7, g: 0.75, b: 0.8 },
      rainIntensity: 0.3,
    },

    ocean: {
      lodScale: 4.5,
    }
  },

  storm: {
    name: "Storm - Raging Ocean",
    description: "Extreme conditions with massive waves and severe weather",

    wave1: {
      depth: 20,
      scaleHeight: 2.5,
      windSpeed: 25,
      windDirection: 0,
      fetch: 500000,
      spreadBlend: 1.0,
      swell: 0.8,
      peakEnhancement: 4.5,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    wave2: {
      d_depth: 20,
      d_scaleHeight: 2.0,
      d_windSpeed: 20,
      d_windDirection: Math.PI / 2,
      d_fetch: 400000,
      d_spreadBlend: 1.0,
      d_swell: 0.7,
      d_peakEnhancement: 4.0,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    foam: {
      strength: 2.5,
      threshold: 1.5,
    },

    sky: {
      turbidity: 20,
      elevation: 10,
      azimuth: 180,
      rayleigh: 4.0,
      mieCoefficient: 0.012,
      mieDirectionalG: 0.8,
      exposure: 0.7,
    },

    atmosphere: {
      fogDensity: 0.0005,
      fogColor: { r: 0.5, g: 0.55, b: 0.6 },
      rainIntensity: 0.8,
    },

    ocean: {
      lodScale: 5.0,
    }
  },

  tropical: {
    name: "Tropical - Caribbean Paradise",
    description: "Warm tropical waters with gentle trade winds",

    wave1: {
      depth: 20,
      scaleHeight: 0.5,
      windSpeed: 5,
      windDirection: Math.PI / 6,
      fetch: 80000,
      spreadBlend: 0.9,
      swell: 0.25,
      peakEnhancement: 2.5,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    wave2: {
      d_depth: 20,
      d_scaleHeight: 0.3,
      d_windSpeed: 3,
      d_windDirection: Math.PI / 4,
      d_fetch: 50000,
      d_spreadBlend: 0.8,
      d_swell: 0.15,
      d_peakEnhancement: 2.3,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    foam: {
      strength: 0.4,
      threshold: 3.0,
    },

    sky: {
      turbidity: 3,
      elevation: 60,
      azimuth: 180,
      rayleigh: 2.8,
      mieCoefficient: 0.004,
      mieDirectionalG: 0.65,
      exposure: 1.1,
    },

    atmosphere: {
      fogDensity: 0.00002,
      fogColor: { r: 0.92, g: 0.96, b: 1.0 },
      rainIntensity: 0.0,
    },

    ocean: {
      lodScale: 3.5,
    }
  },

  arctic: {
    name: "Arctic - Icy Waters",
    description: "Cold northern waters with variable conditions",

    wave1: {
      depth: 20,
      scaleHeight: 1.0,
      windSpeed: 10,
      windDirection: 0,
      fetch: 200000,
      spreadBlend: 1.0,
      swell: 0.4,
      peakEnhancement: 3.2,
      shortWaveFade: 0.0,
      fadeLimit: 0.0,
    },

    wave2: {
      d_depth: 20,
      d_scaleHeight: 0.8,
      d_windSpeed: 8,
      d_windDirection: Math.PI / 3,
      d_fetch: 150000,
      d_spreadBlend: 0.95,
      d_swell: 0.3,
      d_peakEnhancement: 3.0,
      d_shortWaveFade: 0.0,
      d_fadeLimit: 0.0,
    },

    foam: {
      strength: 0.8,
      threshold: 2.5,
    },

    sky: {
      turbidity: 8,
      elevation: 5,
      azimuth: 180,
      rayleigh: 3.8,
      mieCoefficient: 0.006,
      mieDirectionalG: 0.72,
      exposure: 0.95,
    },

    atmosphere: {
      fogDensity: 0.0001,
      fogColor: { r: 0.85, g: 0.9, b: 0.95 },
      rainIntensity: 0.0,
    },

    ocean: {
      lodScale: 4.2,
    }
  },
};

// Helper function to get preset names
export function getPresetNames() {
  return Object.keys(weatherPresets);
}

// Helper function to get preset by name
export function getPreset(name) {
  return weatherPresets[name] || weatherPresets.moderate;
}

// Helper function to create a custom preset from current settings
export function createCustomPreset(name, description, currentSettings) {
  return {
    name: name,
    description: description,
    ...currentSettings,
  };
}

// Map weather symbol codes to presets
export const weatherSymbolToPreset = {
  'clearsky_day': 'calm',
  'clearsky_night': 'calm',
  'clearsky_polartwilight': 'calm',
  'fair_day': 'moderate',
  'fair_night': 'moderate',
  'fair_polartwilight': 'moderate',
  'partlycloudy_day': 'moderate',
  'partlycloudy_night': 'moderate',
  'partlycloudy_polartwilight': 'moderate',
  'cloudy': 'rough',
  'fog': 'rough',
  'lightrain': 'rough',
  'rain': 'rough',
  'heavyrain': 'storm',
  'lightrainshowers_day': 'moderate',
  'lightrainshowers_night': 'moderate',
  'lightrainshowers_polartwilight': 'moderate',
  'rainshowers_day': 'rough',
  'rainshowers_night': 'rough',
  'rainshowers_polartwilight': 'rough',
  'heavyrainshowers_day': 'storm',
  'heavyrainshowers_night': 'storm',
  'heavyrainshowers_polartwilight': 'storm',
  'sleet': 'storm',
  'snow': 'rough',
  'heavysnow': 'storm',
  'lightsnowshowers_day': 'moderate',
  'lightsnowshowers_night': 'moderate',
  'lightsnowshowers_polartwilight': 'moderate',
  'snowshowers_day': 'rough',
  'snowshowers_night': 'rough',
  'snowshowers_polartwilight': 'rough',
  'heavysnowshowers_day': 'storm',
  'heavysnowshowers_night': 'storm',
  'heavysnowshowers_polartwilight': 'storm',
  'rainandthunder': 'storm',
  'heavyrainandthunder': 'storm',
  'sleetandthunder': 'storm',
  'snowandthunder': 'storm',
};

// Map weather conditions to ocean parameters
export function mapWeatherToOceanParams(weatherData) {
  const instant = weatherData.data.instant.details;
  const nextHour = weatherData.data.next_1_hours;

  // Get base preset from weather symbol
  let basePresetName = 'moderate';
  if (nextHour && nextHour.summary && nextHour.summary.symbol_code) {
    basePresetName = weatherSymbolToPreset[nextHour.summary.symbol_code] || 'moderate';
  }

  const basePreset = getPreset(basePresetName);

  // Modify based on actual wind data
  const windSpeed = instant.wind_speed || 5;
  const windDirection = instant.wind_from_direction || 0;
  const windDirRadians = (windDirection / 360.0) * 2 * Math.PI;

  // Calculate scale factor based on wind speed
  const windScale = Math.min(windSpeed / 10, 2.5);

  // Cloud coverage affects turbidity
  const cloudFraction = instant.cloud_area_fraction || 50;
  const turbidity = 2 + (cloudFraction / 100) * 18;

  // Fog affects visibility
  const fogFraction = instant.fog_area_fraction || 0;
  const fogDensity = (fogFraction / 100) * 0.001;

  // Precipitation affects rain intensity
  const precipitation = nextHour?.details?.precipitation_amount || 0;
  const rainIntensity = Math.min(precipitation / 5, 1.0);

  return {
    wave1: {
      ...basePreset.wave1,
      windSpeed: windSpeed,
      windDirection: windDirRadians,
      scaleHeight: basePreset.wave1.scaleHeight * windScale,
    },
    wave2: {
      ...basePreset.wave2,
      d_windSpeed: windSpeed * 0.7,
      d_windDirection: windDirRadians + Math.PI / 4,
      d_scaleHeight: basePreset.wave2.d_scaleHeight * windScale,
    },
    foam: basePreset.foam,
    sky: {
      ...basePreset.sky,
      turbidity: turbidity,
    },
    atmosphere: {
      ...basePreset.atmosphere,
      fogDensity: fogDensity,
      rainIntensity: rainIntensity,
    },
    ocean: basePreset.ocean,
    weatherInfo: {
      temperature: instant.air_temperature,
      windSpeed: windSpeed,
      windDirection: windDirection,
      cloudCover: cloudFraction,
      precipitation: precipitation,
      symbolCode: nextHour?.summary?.symbol_code || 'unknown',
    }
  };
}
