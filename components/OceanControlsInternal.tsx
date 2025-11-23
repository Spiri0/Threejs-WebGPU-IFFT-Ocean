'use client';

import { useControls, Leva } from 'leva';
import { useEffect } from 'react';
import * as THREE from 'three/webgpu';
// @ts-ignore - JS module
import { wave_constants } from '../src/waves/wave-constants.js';

interface OceanControlsInternalProps {
  waveGenerator: any;
  oceanManager: any;
  onSkyChange?: (params: any) => void;
  onOceanChange?: (params: any) => void;
}

export default function OceanControlsInternal({ waveGenerator, oceanManager, onSkyChange, onOceanChange }: OceanControlsInternalProps) {
  // Build first wave spectrum controls object
  const firstWaveControls: any = {};
  for (const param in wave_constants.FIRST_WAVE_DATASET) {
    if (wave_constants.FIRST_WAVE_DATASET.hasOwnProperty(param)) {
      const borders = wave_constants.FIRST_WAVE_BORDERS[param];
      firstWaveControls[param] = {
        value: wave_constants.FIRST_WAVE_DATASET[param].value,
        min: borders.min,
        max: borders.max,
        step: 0.001,
      };
    }
  }

  // Build second wave spectrum controls object
  const secondWaveControls: any = {};
  for (const param in wave_constants.SECOND_WAVE_DATASET) {
    if (wave_constants.SECOND_WAVE_DATASET.hasOwnProperty(param)) {
      const borders = wave_constants.SECOND_WAVE_BORDERS[param];
      secondWaveControls[param] = {
        value: wave_constants.SECOND_WAVE_DATASET[param].value,
        min: borders.min,
        max: borders.max,
        step: 0.001,
      };
    }
  }

  // First Wave Spectrum Controls
  const firstWaveParams = useControls('First Wave Spectrum', firstWaveControls);

  // Second Wave Spectrum Controls
  const secondWaveParams = useControls('Second Wave Spectrum', secondWaveControls);

  // Foam Controls
  const foamParams = useControls('Foam', {
    strength: {
      value: wave_constants.FOAM_STRENGTH.value,
      min: 0,
      max: 5,
      step: 0.1,
    },
    threshold: {
      value: wave_constants.FOAM_THRESHOLD.value,
      min: 0,
      max: 5,
      step: 0.1,
    },
  });

  // Ocean Controls
  const oceanParams = useControls('Ocean', {
    lodScale: {
      value: wave_constants.LOD_SCALE.value,
      min: 0,
      max: 20,
      step: 0.1,
    },
    wireframe: {
      value: false,
    },
  });

  // Sky Controls
  const skyParams = useControls('Sky', {
    rayleigh: {
      value: 3,
      min: 0,
      max: 4,
      step: 0.001,
    },
    elevation: {
      value: 2,
      min: 0,
      max: 90,
      step: 0.01,
    },
    azimuth: {
      value: 180,
      min: -180,
      max: 180,
      step: 0.1,
    },
    turbidity: {
      value: 10,
      min: 0,
      max: 20,
      step: 0.1,
    },
    mieCoefficient: {
      value: 0.005,
      min: 0,
      max: 0.1,
      step: 0.001,
    },
    mieDirectionalG: {
      value: 0.7,
      min: 0,
      max: 1,
      step: 0.01,
    },
    exposure: {
      value: 1,
      min: 0,
      max: 2,
      step: 0.1,
    },
  });

  // Update wave constants when controls change
  useEffect(() => {
    if (!waveGenerator) return;

    // Update first wave spectrum
    for (const param in firstWaveParams) {
      if (wave_constants.FIRST_WAVE_DATASET[param]) {
        wave_constants.FIRST_WAVE_DATASET[param].value = firstWaveParams[param];
      }
    }

    // Update second wave spectrum
    for (const param in secondWaveParams) {
      if (wave_constants.SECOND_WAVE_DATASET[param]) {
        wave_constants.SECOND_WAVE_DATASET[param].value = secondWaveParams[param];
      }
    }

    // Update foam
    wave_constants.FOAM_STRENGTH.value = foamParams.strength;
    wave_constants.FOAM_THRESHOLD.value = foamParams.threshold;

    // Update LOD scale
    wave_constants.LOD_SCALE.value = oceanParams.lodScale;

    // Update cascades if they exist
    if (waveGenerator.cascades) {
      for (let i in waveGenerator.cascades) {
        waveGenerator.cascades[i].initialSpectrum?.Update();
      }
    }
  }, [firstWaveParams, secondWaveParams, foamParams, oceanParams.lodScale, waveGenerator]);

  // Update sky parameters - directly update the sky material as in the original code
  useEffect(() => {
    if (!oceanManager?.sky_ || !oceanManager?.sun) return;

    const sky = oceanManager.sky_;
    const sun = oceanManager.sun;

    // Update sky material parameters directly (matching original InitSky logic)
    sky.material.colorNode.parameters.rayleigh.value = skyParams.rayleigh;
    sky.material.colorNode.parameters.turbidity.value = skyParams.turbidity;
    sky.material.colorNode.parameters.mieCoefficient.value = skyParams.mieCoefficient;
    sky.material.colorNode.parameters.mieDirectionalG.value = skyParams.mieDirectionalG;
    sky.material.colorNode.parameters.elevation.value = skyParams.elevation;
    sky.material.colorNode.parameters.exposure.value = skyParams.exposure;

    // Update sun position based on elevation and azimuth
    const phi = THREE.MathUtils.degToRad(90 - skyParams.elevation);
    const theta = THREE.MathUtils.degToRad(skyParams.azimuth);
    sun.setFromSphericalCoords(1, phi, theta);
    sky.material.colorNode.parameters.sunPosition.value.copy(sun);
  }, [skyParams, oceanManager]);

  // Update ocean wireframe - directly update the ocean material
  useEffect(() => {
    if (!oceanManager?.material_) return;
    
    oceanManager.material_.wireframe = oceanParams.wireframe;
  }, [oceanParams.wireframe, oceanManager]);

  return <Leva collapsed />;
}

