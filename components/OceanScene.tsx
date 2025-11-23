'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import WaveGeneratorComponent from './WaveGenerator';
import OceanChunks from './OceanChunks';
import Sky from './Sky';
import PlayerController from './PlayerController';

interface OceanSceneProps {
  onWaveGeneratorReady?: (waveGen: any) => void;
  onOceanManagerReady?: (oceanManager: any) => void;
}

export default function OceanScene({ onWaveGeneratorReady, onOceanManagerReady }: OceanSceneProps) {
  const { gl, scene, camera } = useThree();
  const [waveGenerator, setWaveGenerator] = useState<any>(null);
  const [oceanManager, setOceanManager] = useState<any>(null);
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
      {/* Camera Controls - OrbitControls for standard mouse controls */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={1000}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[100, 100, 100]} intensity={1} castShadow />

      {/* Wave Generator (IFFT Compute) */}
      <WaveGeneratorComponent 
        onInitialized={(wg) => {
          setWaveGenerator(wg);
          if (onWaveGeneratorReady) {
            onWaveGeneratorReady(wg);
          }
        }} 
      />

      {/* Ocean Chunks (CDLOD Geometry) - Sky is created here */}
      {waveGenerator && (
        <OceanChunks 
          waveGenerator={waveGenerator} 
          onOceanManagerReady={(manager) => {
            setOceanManager(manager);
            if (onOceanManagerReady) {
              onOceanManagerReady(manager);
            }
          }} 
        />
      )}

      {/* Sky Dome - Removed, sky is created in OceanChunks */}
      {/* <Sky /> */}

      {/* Player Controller - Disabled when using OrbitControls */}
      {/* <PlayerController /> */}
    </>
  );
}
