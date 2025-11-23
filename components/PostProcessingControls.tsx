'use client';

import { useControls } from 'leva';
import { useEffect } from 'react';
import * as THREE from 'three/webgpu';

interface PostProcessingControlsProps {
  onPostProcessingChange?: (settings: any) => void;
}

export default function PostProcessingControls({
  onPostProcessingChange,
}: PostProcessingControlsProps) {
  // Main post-processing toggle
  const { enabled } = useControls('Post Processing', {
    enabled: {
      value: false,
      label: 'Enable',
    },
  });

  // Bloom controls
  const bloomControls = useControls('Bloom', {
    enabled: {
      value: false,
    },
    intensity: {
      value: 1.0,
      min: 0,
      max: 5,
      step: 0.1,
    },
    threshold: {
      value: 0.9,
      min: 0,
      max: 1,
      step: 0.01,
    },
    smoothing: {
      value: 1.0,
      min: 0,
      max: 10,
      step: 0.1,
    },
  });

  // Tone mapping controls
  const toneMappingControls = useControls('Tone Mapping', {
    enabled: {
      value: true,
    },
    exposure: {
      value: 1.0,
      min: 0,
      max: 3,
      step: 0.1,
    },
    mode: {
      value: THREE.ACESFilmicToneMapping,
      options: {
        None: THREE.NoToneMapping,
        Linear: THREE.LinearToneMapping,
        Reinhard: THREE.ReinhardToneMapping,
        Cineon: THREE.CineonToneMapping,
        'ACES Filmic': THREE.ACESFilmicToneMapping,
      },
    },
  });

  // Vignette controls
  const vignetteControls = useControls('Vignette', {
    enabled: {
      value: false,
    },
    offset: {
      value: 0.5,
      min: 0,
      max: 1,
      step: 0.01,
    },
    intensity: {
      value: -0.5,
      min: -1,
      max: 1,
      step: 0.01,
      label: 'Intensity (-Black/+White)',
    },
  });

  // Notify parent component of changes
  useEffect(() => {
    if (onPostProcessingChange) {
      onPostProcessingChange({
        enabled,
        bloom: bloomControls,
        toneMapping: toneMappingControls,
        vignette: vignetteControls,
      });
    }
  }, [
    enabled,
    bloomControls,
    toneMappingControls,
    vignetteControls,
    onPostProcessingChange,
  ]);

  return null; // Leva renders its own UI
}

