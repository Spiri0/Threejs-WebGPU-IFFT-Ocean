'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';
import WaveGeneratorComponent from './WaveGenerator';
import OceanChunks from './OceanChunks';
import Sky from './Sky';
import PlayerController from './PlayerController';

export default function OceanScene() {
  const { gl, scene, camera } = useThree();
  const [waveGenerator, setWaveGenerator] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize wave generator
  useEffect(() => {
    if (!gl || isInitialized) return;

    const initWaveGen = async () => {
      // The wave generator will be initialized by its component
      setIsInitialized(true);
    };

    initWaveGen();
  }, [gl, isInitialized]);

  // Animation loop
  useFrame((state, delta) => {
    const deltaTime = delta * 1000; // Convert to milliseconds

    // Enable all camera layers
    camera.layers.enableAll();
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 100]} intensity={1} castShadow />

      {/* Wave Generator (IFFT Compute) */}
      <WaveGeneratorComponent onInitialized={setWaveGenerator} />

      {/* Ocean Chunks (CDLOD Geometry) */}
      {waveGenerator && <OceanChunks waveGenerator={waveGenerator} />}

      {/* Sky Dome */}
      <Sky />

      {/* Player Controller */}
      <PlayerController />
    </>
  );
}
