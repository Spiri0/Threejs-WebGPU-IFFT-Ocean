'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
// @ts-ignore - JS module
import { wave_generator } from '../src/waves/wave-generator.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

interface WaveGeneratorProps {
  onInitialized: (waveGen: any) => void;
}

export default function WaveGenerator({ onInitialized }: WaveGeneratorProps) {
  const { gl, scene, camera } = useThree();
  const waveGenRef = useRef<any>(null);
  const guiRef = useRef<GUI | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !gl) return;

    const initWaveGenerator = async () => {
      try {
        // Create GUI
        const gui = new GUI();
        gui.close(); // Start closed
        guiRef.current = gui;

        // Create wave generator
        const waveGen = new wave_generator.WaveGenerator();

        // Initialize with WebGPU renderer
        await waveGen.Init({
          scene,
          camera,
          renderer: gl,
          gui,
        });

        waveGenRef.current = waveGen;
        initializedRef.current = true;

        console.log('Wave generator initialized:', waveGen);
        console.log('Wave generator properties:', {
          hasUpdate: typeof waveGen.Update_ === 'function',
          hasParams: !!waveGen.params_,
          cascades: waveGen.cascades,
          size: waveGen.size,
        });

        // Notify parent component
        onInitialized(waveGen);
      } catch (error) {
        console.error('Failed to initialize wave generator:', error);
        console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      }
    };

    initWaveGenerator();

    return () => {
      // Cleanup GUI on unmount
      if (guiRef.current) {
        guiRef.current.destroy();
      }
    };
  }, [gl, scene, camera, onInitialized]);

  // Update wave generator each frame (will be called from parent via useFrame)
  return null;
}
